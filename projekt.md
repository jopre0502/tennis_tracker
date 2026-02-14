# Projektplan: Multi-User Tennolino Tracker

> **Erstellt:** 2026-02-14
> **Grundlage:** SPIKE-multiuser-architecture.md
> **Technologie-Entscheidung:** Supabase (Auth + PostgreSQL + RLS)
> **Architektur-Entscheidung:** SPA + BaaS (kein eigener Backend-Server)

---

## Bestaetigte Entscheidungen

| Entscheidung | Wert |
|---|---|
| Backend/BaaS | Supabase |
| Login-Methoden | Google + Email/Passwort |
| Hosting | GitHub Pages (beibehalten) |
| Offline-Faehigkeit | Ja - Match-Aufzeichnung muss offline funktionieren |
| Match-Sharing | Ja - Matches per Link teilbar |
| Statistiken (aggregiert) | Gewinn/Verlust-Bilanz + Trends ueber Zeit |

---

## Phase 0: Vorbereitung (Frontend-Anpassungen ohne Supabase)

> Ziel: Bestehende App um fehlende Datenfelder erweitern, bevor die Backend-Integration beginnt.

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 0.1 | **Match-Zeitstempel** | `startedAt` wird beim Match-Start gesetzt, `finishedAt` beim Match-Ende. Beide Werte werden im localStorage-State mitgespeichert. |
| 0.2 | **Match-Dauer-Anzeige** | ResultsScreen zeigt Datum, Startzeit und Dauer des Matches an (berechnet aus `finishedAt - startedAt`). |
| 0.3 | **Datenmodell stabilisieren** | Das localStorage-Objekt bekommt eine `version`-Property (z.B. `version: 2`), damit spaetere Migrationen moeglich sind. |

### Definition of Done (Phase 0)

- [ ] `startedAt` wird beim Uebergang `editing=true -> editing=false` als ISO-8601 Timestamp gesetzt
- [ ] `finishedAt` wird beim Setzen von `matchOver=true` als ISO-8601 Timestamp gesetzt
- [ ] Beide Felder werden in localStorage persistiert und beim Reload wiederhergestellt
- [ ] ResultsScreen zeigt Datum (z.B. "14.02.2026"), Uhrzeit (z.B. "15:30") und Dauer (z.B. "47 Min.") an
- [ ] CSV-Export enthaelt `startedAt` und `finishedAt`
- [ ] localStorage-State hat `version: 2` Property
- [ ] Bestehende Tests laufen gruen
- [ ] Neue Tests fuer Zeitstempel-Logik vorhanden

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/hooks/useMatchLogic.js` | `startedAt`/`finishedAt` State + Persistierung |
| `src/components/ResultsScreen.jsx` | Datum/Uhrzeit/Dauer Anzeige |
| `src/hooks/useMatchLogic.js` (Export) | CSV-Export um Timestamps erweitern |

---

## Phase 1: Authentifizierung

> Ziel: User koennen sich einloggen. Die App erkennt, wer eingeloggt ist. Noch keine Datenpersistierung.

### Voraussetzungen

- Supabase-Projekt manuell erstellt (Dashboard: https://supabase.com/dashboard)
- Google OAuth Credentials erstellt (Google Cloud Console)
- Email/Password Auth in Supabase aktiviert
- Google Provider in Supabase Auth konfiguriert

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 1.1 | **Supabase Client** | `src/lib/supabase.js` - Initialisierter Supabase-Client mit URL und Anon Key aus Vite Environment Variables (`import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`). |
| 1.2 | **Auth Context** | `src/contexts/AuthContext.jsx` - React Context der den aktuellen User und Auth-State (loading, authenticated, unauthenticated) bereitstellt. Subscription auf `onAuthStateChange`. |
| 1.3 | **Login-Screen** | Neue Komponente `src/components/LoginScreen.jsx` mit: Google Login Button, Email/Passwort Formular (Login + Registrierung), Fehleranzeige bei falschen Credentials. |
| 1.4 | **Auth-Gate in App.jsx** | App.jsx prueft Auth-State: unauthenticated -> LoginScreen, authenticated -> bisherige App (SetupScreen/MatchScreen/ResultsScreen). |
| 1.5 | **Logout** | Logout-Button im Header/Menu. Nach Logout -> zurueck zum LoginScreen. |
| 1.6 | **Environment Variables** | `.env.example` Datei mit Platzhaltern (committed). `.env` in `.gitignore` (nicht committed). Vite-Konfiguration fuer `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`. |
| 1.7 | **GitHub Pages Build** | GitHub Actions Workflow oder Build-Script das die Environment Variables beim Deploy injiziert (via GitHub Secrets). |

### Definition of Done (Phase 1)

- [ ] User kann sich mit Google einloggen (OAuth Redirect Flow)
- [ ] User kann sich mit Email/Passwort registrieren und einloggen
- [ ] Nach erfolgreichem Login wird der SetupScreen angezeigt
- [ ] Auth-State bleibt nach Page Refresh erhalten (Supabase Session)
- [ ] User kann sich ausloggen, danach wird LoginScreen angezeigt
- [ ] Ohne Login ist kein Zugriff auf die App moeglich
- [ ] `.env` ist in `.gitignore`, keine Secrets im Repo
- [ ] `.env.example` mit Platzhaltern ist committed
- [ ] Build auf GitHub Pages funktioniert mit GitHub Secrets
- [ ] Loading-State wird waehrend Auth-Check angezeigt (kein Flash)
- [ ] Fehlerhafte Login-Versuche zeigen verstaendliche Fehlermeldung

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/lib/supabase.js` | Neu: Supabase Client |
| `src/contexts/AuthContext.jsx` | Neu: Auth Context + Provider |
| `src/components/LoginScreen.jsx` | Neu: Login UI |
| `src/App.jsx` | Auth-Gate, AuthProvider wrappen |
| `.env.example` | Neu: Platzhalter fuer Supabase Keys |
| `.gitignore` | `.env` hinzufuegen |
| `package.json` | `@supabase/supabase-js` Dependency |

