# Spike: Multi-User-Architektur für Tennolino Tracker

> **Datum:** 2026-02-14
> **Status:** Spike / Research - keine Umsetzung
> **Ziel:** Architekturoptionen evaluieren, damit verschiedene User nur auf ihre eigenen Matches zugreifen können (Public Repo)

---

## 1. Ausgangslage (Ist-Zustand)

| Aspekt | Aktuell |
|---|---|
| **Framework** | React 19 + Vite 7 (SPA/PWA) |
| **Datenhaltung** | `localStorage` im Browser |
| **Backend** | Keines - 100% Client-Side |
| **Authentifizierung** | Keine |
| **Deployment** | GitHub Pages (statische Dateien) |
| **Datenmodell** | Match-State, Point-History, Rules, Theme - alles lokal |

### Kernproblem

- Daten sind an einen einzelnen Browser gebunden
- Kein Benutzerkonzept, kein Login
- Repo ist public - Secrets duerfen nicht im Code liegen
- Verschiedene Nutzer (z.B. Trainer) brauchen Zugriff auf *ihre* Matches, aber nicht auf die anderer

---

## 2. Anforderungen an die Zielarchitektur

| # | Anforderung | Prioritaet |
|---|---|---|
| A1 | Benutzer-Authentifizierung (Login/Registrierung) | Must |
| A2 | Datenisolierung: User sieht nur eigene Matches | Must |
| A3 | Persistente Speicherung ueber Geraete hinweg | Must |
| A4 | Public Repo - keine Secrets im Code | Must |
| A5 | Kostenlos oder sehr guenstig im Betrieb | Should |
| A6 | Moeglichst wenig Backend-Infrastruktur | Should |
| A7 | Offline-Faehigkeit beibehalten (PWA) | Should |
| A8 | Social Login (Google, GitHub, etc.) | Could |
| A9 | Matches teilen/exportieren (Optional) | Could |

---

## 3. Architektur-Optionen im Ueberblick

### Option A: Supabase (BaaS mit PostgreSQL + RLS)

```
┌─────────────────┐        ┌──────────────────────────┐
│  React SPA/PWA  │◄──────►│       Supabase Cloud      │
│  (Vite Build)   │  JWT   │                            │
│                 │◄──────►│  Auth (50K MAU free)       │
│  @supabase/     │        │  PostgreSQL (500MB free)   │
│  supabase-js    │        │  Row-Level Security        │
│                 │        │  Edge Functions (optional)  │
└─────────────────┘        └──────────────────────────┘
```

**Wie es funktioniert:**
1. User loggt sich via Supabase Auth ein (Google, GitHub, Email)
2. SPA erhaelt JWT mit `user_id`
3. Jede DB-Query geht direkt vom Browser an Supabase
4. PostgreSQL RLS-Policies filtern automatisch: `WHERE user_id = auth.uid()`
5. Kein eigener Backend-Server noetig

**RLS-Beispiel:**
```sql
-- Tabelle erstellen
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  players JSONB NOT NULL,
  score JSONB NOT NULL,
  sets JSONB NOT NULL,
  point_history JSONB NOT NULL,
  rules JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- RLS aktivieren
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- User sieht nur eigene Matches
CREATE POLICY "select_own" ON matches
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "insert_own" ON matches
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "update_own" ON matches
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "delete_own" ON matches
  FOR DELETE USING (user_id = (SELECT auth.uid()));
```

**Bewertung:**

| Kriterium | Bewertung | Details |
|---|---|---|
| Datenisolierung | Exzellent | DB-Level via RLS, nicht umgehbar |
| Kosten | Kostenlos | Free Tier: 50K MAU, 500MB DB, 1GB Storage |
| Komplexitaet | Niedrig | 1 Dependency (`@supabase/supabase-js`) |
| Vendor Lock-in | Gering | Open Source, self-hostbar |
| Datenmodell-Fit | Sehr gut | Relationales Modell passt zu Match-Daten |
| Offline | Hybridloesung noetig | localStorage als Cache + Sync |
| Security | Sehr gut | Secrets nur auf Supabase, nicht im Repo |

---

### Option B: Firebase (BaaS mit Firestore + Security Rules)

```
┌─────────────────┐        ┌──────────────────────────┐
│  React SPA/PWA  │◄──────►│       Firebase Cloud       │
│  (Vite Build)   │  JWT   │                            │
│                 │◄──────►│  Auth (50K MAU free)       │
│  firebase SDK   │        │  Firestore (NoSQL)         │
│                 │        │  Security Rules             │
│                 │        │  Cloud Functions (optional)  │
└─────────────────┘        └──────────────────────────┘
```

**Wie es funktioniert:**
1. User loggt sich via Firebase Auth ein
2. Firestore Security Rules erzwingen Datenisolierung
3. Daten werden als Documents/Collections gespeichert

