const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Azure AD Konfiguration aus den Umgebungsvariablen
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_CLIENT_ID; // Die Client ID deiner App

const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`
});

async function validateJwt(req, context) {
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


        // Korrekte Validierungsoptionen für deine Azure AD App
        const validationOptions = {
            audience: CLIENT_ID,
            issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
            algorithms: ['RS256']
        };

        context.log('Validierungsoptionen:', validationOptions);

        return new Promise((resolve, reject) => {
            const kid = decodedToken.header.kid;
            client.getSigningKey(kid, (err, key) => {
                if (err) {
                    reject({ status: 401, body: 'Token Validierungsfehler: ' + err.message });
                    return;
                }

                const signingKey = key.getPublicKey();
                
                jwt.verify(token, signingKey, validationOptions, (err, decoded) => {
                    if (err) {
                        console.error('Token Verifizierungsfehler:', err);
                        reject({ 
                            status: 401, 
                            body: `Token ungültig: ${err.message}` 
                        });
                        return;
                    }
                    
                    console.log('Token erfolgreich validiert:', decoded);
                    resolve(decoded);
                });
            });
        });
    } catch (error) {
        console.error('Fehler in validateJwt:', error);
        throw {
            status: error.status || 500,
            body: error.body || `Interner Fehler bei der Token-Validierung: ${error.message}`
        };
    }
}

module.exports = validateJwt;