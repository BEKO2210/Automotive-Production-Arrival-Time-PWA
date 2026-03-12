/**
 * App.tsx
 * Root-Komponente der Autoflow Tracker Anwendung
 * Verwaltet die PWA-Registrierung und das Theme
 */
import { useEffect } from 'react';
import { Home } from '@/pages/Home';
import './App.css';

/**
 * Haupt-App-Komponente
 * Registriert den Service Worker und rendert die Home-Seite
 */
function App() {
  // Service Worker Registrierung für PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Prüfe ob wir im Production-Modus sind
      if (import.meta.env.PROD) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registriert:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker Registrierung fehlgeschlagen:', error);
          });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Home />
    </div>
  );
}

export default App;
