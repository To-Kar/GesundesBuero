import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

// Environment-aware configuration
const isProd = import.meta.env.PROD;
const BASE_URL = window.location.origin;

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: `${BASE_URL}/room`,
    navigateToLoginRequestUrl: true,
    postLogoutRedirectUri: `${BASE_URL}/post-logout`
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true // Enable cookies for IE support
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

const API_URL = isProd
  ? import.meta.env.VITE_API_URL
  : "http://localhost:7071/api";

export const loginRequest = {
  scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/access_ass_user`,
    "User.Read",
    "profile"
  ]
};

export const environment = {
  isProd,
  baseUrl: BASE_URL,
  apiUrl: API_URL
};

export function isUserAdmin() {
  const adminRole = import.meta.env.VITE_ADMIN_ROLE;
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    const account = accounts[0];
    const roles = account.idTokenClaims?.roles || [];
    return roles.includes(adminRole);
  }
  return false;
}

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

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL before export
await msalInstance.initialize();

export { msalInstance };