---

## Phase 2: Datenpersistierung

> Ziel: Abgeschlossene Matches werden in Supabase gespeichert und koennen spaeter wieder angesehen werden.

### Voraussetzungen

- Phase 1 abgeschlossen
- Supabase-Tabellen und RLS-Policies erstellt (SQL in SPIKE-Dokument)

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 2.1 | **DB-Schema** | SQL-Migrations-Script zum Erstellen der Tabellen `matches` und RLS-Policies. Wird im Supabase Dashboard oder via Supabase CLI ausgefuehrt. Script liegt im Repo unter `supabase/migrations/001_initial_schema.sql`. |
| 2.2 | **Match speichern** | Nach Match-Ende (`matchOver=true`) wird das komplette Match-Objekt (inkl. Point History, Score, Rules, Timestamps) in die `matches`-Tabelle geschrieben. Flaches JSONB-Modell: Das gesamte localStorage-Objekt wird als `match_data` JSONB gespeichert. Zusaetzlich werden `player_a`, `player_b`, `winner`, `started_at`, `finished_at` als eigene Spalten fuer Queries extrahiert. |
| 2.3 | **Match-History-Screen** | Neue Komponente `src/components/MatchHistoryScreen.jsx`: Liste aller eigenen abgeschlossenen Matches. Sortiert nach Datum (neueste zuerst). Zeigt: Datum, Spieler, Ergebnis, Dauer. Tap/Click oeffnet Match-Detail. |
| 2.4 | **Match-Detail-Ansicht** | Bestehender ResultsScreen wird wiederverwendet: Kann ein gespeichertes Match aus Supabase laden und alle Statistiken/Charts anzeigen (gleiche Darstellung wie direkt nach Match-Ende). |
| 2.5 | **Match loeschen** | Swipe-to-Delete oder Delete-Button in der Match-History. Bestaetigung via Dialog. Loescht aus Supabase (RLS stellt sicher: nur eigene). |
| 2.6 | **Navigation** | Einfache Navigation zwischen: LoginScreen, SetupScreen (neues Match), MatchScreen (laufendes Match), ResultsScreen (Ergebnis), MatchHistoryScreen (alle Matches). Kein React Router noetig - State-basierte Navigation wie bisher erweitern. |
| 2.7 | **useMatchPersistence Hook** | `src/hooks/useMatchPersistence.js` - Kapselt alle Supabase-CRUD-Operationen: `saveMatch()`, `loadMatches()`, `loadMatch(id)`, `deleteMatch(id)`. Wird von anderen Komponenten konsumiert. |

