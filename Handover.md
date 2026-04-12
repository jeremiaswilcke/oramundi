# Ora Mundi - Handover

## Status

Die App ist live unter **https://ora-mundi.vercel.app** (Vercel-Projekt: `ora-mundi`).
Supabase-Projekt: `gbczpovjxftfixzzelfy`

### Erledigt

- [x] SQL-Migration (`00001_initial_schema.sql`) auf Supabase ausgeführt (manuell via SQL Editor)
- [x] Supabase-Credentials und MapTiler-Token in `.env.local` eingetragen
- [x] Map-Provider von Mapbox auf **MapTiler** umgestellt (kostenlos, keine Kreditkarte)
- [x] Git-Repo initialisiert und auf GitHub gepusht (`github.com/jeremiaswilcke/oramundi`)
- [x] Vercel-Projekt erstellt, Env-Vars gesetzt, Production-Deploy erfolgreich
- [x] Git Safe-Directory für Netzlaufwerk konfiguriert

### Offen

- [ ] **Google OAuth** konfigurieren (siehe unten)
- [ ] Altes Vercel-Projekt `oramundi` löschen (nur `ora-mundi` wird verwendet)
- [ ] Supabase Site URL auf `https://ora-mundi.vercel.app` setzen
- [ ] `NEXT_PUBLIC_SITE_URL` als Env-Var in Vercel hinzufügen (`https://ora-mundi.vercel.app`)

---

## Google OAuth einrichten

### 1. Supabase Dashboard

- **Authentication -> Providers -> Google** aktivieren
- Die angezeigte **Callback URL** kopieren (Format: `https://gbczpovjxftfixzzelfy.supabase.co/auth/v1/callback`)

### 2. Google Cloud Console

- Unter **APIs & Services -> Credentials** ein neues **OAuth 2.0 Client ID** erstellen (Typ: Web Application)
- **Authorized redirect URI**: die Callback URL von Supabase eintragen
- **Client ID** und **Client Secret** kopieren

### 3. Supabase Dashboard

- Zurück zu **Authentication -> Providers -> Google**
- Client ID und Client Secret eintragen und speichern

### 4. Supabase URL Configuration

- **Authentication -> URL Configuration**
- **Site URL**: `https://ora-mundi.vercel.app`
- **Redirect URLs**: `https://ora-mundi.vercel.app/**` hinzufuegen

---

## Zugangsdaten & Dienste

| Dienst | Details |
|--------|---------|
| **Supabase** | Projekt `gbczpovjxftfixzzelfy`, URL: `https://gbczpovjxftfixzzelfy.supabase.co` |
| **MapTiler** | Kostenloser Tier, Token in `.env.local` / Vercel Env-Vars |
| **Vercel** | Projekt `ora-mundi`, Domain: `ora-mundi.vercel.app` |
| **GitHub** | `github.com/jeremiaswilcke/oramundi`, Branch: `main` |

## Env-Variablen (Vercel & .env.local)

| Variable | Beschreibung |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key (oeffentlich, RLS-geschuetzt) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | MapTiler API Key (Variablenname beibehalten fuer Kompatibilitaet) |

## Hinweise

- **Netzlaufwerk**: Das Repo liegt auf `Y:\Ora Mundi\ora-mundi` (NAS/SMB Share). Git Safe-Directory wurde global konfiguriert.
- **Serwist/PWA**: Warnung beim Build zu Turbopack-Inkompatibilitaet ist harmlos - der Service Worker wird nur im Production-Build generiert.
- **Next.js 16 Middleware**: Deprecation-Warnung ("use proxy instead") - funktioniert weiterhin, sollte aber mittelfristig migriert werden.
- **MapTiler**: Env-Variable heisst weiterhin `NEXT_PUBLIC_MAPBOX_TOKEN`, um unnoetige Aenderungen in `env.ts` zu vermeiden.
