# GitHub Issues - Tennolino Tracker Refactoring

Kopiere diese Issues in dein GitHub Repository unter "Issues" → "New Issue"

---

## Issue #1: 🚨 MUSS: Icons generieren (icon-192.png, icon-512.png)

**Labels:** `bug`, `high priority`

### Problem
Die PWA kann nicht installiert werden, da die referenzierten Icons fehlen:
- `icon-192.png`
- `icon-512.png`

### Lösung
1. Aus `icon.svg` PNG-Dateien generieren
2. Oder manuelle Erstellung mit Tennis-Motiv
3. Optimierung für verschiedene Plattformen (iOS, Android)

### Akzeptanzkriterien
- [ ] icon-192.png existiert und ist valide
- [ ] icon-512.png existiert und ist valide
- [ ] PWA-Installation funktioniert auf Android/iOS
- [ ] Icons werden korrekt angezeigt

**Kategorie:** MUSS
**Effort:** 30 Minuten

---

## Issue #2: 🚨 MUSS: Alert() durch Toast-Notifications ersetzen

**Labels:** `enhancement`, `high priority`, `ux`

### Problem
Aktuell werden Browser-Alerts verwendet (z.B. in `copyStatsToClipboard()`):
```javascript
alert('Statistik in die Zwischenablage kopiert.');
```

Das wirkt altmodisch und unterbricht den User-Flow.

### Lösung
1. Einfache Toast-Component mit TailwindCSS
2. Auto-Dismiss nach 3 Sekunden
3. Stackable (mehrere Toasts gleichzeitig möglich)

### Betroffene Stellen
- `index.html:235` - Clipboard success
- `index.html:248` - Clipboard success (fallback)
- `index.html:250` - Clipboard error

### Akzeptanzkriterien
- [ ] Keine `alert()` Aufrufe mehr im Code
- [ ] Toast erscheint oben/unten im Viewport
- [ ] Auto-Dismiss funktioniert
- [ ] Mobile-friendly

**Kategorie:** MUSS
**Effort:** 1 Stunde

---

## Issue #3: ⚠️ SOLLTE: Build-Process einführen (Vite)

**Labels:** `enhancement`, `performance`

### Problem
Aktuell wird JSX zur Laufzeit im Browser kompiliert:
- Babel Standalone (~2MB) muss geladen werden
- Performance-Hit auf älteren Geräten
- Kein Syntax-Highlighting in HTML
- Keine Code-Optimierung

### Lösung
1. Vite Setup mit React
2. Pre-compile JSX zu JavaScript
3. Tree-shaking & Minification
4. Dev-Server mit HMR

### Migration-Schritte
1. `npm create vite@latest . -- --template react`
2. Code aus `index.html` nach `src/App.jsx` migrieren
3. TailwindCSS lokal installieren
4. Build-Optimierung

### Performance-Gewinn
- Initial Load: ~2 Sekunden schneller
- Bundle Size: Von ~5MB auf ~150KB
- First Contentful Paint verbessert

### Akzeptanzkriterien
- [ ] Vite Dev-Server läuft
- [ ] Build-Prozess funktioniert
- [ ] PWA bleibt funktional
- [ ] Performance verbessert

**Kategorie:** SOLLTE
**Effort:** 2-3 Stunden

---

## Issue #4: ⚠️ SOLLTE: Component-Extraktion (Refactoring)

**Labels:** `refactoring`, `code-quality`

### Problem
`TennolinoTracker` ist 400+ Zeilen und enthält 4 verschiedene UI-States:
- Setup Screen
- Info Screen
- Match Screen
- Results Screen

Verletzt Single Responsibility Principle.

### Ziel-Architektur
```
TennolinoTracker (Main State Management)
  ├─ SetupScreen
  ├─ InfoScreen
  ├─ MatchScreen
  │   ├─ Scoreboard
  │   ├─ PhaseIndicator
  │   ├─ ServeButtons
  │   └─ RallyButtons
  └─ ResultsScreen
      ├─ PlayerAnalysis
      └─ StatsTable
```