### Definition of Done (Phase 2)

- [ ] Nach Match-Ende wird das Match automatisch in Supabase gespeichert
- [ ] User erhaelt Feedback (Toast) ob Speichern erfolgreich war
- [ ] Match-History zeigt alle eigenen Matches chronologisch an
- [ ] Match-History ist leer fuer einen neuen User (kein Zugriff auf fremde Daten)
- [ ] Tap auf ein Match in der History oeffnet die Detail-Ansicht mit allen Stats
- [ ] Match kann aus der History geloescht werden (mit Bestaetigungs-Dialog)
- [ ] RLS-Policies verhindern Zugriff auf fremde Matches (manuell getestet mit 2 Accounts)
- [ ] Match-History zeigt Datum, Spielernamen, Ergebnis und Dauer
- [ ] Navigation zwischen History und neuem Match funktioniert fluessig
- [ ] Bestehende Match-Aufzeichnung funktioniert weiterhin (kein Breaking Change)

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `supabase/migrations/001_initial_schema.sql` | Neu: DB-Schema + RLS |
| `src/hooks/useMatchPersistence.js` | Neu: Supabase CRUD Hook |
| `src/hooks/useMatchLogic.js` | Erweitern: Nach Match-Ende `saveMatch()` aufrufen |
| `src/components/MatchHistoryScreen.jsx` | Neu: Match-Liste |
| `src/components/ResultsScreen.jsx` | Erweitern: Kann gespeichertes Match laden |
| `src/App.jsx` | Navigation erweitern |

### Datenbank-Schema (bestaetigt)

```sql
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  player_a TEXT NOT NULL,
  player_b TEXT NOT NULL,
  winner TEXT NOT NULL,           -- 'a' | 'b'
  match_data JSONB NOT NULL,      -- Komplettes Match-Objekt
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_started_at ON matches(started_at DESC);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own matches" ON matches
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
```

---

## Phase 3: Aggregierte Statistiken

> Ziel: User sieht Gewinn/Verlust-Bilanz und Trends ueber alle gespeicherten Matches hinweg.

### Voraussetzungen

- Phase 2 abgeschlossen
- Mindestens 3-5 gespeicherte Matches zum sinnvollen Testen

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 3.1 | **Aggregate Stats Utility** | `src/utils/aggregateStatistics.js` - Berechnet aus einem Array von Matches: Gesamtrekord (Siege/Niederlagen), Winrate (%), aktuelle Siegesserie/Niederlagenserie, Bilanz pro Gegner (Head-to-Head). |
| 3.2 | **Trend Stats Utility** | `src/utils/trendStatistics.js` - Berechnet pro Match (chronologisch sortiert): Aufschlag-Gewinnquote (1st Serve %, 2nd Serve %), Unforced Error Rate (UE pro gespieltem Punkt), Winner:Error Ratio, Aggressive Margin. Gibt Arrays zurueck die direkt als Recharts-Daten nutzbar sind. |
| 3.3 | **Dashboard-Screen** | `src/components/DashboardScreen.jsx` - Uebersichtsseite nach Login: Gewinn/Verlust-Kachel (z.B. "15 Siege / 8 Niederlagen - 65%"), aktuelle Serie (z.B. "3 Siege in Folge"), letztes Match (Gegner, Ergebnis, Datum), Quick-Actions: "Neues Match starten" / "Match-History". |
| 3.4 | **Trend-Charts** | `src/components/TrendCharts.jsx` - Linien-Charts (Recharts) mit X-Achse = Datum, Y-Achse = Metrik: Aufschlag-Gewinnquote ueber Zeit, Unforced Error Rate ueber Zeit, Winner:Error Ratio ueber Zeit. Filter: Letzte 10 / 20 / Alle Matches. |
| 3.5 | **Head-to-Head Ansicht** | In der Match-History: Gegner-Filter. Zeigt Bilanz gegen einen bestimmten Gegner und nur dessen Matches. |
| 3.6 | **Navigation erweitern** | Nach Login -> Dashboard (statt direkt SetupScreen). Von Dashboard aus: "Neues Match" oder "History" oder "Trends". |

