# Ora Mundi — Modul "Heilung & Befreiung"

> Geistliche Begleitung in inneren Kämpfen. Christusbeziehung statt Selbstoptimierung.

## Vision

Ein neues Modul für Menschen, die mit Ablenkung, Süchten (insbesondere Pornografie), digitaler Reizüberflutung oder geistlicher Trockenheit ringen. Statt isolierter Tipps oder Tracker-Logik führt das Modul in eine **lebendige, persönliche Beziehung zu Christus** — durch Rosenkranz, Herzensgebet und mehrtägige strukturierte Programme, ergänzt um anonyme gemeinschaftliche Gebetshilfe im Augenblick der Versuchung.

## Theologische Leitplanken

- **Keine Streaks. Keine Punkte. Keine Gamification.** Selbstoptimierung ist nicht Heiligung.
- Bei Rückfall: Kein "Failed"-Status, sondern **"Gnade neu empfangen"** → Beichtvorbereitung.
- Sprache: *Gnade, Umkehr, Heilung, Christusbeziehung* — nicht *Erfolg, Disziplin, Performance*.
- Anonymität schützt. **Beziehung entsteht durchs Gebet, nicht durchs Profil.**
- Inhaltliche Texte werden mit Priestern erarbeitet, nicht KI-generiert.

---

## 1. Strukturierte Programme

Mehrtägige Wege, jeweils mit Tagesschritt:

1. **Schriftwort** (kurz, kontemplativ)
2. **Gebet** — Rosenkranz (passendes Geheimnis) **oder** Herzensgebet (geführt mit Atemrhythmus, Zähler)
3. **Reflexionsfrage** — optional Journaleintrag
4. **Tagesintention** — wandert in bestehende `intentions`

### Erste Programme (mit Priestern auszuarbeiten)

- **40 Tage Heilung — Befreiung von Pornografie**
  Schmerzhafter Rosenkranz + Herzensgebet, wöchentliche Beichtimpulse
- **30 Tage Herzensgebet einüben**
  Pilgerweg-Stil, Philokalie-nah, Atemrhythmus
- *(weitere mit befreundeten Priestern)*

### Sharing (optional)

- Default: privat
- Toggle "mit Begleiter teilen" → wählt aus bestehenden `friendships` (Priester, Beichtvater, Freund)
- Geteilt wird: Fortschritt + freiwillig Journal
- Begleiter kann Gebet zusagen → triggert bestehenden Realtime/Push

---

## 2. SOS-Gebetspartner (Hook-Feature)

**Im Augenblick der Versuchung:** Floating Action Button im AppShell oder PWA-Shortcut.

### Flow

1. User drückt SOS → Auswahl: *"Allein beten"* / *"Mit jemandem beten"*
2. Bei "Mit jemandem" → Backend matcht **zufällig** einen anderen User aus opt-in Pool
3. Beide sehen nur: **Username** (oder pseudonym "Bruder im Gebet #7281") + *"betet jetzt mit dir das Herzensgebet"*
4. Synchroner geführter Gebetsablauf via Realtime (z. B. 10 Min. Herzensgebet, gemeinsamer Rhythmus)
5. Am Ende: *"Danke. Vergelt's Gott."*
6. Optional: *"Diese Person in mein stilles Gedenken aufnehmen"* → erscheint anonym in eigener Gebetsliste

### Privacy by Design

- **Technisch keine Chats, PMs oder Textnachrichten möglich** — nicht "deaktiviert", sondern **nicht gebaut**
- Kein Klick auf Username, kein Profillink, kein Follow-Button
- Jede Begegnung **einmalig** (Anti-Stalking, kein "wieder zusammen beten")
- Matching-Algorithmus prio: noch nie gematcht > länger nicht gematcht
- Rate-Limiting: Max. X SOS-Sessions pro Tag (Schutz vor Spielwiese)
- Report-Button für künftige Lücken

### Optionale Statistik (anonym)

> *"In dieser Stunde beten 47 Menschen weltweit das Herzensgebet mit."*

Nutzt bestehende `global_stats`-Logik (Migration `00002`).

---

## 3. Datenmodell (Migrationsentwurf)

Neue Migration: `00011_healing_programs.sql`

```sql
-- Programm-Definitionen
healing_programs (
  id, slug, title_de, title_en, theme,
  duration_days, intro_de, intro_en, created_at
)

-- Tag X eines Programms
healing_program_days (
  id, program_id, day_number,
  scripture_de, scripture_en,
  prayer_refs jsonb,  -- Verweise auf prayer-library / rosary
  reflection_de, reflection_en,
  intention_de, intention_en
)

-- User-Fortschritt
user_healing_progress (
  user_id, program_id, started_at,
  current_day, last_completed_at, status,
  is_shared boolean, shared_with_user_ids uuid[]
)

-- Freie Reflexionseinträge
user_healing_journal (
  id, user_id, program_id, day_number,
  text, is_shared, created_at
)
```

Neue Migration: `00012_sos_prayer.sql`

```sql
-- Opt-in Pool für SOS-Mitbeter
sos_prayer_pool (
  user_id PRIMARY KEY,
  available_until timestamptz,
  pseudonym text,  -- optional anonymes Pseudonym
  last_matched_at timestamptz
)

-- Gemeinsame Sessions (RLS so streng, dass nie der andere abgefragt werden kann)
sos_sessions (
  id, requester_id, partner_id,
  started_at, ended_at, prayer_type,
  -- KEINE Felder für Nachrichten, KEINE foreign Joins erlaubt
)

-- Verhindert Wiederholungs-Matches
sos_match_history (
  user_a, user_b, matched_at
)
```

**RLS:** Strikt. User darf nur eigene Sessions sehen, nie die Daten des Partners abfragen außer Username/Pseudonym im Moment der Session.

---

## 4. Edge Functions

- `match-prayer-partner` — Picks zufälligen Partner aus Pool
- Erweiterung von `send-reminders` für Programm-Tagesreminder

---

## 5. Routing-Skelett

```
src/app/(app)/
├── healing/
│   ├── page.tsx              # Übersicht: laufende Programme + Programmkatalog
│   ├── [slug]/
│   │   ├── page.tsx          # Programm-Intro & Start
│   │   └── [day]/page.tsx    # Tages-Flow
│   └── sos/
│       ├── page.tsx          # SOS-Auswahl
│       └── session/[id]/page.tsx  # Synchrone Session
```

SOS-Button in `app-shell.tsx` als Floating Action Button.

---

## 6. Offene Punkte (für Diskussion mit Priestern)

- [ ] Inhalte für "40 Tage Heilung — Befreiung von Pornografie"
- [ ] Inhalte für "30 Tage Herzensgebet"
- [ ] Liste weiterer Programme (Trauer, Vergebung, geistliche Trockenheit, Sakramentenvorbereitung?)
- [ ] Genauer Wortlaut Beichtvorbereitung / "Gnade neu empfangen"
- [ ] Pseudonym-Vergabe (echter Username vs. anonyme Bruder/Schwester-IDs) — was schützt besser?
- [ ] Maximale SOS-Frequenz pro Tag/Woche
- [ ] Imprimatur / theologische Begleitung der Texte

---

## 7. Nicht-Ziele (explizit)

- ❌ Keine Direktnachrichten zwischen Usern
- ❌ Keine Profilseiten anderer User
- ❌ Keine Streak/Punkte/Badge-Mechanik
- ❌ Keine "Erfolgs"-Statistiken pro User
- ❌ Keine Pop-Psychologie-Texte ohne theologische Verankerung
