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
        console.log('--- Start JWT Validierung ---');
        
        // Authorization Header ausgeben
        const authHeader = req.headers['authorization'];
        console.log('Authorization Header:', authHeader);

        if (!authHeader) {
            console.log('Fehler: Kein Authorization Header vorhanden');
            throw { status: 401, body: 'Kein Authorization Header' };
        }

        // Token extrahieren
        const token = authHeader.split(' ')[1];
        console.log('Extrahiertes Token:', token);

        // Token dekodieren (Header + Payload)
        const decodedToken = jwt.decode(token, { complete: true });
        console.log('Dekodiertes Token:', JSON.stringify(decodedToken, null, 2));

        if (!decodedToken) {
            console.log('Fehler: Token konnte nicht dekodiert werden');
            throw { status: 401, body: 'Token konnte nicht dekodiert werden' };
        }

        const kid = decodedToken.header.kid;
        console.log('Token kid:', kid);

        console.log('Validation Options:');
        console.log(`Audience: ${CLIENT_ID}`);
        console.log(`Issuer: https://login.microsoftonline.com/${TENANT_ID}/v2.0`);

        const validationOptions = {
            audience: CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
            algorithms: ['RS256']
        };

        // JWKS-Key abrufen
        const decoded = await new Promise((resolve, reject) => {
            client.getSigningKey(kid, (err, key) => {
                if (err) {
                    console.log('Signing Key Fehler:', err.message);
                    reject({ status: 401, body: 'Token Validierungsfehler: ' + err.message });
                    return;
                }
                console.log('Signing Key erfolgreich abgerufen:', key);
                
                const signingKey = key.getPublicKey();
                console.log('Public Key:', signingKey);

                jwt.verify(token, signingKey, validationOptions, (err, decoded) => {
                    if (err) {
                        console.log('Token Verifikation fehlgeschlagen:', err.message);
                        reject({
                            status: 401,
                            body: `Token ungültig: ${err.message}`
                        });
                        return;
                    }
                    console.log('Token erfolgreich verifiziert:', decoded);
                    resolve(decoded);
                });
            });
        });

        // Rollenvalidierung
        console.log('Token Rollen:', decoded.roles);
        
        if (!decoded.roles || decoded.roles.length === 0) {
            console.log('Fehler: Keine Rolle im Token gefunden');
            throw { status: 403, body: 'Keine Rolle im Token gefunden' };
        }

        // Rollenprüfung bei Admin-Endpunkten
        if (requiredRole === ROLES.ADMIN) {
            const hasAdminRole = decoded.roles.includes(ROLES.ADMIN);
            if (!hasAdminRole) {
                console.log('Fehler: Admin-Rechte erforderlich');
                throw { status: 403, body: 'Admin-Rechte erforderlich' };
            }
        }

        // Allgemeine Rollenprüfung
        const hasValidRole = decoded.roles.some(role =>
            [ROLES.ADMIN, ROLES.USER].includes(role)
        );
        if (!hasValidRole) {
            console.log('Fehler: Keine gültige Rolle gefunden');
            throw { status: 403, body: 'Keine gültige Rolle' };
        }

        console.log('--- JWT Validierung erfolgreich abgeschlossen ---');
        return decoded;

    } catch (error) {
        console.error('Fehler in validateJwt:', error);
        context.log('Fehlerdetails:', JSON.stringify(error, null, 2));
        throw {
            status: error.status || 500,
            body: error.body || `Interner Fehler bei der Token-Validierung: ${error.message}`
        };
    }
}


module.exports = { validateJwt, requireRole, ROLES };