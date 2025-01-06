const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_CLIENT_ID;
const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxAge: 86400000,
    rateLimit: true
});

const ROLES = {
    ADMIN: 'Admin',
    USER: 'User'
};

async function validateJwt(req, context, requiredRole = null) {
    try {
        // WICHTIG: Prüfe BEIDE möglichen Token-Quellen
        const aadToken = req.headers.get('x-ms-token-aad-access-token') || 
                        req.headers.get('x-ms-access-token');
        const authHeader = req.headers.get('authorization');
        
        // Debug logging
        context.log('Available Headers:', Object.fromEntries(req.headers.entries()));
        context.log('Token Sources:', { aadToken: !!aadToken, authHeader: !!authHeader });

        const token = aadToken || (authHeader ? authHeader.split(' ')[1] : null);

        if (!token) {
            throw { status: 401, body: 'Kein gültiges Token gefunden' };
        }

        const decodedToken = jwt.decode(token, { complete: true });
        
        if (!decodedToken) {
            throw { status: 401, body: 'Token konnte nicht dekodiert werden' };
        }

        context.log('Decoded Token:', {
            header: decodedToken.header,
            payload: decodedToken.payload
        });

        const validationOptions = {
            audience: CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
            algorithms: ['RS256']
        };

        const decoded = await new Promise((resolve, reject) => {
            const kid = decodedToken.header.kid;
            
            if (!kid) {
                reject({ status: 401, body: 'Keine KID im Token Header gefunden' });
                return;
            }

            client.getSigningKey(kid, (err, key) => {
                if (err) {
                    context.log('JWKS Error:', err);
                    reject({ status: 401, body: 'Token Validierungsfehler: ' + err.message });
                    return;
                }
                
                const signingKey = key.getPublicKey();
                
                jwt.verify(token, signingKey, validationOptions, (err, decoded) => {
                    if (err) {
                        context.log('Verify Error:', err);
                        reject({
                            status: 401,
                            body: `Token ungültig: ${err.message}`
                        });
                        return;
                    }
                    resolve(decoded);
                });
            });
        });

        // Rollenvalidierung
        if (!decoded.roles || !Array.isArray(decoded.roles) || decoded.roles.length === 0) {
            throw { status: 403, body: 'Keine Rollen im Token gefunden' };
        }

        // Admin-Check
        if (requiredRole === ROLES.ADMIN && !decoded.roles.includes(ROLES.ADMIN)) {
            throw { status: 403, body: 'Admin-Rechte erforderlich' };
        }

        // Allgemeine Rollenprüfung
        const hasValidRole = decoded.roles.some(role => 
            Object.values(ROLES).includes(role)
        );

        if (!hasValidRole) {
            throw { status: 403, body: 'Keine gültige Rolle gefunden' };
        }

        return decoded;

    } catch (error) {
        context.log('Error in validateJwt:', {
            error: error,
            status: error.status,
            message: error.message,
            body: error.body
        });

        throw {
            status: error.status || 500,
            body: error.body || `Interner Fehler bei der Token-Validierung: ${error.message}`
        };
    }
}

function requireRole(role) {
    return async (req, context) => {
        await validateJwt(req, context, role);
    };
}

module.exports = { validateJwt, requireRole, ROLES };