# Tennolino Tracker

Tennis Match Tracker für Tennolino Midcourt-Turniere.

## Features

- Punktezählung nach Tennolino-Regeln (bis 7, 3. Satz bis 5)
- Aufschlagwechsel alle 2 Punkte (2-2-2-2)
- Serve-Tracking: Ace, Fault, In Play
- Rally-Tracking: Winner, Forced Error, Unforced Error
- Statistik-Übersicht am Match-Ende
- CSV-Export
- Offline-fähig (PWA)
- Installierbar auf Android/iOS

## Schnellstart

### Option 1: Lokal mit Python (kein Install nötig)

```bash
cd tennolino-pwa
python3 -m http.server 8000
```

Dann öffne http://localhost:8000 im Browser.

### Option 2: Mit Node.js

```bash
npx serve tennolino-pwa
```

### Option 3: GitHub Pages (kostenlos online hosten)

1. Erstelle ein neues GitHub Repository
2. Lade alle Dateien hoch
3. Gehe zu Settings > Pages
4. Wähle "Deploy from a branch" > main
5. Nach 1-2 Minuten ist die App online unter `https://jopre0502.github.io/tennis_tracker`

## Auf Handy installieren

1. Öffne die URL im Chrome (Android) oder Safari (iOS)
2. Android: Tippe auf Menü (3 Punkte) > "App installieren" oder "Zum Startbildschirm hinzufügen"
3. iOS: Tippe auf Teilen-Icon > "Zum Home-Bildschirm"

## Icons erstellen

Die Datei `icon.svg` kann in PNG konvertiert werden:

1. Öffne icon.svg im Browser
2. Screenshot machen und zuschneiden, oder:
3. Online-Konverter nutzen (z.B. svgtopng.com)
4. Speichern als `icon-192.png` und `icon-512.png`

Alternativ eigenes Icon erstellen (192x192 und 512x512 Pixel).

## Dateien

```
tennolino-pwa/
├── index.html      # Haupt-App
├── manifest.json   # PWA-Konfiguration
├── sw.js           # Service Worker (Offline)
├── icon.svg        # Icon-Vorlage
├── icon-192.png    # App-Icon (erstellen!)
├── icon-512.png    # App-Icon gross (erstellen!)
└── README.md       # Diese Datei
```

## Regelwerk

| Aspekt | Regel |
|--------|-------|
| Punktezählung | 1, 2, 3, 4, 5, 6, 7 |
| Satzgewinn | Erster mit 7 Punkten |
| Match | Best of 3 |
| Entscheidungssatz | Bis 5 Punkte |
| Aufschlagwechsel | Alle 2 Punkte |