### Benefits
- Bessere Wartbarkeit
- Komponenten wiederverwendbar
- Einfacheres Testing
- Klarere Verantwortlichkeiten

### Akzeptanzkriterien
- [ ] Mindestens 6 separate Components
- [ ] Props klar definiert
- [ ] State Management bleibt in Main
- [ ] Keine funktionalen Regressionen

**Kategorie:** SOLLTE
**Effort:** 4-5 Stunden
**Depends on:** #3 (Vite Setup)

---

## Issue #5: ⚠️ SOLLTE: LocalStorage Auto-Save

**Labels:** `enhancement`, `ux`

### Problem
Bei versehentlichem Tab-Close oder Browser-Crash ist Match-State verloren.

### Lösung
1. `useEffect` Hook für Auto-Save bei jedem Punkt
2. LocalStorage-Key: `tennolino_current_match`
3. Bei App-Start: "Match fortsetzen?" Dialog wenn vorhanden

### Datenstruktur
```javascript
{
  players: { a: 'Name', b: 'Name' },
  history: [...],
  timestamp: '2025-12-25T10:30:00Z',
  version: 'v1.7'
}
```

### Edge Cases
- Match beendet → LocalStorage clearen
- "Neues Match" → Confirm-Dialog wenn aktives Match
- Versionskompatibilität prüfen

### Akzeptanzkriterien
- [ ] Match wird automatisch gespeichert
- [ ] Reload zeigt "Fortsetzen?"-Dialog
- [ ] "Neues Match" cleared Storage
- [ ] Keine Performance-Regression

**Kategorie:** SOLLTE
**Effort:** 2 Stunden

---

## Issue #6: ⚠️ SOLLTE: Basic Accessibility (A11y)

**Labels:** `accessibility`, `enhancement`

### Problem
App ist nicht barrierefrei:
- Keine ARIA-Labels
- Keine Keyboard-Navigation
- Screen Reader Support fehlt
- Nur `<div>`-Soup, keine semantischen Tags

### Lösung
1. **ARIA-Labels** auf alle interaktiven Elemente
   ```jsx
   <button aria-label="Ass für Spieler A">Ass</button>
   ```

2. **Semantisches HTML**
   - `<header>`, `<main>`, `<section>`
   - `<nav>` für Buttons
   - `<table>` für Stats (schon vorhanden ✓)

3. **Keyboard-Navigation**
   - Tab-Order logisch
   - Enter/Space für Buttons
   - Escape für Modals

4. **Focus-Styles**
   - Sichtbare Focus-Rings
   - Skip-Links

### Standards
- WCAG 2.1 Level A (Minimum)
- Target: Level AA

### Akzeptanzkriterien
- [ ] Lighthouse Accessibility Score >80
- [ ] Screen Reader kann Match tracken
- [ ] Komplette Keyboard-Navigation
- [ ] Focus-Styles sichtbar

**Kategorie:** SOLLTE
**Effort:** 3 Stunden

---

## Issue #7: 💡 KÖNNTE: TailwindCSS Optimierung (JIT)

**Labels:** `performance`, `optimization`

### Problem
Aktuell wird komplettes TailwindCSS via CDN geladen (~3MB):
```html
<script src="https://cdn.tailwindcss.com"></script>
```

Nur ~5% der Klassen werden tatsächlich genutzt.

### Lösung
TailwindCSS JIT-Compiler lokal installieren:
1. `npm install -D tailwindcss postcss autoprefixer`
2. `tailwind.config.js` mit content-Pfaden
3. Purge unused classes
4. Build-Output: ~10-15KB statt 3MB

### Performance-Gewinn
- Bundle Size: -95%
- First Contentful Paint: -500ms
- Lighthouse Performance: +15 Punkte

### Akzeptanzkriterien
- [ ] TailwindCSS lokal installiert
- [ ] JIT-Mode aktiv
- [ ] Finale CSS <20KB
- [ ] Alle Styles funktionieren

