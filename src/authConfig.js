import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

// Environment-aware configuration
const isProd = import.meta.env.PROD;
const BASE_URL = isProd
  ? import.meta.env.VITE_BASE_URL
  : window.location.origin;
const API_URL = isProd
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL || "http://localhost:7071/api";

// Ensure redirect URI matches the current environment
const redirectUri = `${BASE_URL}/room`; // Direkt auf /room setzen
const clientId = "9bc0f1d1-d9f3-45ce-b0ac-1f8484a6b435"; // Feste Client ID
const authority = "https://login.microsoftonline.com/3acbef42-1ba8-4fd2-8f6c-bfc8d375fc6b"; // Feste Authority
const postLogoutRedirectUri = `${BASE_URL}/post-logout`; // Fester Logout Redirect

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
    storeAuthStateInCookie: false,
    secureCookies: true
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Verbose für besseres Debugging
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        
        const logPrefix = '[MSAL]';
        switch (level) {
          case LogLevel.Error:
            console.error(logPrefix, message);
            return;
          case LogLevel.Info:
            console.info(logPrefix, message);
            return;
          case LogLevel.Verbose:
            console.debug(logPrefix, message);
            return;
          case LogLevel.Warning:
            console.warn(logPrefix, message);
            return;
        }
      },
      piiLoggingEnabled: false
    }
  }
};

// Login Request mit korrekter Client ID
export const loginRequest = {
  scopes: [
    `api://9bc0f1d1-d9f3-45ce-b0ac-1f8484a6b435/access_ass_user`,
    "User.Read",
    "profile"
  ]
};

// Export environment variables
export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};

// Admin check function
export function isUserAdmin() {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (!accounts.length) return false;

    const account = accounts[0];
    const roles = account.idTokenClaims?.roles || [];
    return roles.includes('Admin'); // Prüft auf Admin-Rolle
  } catch (error) {
    console.error('Fehler bei der Admin-Rollenprüfung:', error);
    return false;
  }
}

// Token logging function
export async function getTokenAndLog() {
  try {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      console.log("Kein Benutzer angemeldet");
      return null;
    }

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    });
    
    if (response?.accessToken) {
      console.log("Token erfolgreich abgerufen");
      return response.accessToken;
    }
    return null;
  } catch (error) {
    if (error.name === "InteractionRequiredAuthError") {
      console.warn("Interaktive Anmeldung erforderlich");
      return null;
    }
    console.error("Fehler beim Token-Abruf:", error);
    return null;
  }
}

// MSAL Instance Initialization
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize and handle redirects
(async () => {
  try {
    console.log('Starte MSAL Initialisierung...');
    await msalInstance.initialize();
    console.log('MSAL erfolgreich initialisiert');
    
    const result = await msalInstance.handleRedirectPromise();
    if (result) {
      console.log('Redirect erfolgreich verarbeitet');
    }
  } catch (error) {
    console.error("Fehler bei MSAL Initialisierung:", error);
  }
})();

export { msalInstance };