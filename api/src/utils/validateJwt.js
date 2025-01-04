const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_CLIENT_ID;

const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`
});

const ROLES = {
    ADMIN: 'Admin',
    USER: 'User'
};

async function validateJwt(req, context, requiredRole = null) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw { status: 401, body: 'Kein Authorization Header' };
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.decode(token, { complete: true });
        
        if (!decodedToken) {
            throw { status: 401, body: 'Token konnte nicht dekodiert werden' };
        }

        const validationOptions = {
            audience: CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
            algorithms: ['RS256']
        };

        const decoded = await new Promise((resolve, reject) => {
            const kid = decodedToken.header.kid;
            client.getSigningKey(kid, (err, key) => {
                if (err) {
                    reject({ status: 401, body: 'Token Validierungsfehler: ' + err.message });
                    return;
                }
                const signingKey = key.getPublicKey();
                
                jwt.verify(token, signingKey, validationOptions, (err, decoded) => {
                    if (err) {
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
        if (!decoded.roles || decoded.roles.length === 0) {
            throw { status: 403, body: 'Keine Rolle im Token gefunden' };
        }

        // Bei Admin-Endpunkten
        if (requiredRole === ROLES.ADMIN) {
            const hasAdminRole = decoded.roles.includes(ROLES.ADMIN);
            if (!hasAdminRole) {
                throw { status: 403, body: 'Admin-Rechte erforderlich' };
            }
        }

        // Bei allgemeinen Endpunkten
        const hasValidRole = decoded.roles.some(role => 
            [ROLES.ADMIN, ROLES.USER].includes(role)
        );
        if (!hasValidRole) {
            throw { status: 403, body: 'Keine gültige Rolle' };
        }

        return decoded;

    } catch (error) {
        console.error('Fehler in validateJwt:', error);
        throw {
            status: error.status || 500,
            body: error.body || `Interner Fehler bei der Token-Validierung: ${error.message}`
        };
    }
}

// Middleware für Rollenbasierte Zugriffssteuerung
function requireRole(role) {
    return async (req, context) => {
        await validateJwt(req, context, role);
    };
}

module.exports = { validateJwt, requireRole, ROLES };