### Definition of Done (Phase 3)

- [ ] Dashboard zeigt Gesamtrekord (Siege/Niederlagen/Winrate)
- [ ] Dashboard zeigt aktuelle Serie (Siege oder Niederlagen in Folge)
- [ ] Dashboard zeigt das letzte gespielte Match (Gegner, Ergebnis, Datum)
- [ ] Trend-Charts zeigen mindestens 3 Metriken als Linien-Charts
- [ ] Trend-Charts haben Filter fuer Zeitraum (letzte 10/20/alle Matches)
- [ ] X-Achse der Trend-Charts zeigt Datum, Y-Achse die jeweilige Metrik
- [ ] Head-to-Head: User kann nach Gegner filtern und sieht Bilanz
- [ ] Bei weniger als 2 Matches wird ein Hinweis statt leerer Charts angezeigt
- [ ] Alle Berechnungen haben Unit Tests
- [ ] Dashboard ist der neue Einstiegspunkt nach Login

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/utils/aggregateStatistics.js` | Neu: Gewinn/Verlust Berechnung |
| `src/utils/trendStatistics.js` | Neu: Trend-Berechnung |
| `src/components/DashboardScreen.jsx` | Neu: Dashboard UI |
| `src/components/TrendCharts.jsx` | Neu: Trend Linien-Charts |
| `src/components/MatchHistoryScreen.jsx` | Erweitern: Gegner-Filter |
| `src/App.jsx` | Navigation: Dashboard als Startseite |

---

## Phase 4: Offline-Sync

> Ziel: Match-Aufzeichnung funktioniert ohne Internet. Matches werden synchronisiert sobald Verbindung besteht.

### Voraussetzungen

- Phase 2 abgeschlossen
- Verstaendnis der bestehenden PWA/Service-Worker-Konfiguration

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 4.1 | **Offline-Erkennung** | `src/hooks/useOnlineStatus.js` - Hook der `navigator.onLine` und die Events `online`/`offline` nutzt. Zeigt in der App einen Offline-Indikator (z.B. Banner "Offline - Matches werden lokal gespeichert"). |
| 4.2 | **Offline-Queue** | `src/lib/offlineQueue.js` - Wenn beim Speichern nach Match-Ende kein Internet vorhanden ist: Match wird in einer localStorage-Queue (`tennolino-offline-queue`) gespeichert. Queue-Eintraege haben Status: `pending`, `syncing`, `synced`, `failed`. |
| 4.3 | **Auto-Sync bei Reconnect** | Wenn die App online geht (`online` Event): Alle `pending` Eintraege aus der Queue werden sequentiell an Supabase gesendet. Erfolgreiche Eintraege werden aus der Queue entfernt. Fehlgeschlagene bleiben in der Queue (Retry beim naechsten `online` Event). |
| 4.4 | **Sync-Status UI** | Badge/Indikator im Dashboard: "2 Matches warten auf Sync" oder "Alle Matches synchronisiert". In der Match-History: Nicht-synchronisierte Matches werden markiert (z.B. Cloud-Icon mit Ausrufezeichen). |
| 4.5 | **Match-History Hybrid** | Match-History zeigt sowohl Supabase-Matches als auch lokale Queue-Matches in einer gemeinsamen Liste. Lokale Matches sind als "noch nicht synchronisiert" erkennbar. |

### Definition of Done (Phase 4)

- [ ] Match-Aufzeichnung funktioniert komplett ohne Internet (wie bisher)
- [ ] Nach Match-Ende offline: Match wird in lokaler Queue gespeichert
- [ ] Offline-Banner wird angezeigt wenn kein Internet verfuegbar
- [ ] Bei Wiederherstellung der Verbindung werden Queue-Matches automatisch synchronisiert
- [ ] User erhaelt Toast-Benachrichtigung bei erfolgreichem Sync
- [ ] Dashboard zeigt Anzahl nicht-synchronisierter Matches
- [ ] Match-History zeigt lokale und remote Matches zusammen
- [ ] Nicht-synchronisierte Matches sind visuell als solche erkennbar
- [ ] Doppelte Eintraege werden verhindert (Idempotenz via Match-ID)
- [ ] Manuell getestet: Flugmodus an -> Match spielen -> Flugmodus aus -> Match erscheint in Supabase

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/hooks/useOnlineStatus.js` | Neu: Online/Offline Hook |
| `src/lib/offlineQueue.js` | Neu: Queue-Management |
| `src/hooks/useMatchPersistence.js` | Erweitern: Queue-Integration |
| `src/components/DashboardScreen.jsx` | Erweitern: Sync-Status |
| `src/components/MatchHistoryScreen.jsx` | Erweitern: Hybrid-Liste |
| `src/App.jsx` | Offline-Banner |

