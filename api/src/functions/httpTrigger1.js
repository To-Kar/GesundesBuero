const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_CLIENT_ID;

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const logs = {
            timestamp: new Date().toISOString(),
            environment: {},
            request: {},
            auth: {},
            validation: {},
            errors: []
        };

        try {
            // Environment logging
            logs.environment = {
                tenant_id: TENANT_ID,
                client_id: CLIENT_ID,
                node_env: process.env.NODE_ENV
            };

            // Request logging
            logs.request = {
                method: request.method,
                path: request.url,
                headers: Object.fromEntries(request.headers.entries())
            };

            // Get the correct token
            const aadToken = request.headers.get('x-ms-token-aad-access-token');
            const authHeader = request.headers.get('authorization');
            const token = aadToken || (authHeader ? authHeader.split(' ')[1] : null);

            logs.auth.headerPresent = !!token;
            logs.auth.tokenSource = aadToken ? 'aad-header' : (authHeader ? 'auth-header' : 'none');

            if (token) {
                try {
                    const decodedToken = jwt.decode(token, { complete: true });
                    logs.auth.token = {
                        header: decodedToken?.header,
                        claims: decodedToken?.payload
                    };

                    // Log all claims for debugging
                    logs.auth.claims = decodedToken?.payload;

                    const client = jwksClient({
                        jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
                        cache: true,
                        rateLimit: true
                    });

                    logs.validation.jwksUri = `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`;

                    const signingKey = await new Promise((resolve, reject) => {
                        client.getSigningKey(decodedToken.header.kid, (err, key) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(key.getPublicKey());
                            }
                        });
                    });

                    logs.validation.signingKeyFound = !!signingKey;

                    const verified = await new Promise((resolve, reject) => {
                        jwt.verify(token, signingKey, {
                            audience: CLIENT_ID,
                            issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
                            algorithms: ['RS256']
                        }, (err, decoded) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(decoded);
                            }
                        });
                    });

                    logs.validation.verified = true;
                    logs.validation.decodedToken = verified;

                } catch (error) {
                    logs.errors.push({
                        stage: 'token_validation',
                        error: error.message,
                        stack: error.stack
                    });
                }
            }

            // Log everything
            context.log('Debug Information:', JSON.stringify(logs, null, 2));

            return {
                status: 200,
                body: JSON.stringify({
                    message: "Debug information logged",
                    logs: logs
                })
            };

        } catch (error) {
            logs.errors.push({
                stage: 'general',
                error: error.message,
                stack: error.stack
            });
            
            context.log('Error Debug Information:', JSON.stringify(logs, null, 2));
            
            return {
                status: 500,
                body: JSON.stringify({
                    error: "Internal server error",
                    details: error.message,
                    logs: logs
                })
            };
        }
    }
});