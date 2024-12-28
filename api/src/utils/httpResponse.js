// src/utils/httpResponse.js

const httpResponses = {
    success: (data, status = 200) => ({
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
    }),

    error: (message, status = 500) => ({
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: message }),
    }),

    badRequest: (message) => ({
        status: 400,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: message }),
    }),

    notFound: (message) => ({
        status: 404,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: message }),
    }),

    unauthorized: (message = 'Nicht autorisiert') => ({
        status: 401,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: message }),
    }),

    forbidden: (message = 'Zugriff verweigert') => ({
        status: 403,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: message }),
    }),
};

module.exports = httpResponses;