---

## Phase 5: Match-Sharing

> Ziel: Ein Match kann per Link geteilt werden. Der Empfaenger sieht die Statistiken ohne eigenen Login.

### Voraussetzungen

- Phase 2 abgeschlossen
- Ueberlegung: GitHub Pages unterstuetzt kein Server-Side Rendering. Der Share-Link muss clientseitig aufloesbar sein.

### Deliverables

| # | Deliverable | Beschreibung |
|---|---|---|
| 5.1 | **Share-Token Generierung** | Beim Teilen eines Matches wird ein `share_token` (UUID) generiert und in der `matches`-Tabelle gespeichert. Neue Spalte: `share_token UUID DEFAULT NULL`. |
| 5.2 | **RLS-Policy fuer geteilte Matches** | Zusaetzliche RLS-Policy: Jeder (auch `anon`) darf ein Match lesen wenn er den korrekten `share_token` als Query-Parameter mitgibt. Eigene Matches bleiben wie bisher ueber `user_id` zugaenglich. |
| 5.3 | **Share-Button** | In der Match-Detail-Ansicht und ResultsScreen: "Match teilen" Button. Generiert einen Share-Link mit dem Token (z.B. `https://.../#/shared/<share_token>`). Kopiert Link in die Zwischenablage. |
| 5.4 | **Shared-Match-View** | Neue Komponente `src/components/SharedMatchView.jsx`: Laedt Match via `share_token` (RPC oder Query mit Token). Zeigt Ergebnis + Statistiken + Charts (Read-Only). Kein Login noetig. Kein Zugriff auf andere Matches. |
| 5.5 | **Share widerrufen** | Button "Teilen beenden" im Match-Detail. Setzt `share_token` auf `NULL`. Bestehende Share-Links funktionieren danach nicht mehr. |
| 5.6 | **URL-Routing fuer Shared Links** | Hash-basiertes Routing (`#/shared/<token>`) damit es auf GitHub Pages funktioniert (kein Server-Side Redirect noetig). App erkennt beim Laden ob ein Share-Token in der URL ist und zeigt direkt die SharedMatchView. |

### Definition of Done (Phase 5)

- [ ] User kann fuer ein abgeschlossenes Match einen Share-Link generieren
- [ ] Share-Link wird in die Zwischenablage kopiert (mit Toast-Bestaetigung)
- [ ] Empfaenger kann den Link oeffnen ohne eingeloggt zu sein
- [ ] Empfaenger sieht Ergebnis, Statistiken und Charts des geteilten Matches
- [ ] Empfaenger sieht keine anderen Matches des Senders
- [ ] Share-Link kann vom Besitzer widerrufen werden
- [ ] Nach Widerruf zeigt der Link eine "Match nicht verfuegbar" Meldung
- [ ] Hash-Routing funktioniert auf GitHub Pages (kein 404)
- [ ] RLS-Policy manuell getestet: Ohne korrekten Token kein Zugriff auf fremde Matches

