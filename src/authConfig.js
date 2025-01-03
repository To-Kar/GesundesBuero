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
const redirectUri = `${BASE_URL}${import.meta.env.VITE_REDIRECT_URI}`;
const clientId = import.meta.env.VITE_CLIENT_ID;
const authority = import.meta.env.VITE_AUTHORITY;
const postLogoutRedirectUri = `${BASE_URL}${import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI}`;

// Validierung der wichtigen Konfigurationswerte
if (!clientId) console.error('VITE_CLIENT_ID fehlt in der Umgebungskonfiguration');
if (!authority) console.error('VITE_AUTHORITY fehlt in der Umgebungskonfiguration');
if (!redirectUri) console.error('VITE_REDIRECT_URI fehlt in der Umgebungskonfiguration');

export const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri,
    navigateToLoginRequestUrl: true,
    postLogoutRedirectUri,
    validateAuthority: true  // Aktiviert Autoritätsvalidierung
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
    secureCookies: true  // Erhöht die Cookie-Sicherheit
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: isProd ? LogLevel.Error : LogLevel.Verbose,
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
    },
    windowHashTimeout: 9000,  // Erhöht Timeout für langsame Verbindungen
    iframeHashTimeout: 9000,
    loadFrameTimeout: 9000
  }
};

// Verbesserte Login Request Konfiguration
export const loginRequest = {
  scopes: [
    `api://${clientId}/access_ass_user`,  // Nutzt die gleiche clientId-Variable
    "User.Read",
    "profile"
  ].filter(Boolean),  // Filtert leere/undefined Werte
  prompt: "select_account",  // Ermöglicht Kontoauswahl
  extraScopesToConsent: ["offline_access"]  // Fügt Refresh Token Support hinzu
};

// Export environment variables
export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};

export function isUserAdmin() {
  try {
    const adminRole = import.meta.env.VITE_ADMIN_ROLE;
    if (!adminRole) {
      console.warn('VITE_ADMIN_ROLE nicht konfiguriert');
      return false;
    }

    const accounts = msalInstance.getAllAccounts();
    if (!accounts.length) return false;

    const account = accounts[0];
    const roles = account.idTokenClaims?.roles || [];
    return roles.includes(adminRole);
  } catch (error) {
    console.error('Fehler bei der Admin-Rollenprüfung:', error);
    return false;
  }
}

export async function getTokenAndLog() {
  try {
    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
      console.log("Kein Benutzer angemeldet");
      return null;
    }

    const tokenRequest = {
      ...loginRequest,
      account,
      forceRefresh: false  // Nutzt Cache wenn möglich
    };

    const response = await msalInstance.acquireTokenSilent(tokenRequest);
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

const msalInstance = new PublicClientApplication(msalConfig);

(async () => {
  try {
    console.log('Starte MSAL Initialisierung...');
    await msalInstance.initialize();
    console.log('MSAL erfolgreich initialisiert');
    
    const result = await msalInstance.handleRedirectPromise();
    if (result) {
      console.log('Redirect erfolgreich verarbeitet');
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        console.log('Benutzer ist eingeloggt');
      }
    }
  } catch (error) {
    console.error("Fehler bei MSAL Initialisierung:", error);
  }
})();

export { msalInstance };