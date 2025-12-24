import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import { initAuthWatcher } from './helpers/cache/authWatcher';

let watcherStarted = false;

export default function App() {
  useEffect(() => {
    if (!watcherStarted) {
      console.log('[App] Initializing AuthWatcher');
      initAuthWatcher();
      watcherStarted = true;
    }
  }, []);

  return <AppRouter />;
}
