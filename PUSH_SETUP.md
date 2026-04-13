# Push-Benachrichtigungen einrichten (Phase 2)

Damit echte Gebetserinnerungen auch bei geschlossener App funktionieren, muss die Supabase Edge Function deployed werden und ein Cron-Job eingerichtet werden.

## 1. VAPID Keys

> **WICHTIG:** Der ursprünglich in dieser Datei committete Private Key (`z5v4voD9…`) gilt als **kompromittiert** und muss rotiert werden. Neuen Keypair mit `npx web-push generate-vapid-keys` erzeugen und überall ersetzen (Vercel Env, Supabase Secrets, Service Worker Build).

```
VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY
```

Der Private Key darf **niemals** ins Repo oder in Doku. Nur Secret Manager (Vercel, Supabase) / lokales `.env.local`.

## 2. Supabase CLI installieren (falls noch nicht)

```bash
npm install -g supabase
supabase login
supabase link --project-ref gbczpovjxftfixzzelfy
```

## 3. Edge Function Secrets setzen

```bash
supabase secrets set VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY
supabase secrets set VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY
supabase secrets set VAPID_SUBJECT=mailto:info@oramundi.online
```

## 4. Edge Function deployen

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

Der `--no-verify-jwt` Flag ist wichtig, weil pg_cron die Funktion aufruft.

## 5. pg_cron in Supabase aktivieren

Im **Supabase Dashboard** → **Database** → **Extensions**:
- Aktiviere `pg_cron`
- Aktiviere `pg_net`

## 6. Service Role Key als DB-Setting speichern

Im **SQL Editor** ausführen (Service Role Key findest du unter Settings > API):

```sql
ALTER DATABASE postgres SET app.service_role_key = 'DEIN_SERVICE_ROLE_KEY_HIER';
```

## 7. Cron-Job einrichten

Im **SQL Editor** (aus `supabase/migrations/00006_reminder_cron.sql`):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'send-reminders-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gbczpovjxftfixzzelfy.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

## 8. Cron-Jobs prüfen

```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## 9. Manueller Test

Edge Function direkt aufrufen:

```bash
curl -X POST https://gbczpovjxftfixzzelfy.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer DEIN_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Antwort: `{ "sent": N, "skipped": N, "failed": N, "total": N }`

## Cron-Job wieder entfernen (falls nötig)

```sql
SELECT cron.unschedule('send-reminders-every-15-min');
```

## Wie es funktioniert

1. User aktiviert Erinnerung, gewährt Browser-Benachrichtigung
2. Browser abonniert Push via `pushManager.subscribe()` mit VAPID public key
3. Subscription wird in `profiles.push_subscription` gespeichert
4. Alle 15 Minuten prüft der Cron-Job (via Edge Function):
   - Ist heute ein Erinnerungstag?
   - Liegt die aktuelle Zeit innerhalb der letzten 15 Min nach Reminder-Time?
   - Hat der User heute schon gebetet?
5. Falls nicht → Push wird mit `web-push` Library gesendet
6. Service Worker (`sw.ts`) empfängt Push und zeigt Notification
7. Klick auf Notification öffnet die App

## Einschränkungen

- **Zeitzone**: Aktuell nutzt die Edge Function UTC. Für lokalisierte Zeiten müssten wir die Zeitzone des Users speichern (Spalte `timezone`) und dort berücksichtigen.
- **iOS Safari**: Web Push funktioniert erst ab iOS 16.4, und nur wenn die App zum Homescreen hinzugefügt ist (PWA-Modus).
- **Cron-Genauigkeit**: 15-Minuten-Fenster bedeutet dass eine Erinnerung bis zu 15 Min verspätet ankommen kann.