### RLS-Policy fuer Sharing

```sql
-- Spalte hinzufuegen
ALTER TABLE matches ADD COLUMN share_token UUID DEFAULT NULL;
CREATE INDEX idx_matches_share_token ON matches(share_token) WHERE share_token IS NOT NULL;

-- Erweiterte RLS: eigene Matches ODER gueltiger Share-Token
DROP POLICY "Users manage own matches" ON matches;

-- Eigene Matches: voller Zugriff
CREATE POLICY "Users manage own matches" ON matches
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Geteilte Matches: nur Lesen, nur mit Token
-- Wird via Supabase RPC oder .eq('share_token', token) aufgerufen
CREATE POLICY "Anyone can view shared matches" ON matches
  FOR SELECT TO anon, authenticated
  USING (share_token IS NOT NULL AND share_token = current_setting('request.headers')::json->>'x-share-token');
```

> **Hinweis:** Die exakte Implementierung der Token-Validierung in RLS haengt davon ab, wie der Token uebermittelt wird. Alternative: Supabase Edge Function die den Token validiert und das Match zurueckgibt. Beides muss in Phase 5 evaluiert werden.

### Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `supabase/migrations/002_sharing.sql` | Neu: share_token Spalte + RLS |
| `src/components/SharedMatchView.jsx` | Neu: Read-Only Match-Ansicht |
| `src/components/ResultsScreen.jsx` | Erweitern: Share-Button |
| `src/components/MatchHistoryScreen.jsx` | Erweitern: Share-Status Indikator |
| `src/hooks/useMatchPersistence.js` | Erweitern: shareMatch(), revokeShare() |
| `src/App.jsx` | Hash-Routing fuer Shared-Links |

---

## Phasen-Abhaengigkeiten

```
Phase 0 ──► Phase 1 ──► Phase 2 ──┬──► Phase 3
                                   │
                                   ├──► Phase 4
                                   │
                                   └──► Phase 5
```

- Phase 0 hat keine externen Abhaengigkeiten (reine Frontend-Arbeit)
- Phase 1 benoetigt ein manuell erstelltes Supabase-Projekt + Google OAuth Credentials
- Phase 2 benoetigt Phase 1 (Auth muss funktionieren)
- Phase 3, 4, 5 benoetigen Phase 2, sind aber untereinander **unabhaengig** und koennen in beliebiger Reihenfolge umgesetzt werden

---

## Zusammenfassung: Gesamtaufwand

| Phase | Beschreibung | Abhaengigkeit | Schaetzung |
|---|---|---|---|
| **Phase 0** | Timestamps + Datenmodell-Version | Keine | ~1 Session |
| **Phase 1** | Authentifizierung (Google + Email) | Phase 0 | ~1-2 Sessions |
| **Phase 2** | Datenpersistierung + Match-History | Phase 1 | ~2-3 Sessions |
| **Phase 3** | Aggregierte Stats + Trends + Dashboard | Phase 2 | ~2-3 Sessions |
| **Phase 4** | Offline-Sync | Phase 2 | ~2-3 Sessions |
| **Phase 5** | Match-Sharing via Link | Phase 2 | ~1-2 Sessions |
| | | **Gesamt:** | **~9-14 Sessions** |

### Empfohlene Reihenfolge

1. **Phase 0** - Schneller Quick-Win, Grundlage fuer alles
2. **Phase 1** - Auth ist Voraussetzung fuer alles Weitere
3. **Phase 2** - Kernfunktionalitaet: Matches speichern und laden
4. **Phase 3** - Hoechster User-Value: Statistiken und Trends
5. **Phase 5** - Match-Sharing (einfacher als Offline-Sync)
6. **Phase 4** - Offline-Sync (komplex, aber nice-to-have da Matches weiterhin lokal aufgezeichnet werden)
