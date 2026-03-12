/**
 * main.tsx
 * Einstiegspunkt der React-Anwendung
 * Rendert die App-Komponente in den DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Root-Element finden
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root-Element nicht gefunden. Stellen Sie sicher, dass ein Element mit id="root" im HTML existiert.');
}

// React-Root erstellen und App rendern
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log für Entwicklungsmodus
if (import.meta.env.DEV) {
  console.log('Autoflow Tracker - Entwicklungsmodus');
  console.log('PWA Features sind im Production-Build verfügbar');
}
