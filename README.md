# Autoflow Tracker

Eine Progressive Web App (PWA) für die Automobilproduktion zur Berechnung von Ankunftszeiten entlang einer Produktionslinie.

## Features

- **Echtzeit-Berechnung**: Berechnet verbleibende Zeit bis zur Ankunft an einer Station
- **Countdown-Display**: Große, gut lesbare Zahlen für industrielle Umgebungen
- **Produktionslinie-Visualisierung**: Animierte Darstellung der Fahrzeugposition
- **Favoriten**: Speichern Sie Ihre Station für schnellen Zugriff
- **Offline-fähig**: Funktioniert komplett ohne Internetverbindung
- **Installierbar**: Kann als App auf dem Homescreen installiert werden
- **Porsche-inspiriertes Design**: Minimalistisch, technisch, hochwertig

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **PWA**: vite-plugin-pwa
- **Icons**: Lucide React

## Installation

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Lokale Entwicklung

```bash
# Repository klonen
git clone <repository-url>
cd autoflow-tracker

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:3000` verfügbar.

### Production Build

```bash
# Build erstellen
npm run build

# Build lokal testen
npm run preview
```

Der Build wird im `dist/`-Verzeichnis erstellt.

## PWA Installation

### Android (Chrome)

1. Öffnen Sie die App im Chrome Browser
2. Tippen Sie auf das Menü (⋮)
3. Wählen Sie "Zum Startbildschirm hinzufügen"
4. Bestätigen Sie mit "Hinzufügen"

### iOS (Safari)

1. Öffnen Sie die App in Safari
2. Tippen Sie auf das Teilen-Symbol (□↑)
3. Wählen Sie "Zum Home-Bildschirm"
4. Bestätigen Sie mit "Hinzufügen"

### Desktop (Chrome/Edge)

1. Öffnen Sie die App im Browser
2. Klicken Sie auf das Install-Symbol in der Adressleiste
3. Bestätigen Sie mit "Installieren"

## Verwendung

1. **Aktuelle Fahrzeugstation eingeben**: Geben Sie die Station ein, an der sich das Fahrzeug aktuell befindet
2. **Meine Station eingeben**: Geben Sie Ihre Arbeitsstation ein
3. **Ankunftszeit ablesen**: Die App zeigt sofort die verbleibende Zeit an
4. **Favorit speichern**: Klicken Sie auf den Stern, um Ihre Station zu speichern

## Konfiguration

Die App ist für eine Produktionslinie mit folgenden Parametern konfiguriert:

- **Gesamtstationen**: 150
- **Zeit pro Station**: 2 Minuten 42 Sekunden (162 Sekunden)

Diese Werte können in `src/store/useStationStore.ts` angepasst werden.

## Projektstruktur

```
autoflow-tracker/
├── public/
│   ├── icons/              # PWA Icons
│   └── manifest.webmanifest # Web App Manifest
├── src/
│   ├── components/         # React Komponenten
│   │   ├── StationInput.tsx
│   │   ├── CountdownDisplay.tsx
│   │   └── ProductionLine.tsx
│   ├── hooks/              # Custom React Hooks
│   │   └── useCountdown.ts
│   ├── pages/              # Seitenkomponenten
│   │   └── Home.tsx
│   ├── store/              # Zustand Stores
│   │   └── useStationStore.ts
│   ├── utils/              # Utility-Funktionen
│   │   ├── calculations.ts
│   │   └── time.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Performance

Ziel-Lighthouse-Scores:

- **Performance**: 100
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

## Browser Support

- Chrome/Edge (empfohlen)
- Firefox
- Safari
- Samsung Internet

## Lizenz

MIT License

## Entwickler

Entwickelt für industrielle Produktionsumgebungen mit Fokus auf:

- Einfache Bedienung
- Schnelle Berechnung
- Offline-Funktionalität
- Hohe Performance
- Barrierefreiheit