**Security Rules Beispiel:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /matches/{matchId} {
      allow read, write: if request.auth != null
                         && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

**Bewertung:**

| Kriterium | Bewertung | Details |
|---|---|---|
| Datenisolierung | Gut | Security Rules auf Document-Level |
| Kosten | Kostenlos | Spark Plan: 50K MAU, 1GB Storage, 50K reads/day |
| Komplexitaet | Niedrig-Mittel | Firebase SDK ist groesser |
| Vendor Lock-in | Hoch | Proprietaer, Google-gebunden |
| Datenmodell-Fit | Mittel | NoSQL - Denormalisierung noetig |
| Offline | Exzellent | Eingebaute Offline-Persistenz |
| Security | Gut | Aber Security Rules sind JSON, fehleranfaellig |

---

### Option C: Eigener Backend-Server (Node.js/Express + DB)

```
┌─────────────────┐       ┌───────────────────┐       ┌──────────┐
│  React SPA/PWA  │◄─────►│  Node.js/Express  │◄─────►│ Postgres │
│  (Vite Build)   │  API  │  + JWT Auth        │       │ / SQLite │
│                 │       │  + Middleware       │       │          │
└─────────────────┘       └───────────────────┘       └──────────┘
```

**Wie es funktioniert:**
1. Eigener Express-Server mit JWT-Auth
2. API-Endpoints pruefen `req.user.id` bei jeder Query
3. DB-Queries filtern nach User

**Bewertung:**

| Kriterium | Bewertung | Details |
|---|---|---|
| Datenisolierung | Gut | Im Application-Layer implementiert |
| Kosten | Variabel | Hosting noetig (Fly.io, Railway, Render free tiers) |
| Komplexitaet | Hoch | Server, DB, Auth, Deployment, Monitoring |
| Vendor Lock-in | Keiner | Alles selbst kontrolliert |
| Datenmodell-Fit | Sehr gut | Volle Kontrolle ueber Schema |
| Offline | Aufwendig | Eigene Sync-Logik noetig |
| Security | Abhaengig | Muss selbst richtig implementiert werden |

---

### Option D: Clerk/Auth0 (Auth-Only) + Separate DB

```
┌─────────────────┐       ┌────────────┐
│  React SPA/PWA  │◄─────►│ Clerk/Auth0│   (Auth only)
│  (Vite Build)   │       └────────────┘
│                 │
│                 │◄─────►┌────────────┐
│                 │       │ Neon / Turso│   (DB only)
└─────────────────┘       └────────────┘
```

**Bewertung:**

| Kriterium | Bewertung | Details |
|---|---|---|
| Datenisolierung | Mittel | Muss im Client oder via Edge Functions implementiert werden |
| Kosten | Kostenlos moeglich | Clerk: 10K MAU free + Neon: 0.5GB free |
| Komplexitaet | Mittel | Zwei Services integrieren, kein natives RLS |
| Vendor Lock-in | Mittel | Clerk ist proprietaer |
| Datenmodell-Fit | Gut | Neon ist PostgreSQL |
| Offline | Aufwendig | Eigene Sync-Logik |
| Security | Gut | Aber RLS muss manuell konfiguriert werden |

---

## 4. Detailvergleich: Kosten & Free Tiers

| Anbieter | Free Auth MAUs | Free DB | Gesamt-Free-Paket |
|---|---|---|---|
| **Supabase** | 50.000 | 500 MB PostgreSQL | Auth + DB + Storage + Edge Functions |
| **Firebase** | 50.000 | 1 GB Firestore (50K reads/day) | Auth + DB + Hosting + Functions |
| **Clerk** | 10.000 | - (nur Auth) | Nur Auth, DB separat noetig |
| **Auth0** | 7.500 | - (nur Auth) | Nur Auth, DB separat noetig |
| **Neon** | - | 0.5 GB PostgreSQL | Nur DB, Auth separat noetig |
| **Turso** | - | 9 GB SQLite (Edge) | Nur DB, Auth separat noetig |

---

## 5. Datenmodell-Entwurf (Supabase/PostgreSQL)

### Tabellenstruktur

```sql
-- Benutzer werden von Supabase Auth verwaltet (auth.users)

-- Matches
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  player_a TEXT NOT NULL,
  player_b TEXT NOT NULL,
  winner TEXT, -- 'a' | 'b' | NULL (laufend)
  match_over BOOLEAN DEFAULT false,
  rules JSONB NOT NULL DEFAULT '{"setTargets":[7,7,5],"bestOf":3,"serveChangeInterval":2}',
  final_score JSONB, -- {sets: {a:2, b:1}, setDetails: [...]}
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Point History (1:n zu matches)
CREATE TABLE points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  sequence_number INTEGER NOT NULL,
  winner TEXT NOT NULL, -- 'a' | 'b'
  point_type TEXT NOT NULL, -- 'ace', 'double_fault', 'winner', 'forced_error', 'unforced_error'
  server TEXT NOT NULL, -- 'a' | 'b'
  is_second_serve BOOLEAN DEFAULT false,
  set_number INTEGER NOT NULL,
  score_after JSONB NOT NULL,
  sets_after JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Statistiken (materialisierte Zusammenfassung, optional)
CREATE TABLE match_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  stats JSONB NOT NULL, -- Komplettes Statistik-Objekt
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_points_match_id ON points(match_id);
CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_statistics_match_id ON match_statistics(match_id);

-- RLS fuer alle Tabellen
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;

-- Policies (Muster fuer alle Tabellen gleich)
CREATE POLICY "own_data" ON matches FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "own_data" ON points FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "own_data" ON match_statistics FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
```

### Alternative: Flaches Modell (einfacher)

Statt normalisierter Tabellen koennte das komplette Match als ein JSONB-Dokument gespeichert werden:

```sql
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  match_data JSONB NOT NULL, -- Gesamtes Match-Objekt aus localStorage
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Vorteil:** Minimale Migration - das bestehende localStorage-Objekt wird 1:1 gespeichert.
**Nachteil:** Keine relationalen Queries auf Einzelpunkte moeglich, grossere Payloads.

---

## 6. Offline-Strategie

Da die App eine PWA ist, muss Offline-Faehigkeit erhalten bleiben.

### Empfohlenes Pattern: Local-First mit Sync

```
┌──────────────────────────────────────────┐
│                Browser                    │
│                                          │
│  ┌──────────────┐    ┌───────────────┐   │
│  │ localStorage  │◄──►│ Sync-Manager  │   │
│  │ (offline)     │    │               │   │
│  └──────────────┘    └───────┬───────┘   │
│                              │            │
└──────────────────────────────┼────────────┘
                               │ online?
                               ▼
                    ┌──────────────────┐
                    │    Supabase DB    │
                    └──────────────────┘
```

1. **Match-Aufzeichnung** laeuft immer lokal (localStorage) - wie bisher
2. **Nach Abschluss** (oder bei Verbindung) wird das Match in Supabase gespeichert
3. **Match-Liste** wird aus Supabase geladen (mit lokalem Cache)
4. **Konfliktloesung:** "Last Write Wins" - fuer Match-Daten ausreichend, da ein Match immer nur auf einem Geraet gleichzeitig erfasst wird

### Sync-Varianten

| Variante | Beschreibung | Komplexitaet |
|---|---|---|
| **A: Manueller Upload** | Button "Match speichern" nach Abschluss | Sehr niedrig |
| **B: Auto-Sync bei Verbindung** | Navigator.onLine + Supabase Realtime | Mittel |
| **C: Full Offline-First** | Service Worker + Background Sync API | Hoch |

**Empfehlung:** Mit Variante A starten, spaeter auf B upgraden.

---

## 7. Security-Betrachtungen (Public Repo)

### Problem: Secrets im Public Repo

Das Repo ist oeffentlich. Supabase-Credentials (API-URL, Anon Key) muessen trotzdem im Frontend-Code stehen, da der Browser sie braucht.

### Loesung: Supabase Anon Key ist *designed* to be public

| Key-Typ | Im Frontend? | Zweck |
|---|---|---|
| `SUPABASE_URL` | Ja (public) | API-Endpunkt |
| `SUPABASE_ANON_KEY` | Ja (public) | Oeffentlicher API-Key, beschraenkt durch RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **NIEMALS** | Admin-Key, umgeht RLS |

**Warum der Anon Key oeffentlich sein darf:**
- Er erlaubt nur Zugriff auf Zeilen, die durch RLS-Policies freigegeben sind
- Ohne gueltiges Auth-Token (JWT) ist der Zugang auf `anon`-Rolle beschraenkt
- RLS-Policies definieren, was `anon` vs. `authenticated` darf
- Der Anon Key allein reicht nicht, um fremde Daten zu lesen

**Zusaetzliche Absicherung:**
- Rate Limiting auf Supabase-Ebene konfigurieren
- `anon`-Rolle komplett blockieren (kein Zugriff ohne Login):
  ```sql
  -- Kein oeffentlicher Zugriff, nur eingeloggte User
  CREATE POLICY "authenticated_only" ON matches
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()));
  ```

---

## 8. Fehlende Features im aktuellen Frontend

### 8.1 Datum/Uhrzeit auf Match-Ebene

**Ist-Zustand:** Einzelne Punkte haben bereits `timestamp: new Date().toISOString()` (in `useMatchLogic.js:92`). Aber es gibt kein Match-Level Start-/End-Zeitstempel.

**Soll:** Match-Objekt braucht `startedAt` (beim Start setzen) und `finishedAt` (bei Match-Ende setzen). Das ist unabhaengig von der Multi-User-Architektur sinnvoll und sollte vorher implementiert werden.

### 8.2 Match-uebergreifende Statistiken

**Ist-Zustand:** `calculateStats()` in `statistics.js` berechnet nur Statistiken fuer ein einzelnes Match. Es gibt keine Aggregation ueber mehrere Matches.

**Soll (bestaetigt):**
- **Gewinn/Verlust-Bilanz:** Gesamtrekord, Winrate, Siegesserie, Bilanz pro Gegner
- **Trends ueber Zeit:** Entwicklung von Aufschlag-%, Unforced Error Rate, Winner:Error Ratio ueber Wochen/Monate als Linien-Charts

**Benoetigt:** Eine `calculateAggregateStats(matches[])` Funktion und neue Chart-Komponenten.

### 8.3 Aufwandsschaetzung (Gesamtueberblick)

| Phase | Umfang | Schaetzung |
|---|---|---|
| Phase 1: Auth | Supabase Setup, Login, Auth Context | ~1-2 Sessions |
| Phase 2: Persistenz | DB-Tabellen, RLS, Speichern/Laden | ~2-3 Sessions |
| Phase 3: Match-History + Stats | Dashboard, Aggregierte Stats, Trends | ~2-3 Sessions |
| Phase 4: Offline-Sync | Sync-Manager, Queue | ~2-3 Sessions |
| Phase 5: Match-Sharing | Public Links, Sharing-RLS | ~1-2 Sessions |
| **MVP (Phase 1-2)** | | **~3-5 Sessions** |
| **Solides Produkt (Phase 1-3)** | | **~5-8 Sessions** |
| **Komplett (Phase 1-5)** | | **~8-13 Sessions** |

Detaillierte Planung siehe `projekt.md`.

---

## 9. Empfehlung

### Klare Empfehlung: Supabase (Option A)

**Gruende:**

1. **All-in-One:** Auth + PostgreSQL + RLS + Edge Functions in einem Service
2. **Kostenlos:** Free Tier deckt den erwarteten Nutzungsumfang vollstaendig ab
3. **Datenisolierung auf DB-Level:** RLS ist der Gold-Standard - selbst bei einem Bug im Frontend-Code kann kein User fremde Daten sehen
4. **Minimaler Umbau:** Nur eine Dependency hinzufuegen, bestehende Logik bleibt
5. **Public-Repo-kompatibel:** Anon Key ist designt fuer den Einsatz in oeffentlichem Frontend-Code
6. **Open Source:** Kein Vendor Lock-in, self-hosting moeglich
7. **Relationales Modell:** PostgreSQL passt perfekt auf die Match/Points/Statistics-Struktur
8. **Skalierungspfad:** Von Free Tier bis Enterprise ohne Architekturwechsel

### Warum nicht Firebase?

- NoSQL erfordert Denormalisierung der relationalen Match-Daten
- Security Rules sind fehleranfaelliger als SQL-basierte RLS-Policies
- Vendor Lock-in (Google proprietaer, nicht self-hostbar)
- Firestore Security Rules testen ist umstaendlicher

### Warum kein eigener Backend-Server?

- Massiver Komplexitaetszuwachs (Server, Deployment, Monitoring, SSL, etc.)
- Laufende Kosten fuer Hosting
- Auth selbst implementieren ist fehleranfaellig
- Fuer die Groesse dieser App voellig ueberdimensioniert

---

## 10. Risiken und offene Fragen

| Risiko / Frage | Bewertung | Mitigation |
|---|---|---|
| Supabase Free Tier koennte sich aendern | Mittel | Self-Hosting als Fallback, Open Source |
| Offline-Sync-Komplexitaet | Mittel | Mit manuellem Upload starten |
| Migration bestehender localStorage-Daten | Niedrig | Einmalige Import-Funktion bauen |
| Bundle-Size durch Supabase SDK | Niedrig | `@supabase/supabase-js` ist ~12KB gzipped |
| Latenz bei DB-Queries vom Browser | Niedrig | Supabase hat EU-Region, Queries sind einfach |
| GitHub Pages + SPA-Routing | Mittel | 404.html Redirect oder auf Vercel wechseln |

---

## Quellen

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase vs Firebase Comparison](https://supabase.com/alternatives/supabase-vs-firebase)
- [OAuth 2.0 for SPAs - Best Practices (Curity)](https://curity.io/resources/learn/spa-best-practices/)
- [Firebase Auth Pricing](https://firebase.google.com/pricing)
- [Clerk Pricing](https://clerk.com/pricing)
- [Web Application Architecture Patterns 2026](https://www.clickittech.com/software-development/web-application-architecture/)
- [Scalable Web Apps: Architecture & Growth Guide](https://www.dappinity.com/blog/building-scalable-web-apps-best-practices-and-architecture-patterns)
