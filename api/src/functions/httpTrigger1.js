const { app } = require('@azure/functions');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const httpResponses = require('../utils/httpResponse');

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
                node_env: process.env.NODE_ENV,
                azure_website_name: process.env.WEBSITE_SITE_NAME,
                all_env_keys: Object.keys(process.env)
            };

            // Request logging
            const url = new URL(request.url);
            logs.request = {
                method: request.method,
                path: url.pathname,
                query: Object.fromEntries(url.searchParams),
                headers: Object.fromEntries(request.headers.entries())
            };

            // Auth header analysis
            const authHeader = request.headers.get('authorization');
            logs.auth.headerPresent = !!authHeader;
            logs.auth.headerFormat = authHeader ? authHeader.split(' ')[0] : 'none';

            if (authHeader) {
                const token = authHeader.split(' ')[1];
                try {
                    // Token structure check
                    const decodedToken = jwt.decode(token, { complete: true });
                    logs.auth.token = {
                        header: decodedToken?.header,
                        claims: {
                            aud: decodedToken?.payload?.aud,
                            iss: decodedToken?.payload?.iss,
                            exp: decodedToken?.payload?.exp,
                            nbf: decodedToken?.payload?.nbf,
                            roles: decodedToken?.payload?.roles,
                            scp: decodedToken?.payload?.scp
                        },
                        kid: decodedToken?.header?.kid
                    };

                    // Token expiration check
                    const now = Math.floor(Date.now() / 1000);
                    logs.validation.tokenExpired = decodedToken?.payload?.exp < now;
                    logs.validation.tokenNotBefore = decodedToken?.payload?.nbf > now;
                    
                    // Audience validation
                    logs.validation.audienceValid = decodedToken?.payload?.aud === CLIENT_ID;
                    
                    // Issuer validation
                    const expectedIssuer = `https://login.microsoftonline.com/${TENANT_ID}/v2.0`;
                    logs.validation.issuerValid = decodedToken?.payload?.iss === expectedIssuer;
                    
                    // Roles validation
                    logs.validation.hasRoles = Array.isArray(decodedToken?.payload?.roles) && 
                                             decodedToken?.payload?.roles.length > 0;
                    logs.validation.roles = decodedToken?.payload?.roles || [];

                    // JWKS validation attempt
                    try {
                        const client = jwksClient({
                            jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`
                        });
                        
                        const key = await new Promise((resolve, reject) => {
                            client.getSigningKey(decodedToken.header.kid, (err, key) => {
                                if (err) reject(err);
                                else resolve(key);
                            });
                        });
                        
                        logs.validation.jwksKeyFound = !!key;
                    } catch (jwksError) {
                        logs.errors.push({
                            stage: 'jwks_validation',
                            error: jwksError.message,
                            stack: jwksError.stack
                        });
                    }

                } catch (tokenError) {
                    logs.errors.push({
                        stage: 'token_decode',
                        error: tokenError.message,
                        stack: tokenError.stack
                    });
                }
            }

            // Log everything
            context.log('Debug Information:', JSON.stringify(logs, null, 2));

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Debug information logged',
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
            
            return httpResponses.error('Debug endpoint error', 500);
        }
    }
});