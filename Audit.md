# Security Audit: Ora Mundi

Stand: 13. April 2026
Scope: Review des Projekts `/Volumes/personal_folder/Ora Mundi/ora-mundi` mit Fokus auf Supabase RLS, API-Routen, Rendering von Drittinhalten, Secrets und Privacy-relevante Datenfluesse.

## Executive Summary

Im aktuellen Stand gibt es mehrere sicherheitsrelevante Schwachstellen mit hoher Prioritaet. Die kritischsten Probleme liegen in der Datenzugriffskontrolle auf Supabase-Ebene und in einem API-Design, das sich auf die Geheimhaltung von UUIDs verlaesst statt auf echte Autorisierung.

Die wichtigsten Risiken:

- Private Nutzerdaten in `profiles` sind ueber eine globale SELECT-Policy auslesbar.
- Der ICS-Kalender-Export kann mit einer bekannten User-ID ohne echte Autorisierung abgefragt werden.
- HTML von einer Drittquelle wird unzureichend sanitisiert und dann direkt ins DOM injiziert.
- Ein privater VAPID-Key ist im Repository dokumentiert.
- Live-/kuerzlich aktive Gebetssessions leaken Aktivitaets- und Standortmetadaten.

## Findings

### 1. P1: Oeffentliche `profiles`-RLS exponiert Reminder- und Push-Daten

Betroffene Stellen:

- `supabase/migrations/00001_initial_schema.sql`
- `supabase/migrations/00005_reminder_preferences.sql`

Problem:

Die Tabelle `profiles` ist aktuell per RLS global lesbar:

- Policy: `USING (true)`

Spaetere Migrationen fuegen dieser Tabelle jedoch private Felder hinzu:

- `reminder_enabled`
- `reminder_frequency`
- `reminder_days`
- `reminder_time`
- `push_subscription`

Dadurch kann jeder Client mit dem Supabase-Anon-Key diese Daten potenziell auslesen, sofern User-IDs oder Listenabfragen verfuegbar sind.

Impact:

- Offenlegung sensibler Verhaltensdaten
- Offenlegung von Reminder-Zeitfenstern
- Offenlegung von Web-Push-Endpoints und Subscription-Metadaten
- Erleichterung weiterer Korrelationen mit anderen offenen Datenquellen im System

Empfehlung:

- Private Settings aus `profiles` in eine separate Tabelle verschieben, z. B. `user_private_settings`
- Dort strikte RLS setzen: nur `auth.uid() = user_id`
- Fuer oeffentlich lesbare Profildaten eine separate View oder Public-Profile-Tabelle verwenden
- Keine blanket-SELECT-Policy auf gemischten Public/Private-Daten beibehalten

Vorschlag fuer Claude:

- Trenne `profiles` in `public_profiles` und `user_private_settings` oder fuehre mindestens eine sichere View ein.
- Passe alle Client-Queries an, sodass Reminder- und Push-Daten nur noch owner-only lesbar sind.

### 2. P1: Kalender-Export basiert auf UUID-Geheimhaltung statt Autorisierung

Betroffene Stelle:

- `src/app/api/calendar/[userId]/route.ts`

Problem:

Die Route kommentiert explizit, dass die URL selbst das Geheimnis sei. Anschliessend werden Reminder-Daten ueber den Supabase-Anon-Key anhand der `userId` geladen.

Das ist kein belastbares Sicherheitsmodell:

- User-UUIDs sind in Supabase-Anwendungen oft an mehreren Stellen sichtbar oder ableitbar
- Eine bekannte UUID reicht dann aus, um den ICS-Feed einer anderen Person abzurufen

Impact:

- Unautorisierter Zugriff auf persoenliche Gebets-/Reminder-Zeitplaene
- Privacy-Verletzung
- Kombination mit Finding 1 macht das Risiko hoeher

Empfehlung:

- Authentifizierten Zugriff erzwingen und serverseitig pruefen: `auth.uid() === userId`
- Alternativ einen separaten, zufaelligen, revocable Calendar-Token einfuehren
- Keine sensitiven Feeds an reine Identifier binden

Vorschlag fuer Claude:

- Stelle die Route auf echten Session-basierten Zugriff um
- Oder implementiere eine eigene Tabelle `calendar_tokens` mit rotierbaren Tokens, Ablaufdatum und Revocation

### 3. P1: Drittanbieter-HTML wird mit unzureichender Sanitization gerendert

Betroffene Stellen:

- `src/app/api/officium/[date]/[hour]/route.ts`
- `src/app/(app)/officium/today/page.tsx`

Problem:

Die Anwendung laedt HTML von `divinumofficium.com`, entfernt einige Muster per Regex und gibt den Rest als `bodyHtml` an die UI weiter. Dort wird der Inhalt per `dangerouslySetInnerHTML` gerendert.

Regex-basierte Bereinigung ist kein robuster XSS-Schutz. Die aktuelle Logik entfernt zwar einige offensichtliche Muster, ist aber nicht ausreichend gegen:

- Event-Handler in anderen Schreibweisen
- `javascript:`-URLs
- ungewoehnliche Attribute
- SVG-/MathML-basierte Payloads
- bewusst manipuliertes oder kompromittiertes Upstream-Markup

Impact:

