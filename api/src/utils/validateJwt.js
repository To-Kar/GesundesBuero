const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();  // Lädt .env falls nötig

// Azure AD Konfiguration
const TENANT_ID = process.env.TENANT;
const AUDIENCE = process.env.VITE_CLIENT_ID;  // Nutze Client ID für Audience
const ISSUER = `https://login.microsoftonline.com/${TENANT_ID}/v2.0`;


// JWKS Client zur Abfrage der öffentlichen Schlüssel
const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`
});

// Funktion zur Extraktion des Schlüssels
function getSigningKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        } else {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

// Middleware zur Token-Validierung
module.exports = function validateJwt(req, context) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>
    console.log("TENANT_ID aus .env geladen:", TENANT_ID);
    const decodedToken = jwt.decode(token, { complete: true });
    console.log("Issuer im Token:", decodedToken.payload.iss);

    if (!TENANT_ID) {
        throw new Error("TENANT_ID ist nicht in der .env Datei gesetzt! Bitte TENANT in der .env definieren.");
    }


    if (!token) {
        console.log('Token fehlt');
        return Promise.reject({ status: 401, body: 'Token fehlt' });
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, getSigningKey, {
            audience: AUDIENCE,
            issuer: ISSUER,
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                context.log('Token ungültig:', err.message);
                reject({ status: 403, body: 'Token ungültig' });
            } else {
                context.log('Token validiert:', decoded);
                req.user = decoded;  // Benutzerinformationen an Anfrage anhängen
                resolve();
            }
        });
    });
};