**Kategorie:** KÖNNTE
**Effort:** 1 Stunde
**Depends on:** #3 (Vite Setup)

---

## Issue #8: 💡 KÖNNTE: Statistik-Modul extrahieren

**Labels:** `refactoring`, `code-quality`

### Problem
Statistik-Logik ist in Main-Component vermischt:
- `getStats()` - 94 Zeilen (index.html:255-348)
- `formatStat()` - 5 Zeilen
- `getStatsText()` - 50 Zeilen

Schwer zu testen und wiederzuverwenden.

### Lösung
Eigenes Modul `src/utils/stats.js`:
```javascript
export const calculateStats = (history) => { ... }
export const formatStat = (count, total) => { ... }
export const generateStatsText = (stats, players) => { ... }
export const generateCSV = (history, stats, players) => { ... }
```

### Benefits
- Unit-Tests möglich
- Wiederverwendbar (z.B. für Multi-Match-Vergleich)
- Klare Separation of Concerns
- Einfacher zu erweitern

### Akzeptanzkriterien
- [ ] Stats-Modul exportiert reine Funktionen
- [ ] Unit-Tests für calculateStats()
- [ ] Keine Regression in Berechnungen
- [ ] Main-Component reduziert

**Kategorie:** KÖNNTE
**Effort:** 2 Stunden
**Depends on:** #3 (Vite Setup)

---

## Issue #9: 💡 KÖNNTE: React Error Boundary

**Labels:** `enhancement`, `stability`

### Problem
Bei Crashes zeigt App White Screen of Death.
Keine Fehlerbehandlung für:
- State-Korruption
- Unexpected Data
- Runtime Errors

### Lösung
React Error Boundary implementieren:
```jsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <TennolinoTracker />
</ErrorBoundary>
```

### Features
1. Catch React-Errors
2. Fallback-UI mit "Match neu starten"
3. Error-Logging (optional: Sentry)
4. LocalStorage-Recovery versuchen

### Akzeptanzkriterien
- [ ] Error Boundary implementiert
- [ ] Fallback-UI zeigt sinnvolle Message
- [ ] "Neu starten" funktioniert
- [ ] Keine Datenverluste

**Kategorie:** KÖNNTE
**Effort:** 1 Stunde

---

## Issue #10: 💡 KÖNNTE: Progressive Enhancement

**Labels:** `enhancement`, `low-priority`

### Problem
App funktioniert nur mit JavaScript.
Bei JS-Fehler oder deaktiviertem JS: Nichts sichtbar.

### Lösung (Nice-to-have)
Basis-HTML-Formular das auch ohne JS funktioniert:
```html
<form method="POST" action="#">
  <input name="player_a" required>
  <input name="player_b" required>
  <button>Start</button>
</form>
```

React enhanced dann mit Features.

### Reality-Check
**Aufwand:** Hoch (komplettes Re-Design)
**Nutzen:** Niedrig (Tennolino ist kein Formular)
**Empfehlung:** Skip, außer Accessibility-Anforderung

### Alternative
Einfach bessere Fehlermeldung wenn JS fehlt:
```html
<noscript>
  <div class="error">
    JavaScript erforderlich. Bitte aktivieren.
  </div>
</noscript>
```

**Kategorie:** KÖNNTE (Low Priority)
**Effort:** 8 Stunden (full) / 10 Min (noscript)

---

## Umsetzungs-Reihenfolge

### Phase 1 (Sofort):
- Issue #1: Icons generieren
- Issue #2: Toast-Notifications

### Phase 2 (Diese Woche):
- Issue #3: Vite Build-Setup
- Issue #4: Component-Extraktion
- Issue #5: LocalStorage Auto-Save
- Issue #6: Accessibility

### Phase 3 (Nice-to-have):
- Issue #7: TailwindCSS JIT
- Issue #8: Stats-Modul
- Issue #9: Error Boundary
- Issue #10: Progressive Enhancement
