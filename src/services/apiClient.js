import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7071/api";

// Create and export a shared axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for common handling
apiClient.interceptors.request.use(
    config => {
        // You can add common headers here (e.g., authentication)
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor for common error handling
apiClient.interceptors.response.use(
    response => response,
    error => {
        // Handle common error cases
        if (error.response) {
            // Server responded with error status
            console.error('API Error Response:', error.response.data);
            error.message = error.response.data.message || 'An error occurred';
        } else if (error.request) {
            // Request was made but no response
            console.error('API No Response:', error.request);
            error.message = 'No response from server';
        } else {
            // Something else happened
            console.error('API Error:', error.message);
            error.message = 'Failed to make request';
        }
        return Promise.reject(error);
    }
);