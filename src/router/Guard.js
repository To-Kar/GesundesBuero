import { isUserAdmin } from '../authConfig';
import { msalInstance, loginRequest } from '../authConfig';
import { getTokenAndLog } from '../authConfig';

export function registerGuard(router) {
  router.beforeEach(async (to, from, next) => {
    await getTokenAndLog();  // Logge das Token bei jeder Navigation
    next();
    const accounts = msalInstance.getAllAccounts();
    const isAuthenticated = accounts.length > 0;

    if (to.meta.requiresAuth) {
      if (isAuthenticated) {
        try {
          await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
          });
          // Admin-Prüfung für spezielle Routen
          if (to.meta.requiresAdmin && !isUserAdmin()) {
            return next('/not-authorized'); // Leite zu einer "Zugriff verweigert"-Seite weiter
          }
          return next();
        } catch (error) {
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