- Potenzielles XSS auf der eigenen Origin
- Session-Diebstahl, UI-Manipulation oder Content-Injection
- Supply-Chain-aehnliches Risiko ueber externen HTML-Provider

Empfehlung:

- Kein unsanitisiertes Fremd-HTML direkt rendern
- Echte HTML-Sanitization mit allowlist-basiertem Sanitizer einsetzen
- Noch besser: Upstream in ein eigenes strukturiertes Format transformieren und nur explizit erlaubte Elemente rendern

Vorschlag fuer Claude:

- Ersetze die Regex-Bereinigung durch eine harte Allowlist-Transformation
- Wenn moeglich: Parse in serverseitige strukturierte Daten statt HTML durchzureichen

### 4. P1: Privater VAPID-Key ist im Repository enthalten

Betroffene Stelle:

- `PUSH_SETUP.md`

Problem:

In der Doku steht ein privater VAPID-Key im Klartext.

Impact:

- Jeder mit Repo-Zugriff kann Push-Nachrichten im Namen des Projekts signieren
- Missbrauch fuer Spam oder Impersonation
- Vertrauensverlust in den Notification-Channel

Empfehlung:

- VAPID-Keypair sofort rotieren
- Privaten Key aus der Doku entfernen
- Wenn moeglich: Secret aus der Git-History entfernen oder zumindest als kompromittiert behandeln
- In der Doku nur Public Key oder Platzhalter belassen

Vorschlag fuer Claude:

- Entferne den Private Key aus `PUSH_SETUP.md`
- Ersetze ihn durch `YOUR_VAPID_PRIVATE_KEY`
- Weisen explizit auf Rotation und Secret-Management hin

### 5. P2: Aktive Gebetssessions leaken Aktivitaets- und Standortmetadaten

Betroffene Stellen:

- `supabase/migrations/00001_initial_schema.sql`
- `src/app/(app)/page.tsx`
- `src/lib/realtime.ts`

Problem:

`prayer_sessions` sind fuer aktive oder kuerzlich aktive Sessions global lesbar. Diese Rows enthalten:

- `user_id`
- `started_at`
- `latitude`
- `longitude`
- `mode`
- `mystery_type`

Auch wenn Koordinaten im Client grob gerundet werden, bleiben das sensible, zeitnahe Verhaltens- und Standortdaten.

Impact:

- Privacy-Risiko fuer Nutzer
- Re-Identifikation ueber Kombination mit anderen Datenpunkten
- Harvesting von User-IDs fuer weitere Angriffe

Empfehlung:

- Rohdaten nicht oeffentlich ueber `prayer_sessions` exponieren
- Fuer die Kartenfunktion nur aggregierte oder entkoppelte Daten bereitstellen
- Wenn Live-Presence benoetigt wird, dann ohne stabile User-IDs und mit strikterer Entkopplung

Vorschlag fuer Claude:

- Fuehre eine dedizierte Public-Map-Quelle ein, z. B. gehashte/ephemere Presence oder rein aggregierte Heatmap-Daten
- Entferne direkte globale SELECT-Freigabe auf `prayer_sessions`

## Priorisierte Remediation-Reihenfolge

1. `profiles` absichern und private Felder abtrennen
2. Kalender-Endpoint auf echte Autorisierung oder revocable Token umstellen
3. VAPID-Key sofort rotieren und aus Doku/History entfernen
4. Officium-Rendering absichern und HTML-Sanitization grundlegend neu bauen
5. Public Map / Presence so umbauen, dass keine Roh-Sessiondaten mehr offenliegen

## Architektur-Hinweis fuer Claude

Die zentrale Schwaeche ist nicht nur ein einzelner Bug, sondern ein Muster:

- Privacy-relevante Daten liegen in Tabellen mit zu breiten Read-Policies
- oeffentliche Features greifen auf Rohdaten statt auf minimal notwendige Derived Data zu
- einige Flows verlassen sich auf "unguessable IDs" statt auf belastbare AuthZ

Ein guter Fix-Ansatz waere deshalb:

1. Datenmodell in public/private sauber trennen
2. RLS auf least privilege umstellen
3. oeffentliche Features ueber Views, RPCs oder dedizierte public-safe Tabellen bedienen
4. HTML aus Drittquellen nie direkt ins DOM durchreichen

## Konkreter Arbeitsauftrag an Claude

Wenn du dieses Projekt absichern sollst, arbeite bitte in dieser Reihenfolge:

1. Analysiere alle `profiles`-Reads und entkopple private Felder von oeffentlichen Profilfeldern.
2. Haerte den Kalender-Export gegen IDOR, bevorzugt mit Auth-Pruefung oder revocable Token.
3. Entferne die aktuelle Regex-Sanitization fuer Officium und ersetze sie durch einen sicheren Rendering-Ansatz.
4. Entferne eingecheckte Secrets aus Doku und Code, ersetze sie durch Platzhalter und dokumentiere Rotation.
5. Reduziere die oeffentliche Sichtbarkeit von `prayer_sessions` auf privacy-sichere, aggregierte Daten.

## Abschluss

Das Projekt ist funktional schon weit, aber aus Security-Sicht noch nicht an dem Punkt, an dem Privacy-sensitive Produktfeatures sicher exponiert werden sollten. Die dringensten Themen sind gut behebbar, wenn Datenmodell, RLS und API-Design jetzt konsequent gestrafft werden.
