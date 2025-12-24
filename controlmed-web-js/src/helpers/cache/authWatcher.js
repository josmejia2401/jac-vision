import LocalStorageWatcher from './localStorageWatcher';
import { AuthStore } from './index';
import routes from '../../routes/routes';

const PUBLIC_ROUTES = [routes.LOGIN, routes.REGISTER];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  );
}

function redirectToLogin() {
  console.warn('[AuthWatcher] Redirecting to /login');
  window.location.replace(routes.LOGIN);
}

function redirectToHome() {
  console.warn('[AuthWatcher] Redirecting to /home');
  window.location.replace(routes.DASHBOARD);
}

export function initAuthWatcher() {
  console.log('[AuthWatcher] Init');

  return new LocalStorageWatcher({
    keys: ['token'],
    fireImmediately: true,
    callback: () => {
      console.group('[AuthWatcher] 🔍 Checking auth');

      const token = localStorage.getItem('token');
      const pathname = window.location.pathname;

      console.log('Token:', token);
      console.log('Path:', pathname);

      if (!token) {
        console.warn('[AuthWatcher] No token');
        AuthStore.logout();

        if (!isPublicRoute(pathname)) {
          redirectToLogin();
        }
      } else {
        console.log('[AuthWatcher] Token OK');
        if (isPublicRoute(pathname)) {
          redirectToHome();
        }
      }

      console.groupEnd();
    }
  });
}
