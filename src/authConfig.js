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
const redirectUri = isProd 
 ? "https://victorious-field-0cd4c7903.4.azurestaticapps.net/room"
 : `${window.location.origin}/room`;

const API_URL = isProd
 ? "https://victorious-field-0cd4c7903.4.azurestaticapps.net/api"
 : "http://localhost:7071/api";

export const msalConfig = {
 auth: {
   clientId: import.meta.env.VITE_CLIENT_ID,
   authority: import.meta.env.VITE_AUTHORITY,
   redirectUri,
   navigateToLoginRequestUrl: true,
   postLogoutRedirectUri: isProd
     ? "https://victorious-field-0cd4c7903.4.azurestaticapps.net/post-logout"
     : `${window.location.origin}/post-logout`
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

export const loginRequest = {
 scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/access_ass_user`,
   "User.Read",
   "profile"
 ]
};

// Export environment variables for use in other files
export const environment = {
 isProd,
 baseUrl: isProd 
   ? "https://victorious-field-0cd4c7903.4.azurestaticapps.net"
   : window.location.origin,
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