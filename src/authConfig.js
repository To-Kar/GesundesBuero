
import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

export async function getTokenAndLog() {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) {
      console.log("Kein Benutzer angemeldet.");
      return null;
  }

  try {
      const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account
      });
      console.log("JWT-Token extrahiert:", response.accessToken);
      return response.accessToken;
  } catch (error) {
      console.error("Fehler beim Abrufen des Tokens:", error);
      return null;
  }
}
// Environment-aware configuration
const isProd = import.meta.env.PROD;
const BASE_URL = isProd
  ? import.meta.env.VITE_BASE_URL
  : window.location.origin;

const API_URL = isProd
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL || "http://localhost:7071/api";

// Ensure redirect URI matches the current environment
const redirectUri = `${BASE_URL}${import.meta.env.VITE_REDIRECT_URI}`;

// Fetch clientId from environment variables
const clientId = import.meta.env.VITE_CLIENT_ID;
const authority = import.meta.env.VITE_AUTHORITY;
const postLogoutRedirectUri = `${BASE_URL}${import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI}`;

export const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri,
    navigateToLoginRequestUrl: true,
    postLogoutRedirectUri
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: isProd ? LogLevel.Error : LogLevel.Verbose,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      }
    }
  }
};
const Client_ID = import.meta.env.VITE_CLIENT_ID;
export const loginRequest = {
  scopes: [`api://${Client_ID}/access_ass_user`,
  "User.Read",   
  "profile"
  ]
};

// Export environment variables for use in other files
export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};

export function isUserAdmin() {
  const adminRole = import.meta.env.VITE_ADMIN_ROLE; // Hole Admin-Rolle aus .env
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    const roles = account.idTokenClaims?.roles || []; // Falls Rollen im Token als `roles` vorhanden
    return roles.includes(adminRole);
  }
  return false;
}


// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Handle initialization and redirect
(async () => {
  try {
    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();
  } catch (error) {
    console.error("Error initializing MSAL:", error);
  }
})();

export { msalInstance };