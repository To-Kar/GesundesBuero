import { msalInstance, loginRequest } from '../authConfig';

export function registerGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const accounts = msalInstance.getAllAccounts();
    const isAuthenticated = accounts.length > 0;

    if (to.meta.requiresAuth) {
      if (isAuthenticated) {
        try {
          // Silently acquire token if needed
          await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
          });
          return next();
        } catch (error) {
          // If silent token acquisition fails, redirect to login
          sessionStorage.setItem('loginRedirect', to.fullPath);
          await msalInstance.loginRedirect(loginRequest);
          return;
        }
      } else {
        sessionStorage.setItem('loginRedirect', to.fullPath);
        await msalInstance.loginRedirect(loginRequest);
        return;
      }
    }

    if (to.path === '/login' && isAuthenticated) {
      return next('/room');
    }

    next();
  });
}