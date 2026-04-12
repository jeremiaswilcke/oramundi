# Ora Mundi -- Soziale Funktionen: Planungsdokument

> Erstellt: 2026-04-12
> Status: Entwurf
> Bezug: Bestehendes Schema in `supabase/migrations/00001_initial_schema.sql`

---

## Uebersicht

Dieses Dokument beschreibt die Planung und Umsetzung sozialer Funktionen fuer die Ora Mundi App. Ziel ist es, Nutzer miteinander zu verbinden und gemeinsames Beten zu foerdern. Die Funktionen bauen auf dem bestehenden Schema auf (Tabellen `profiles`, `prayer_sessions`, `intentions`, etc.) und nutzen Supabase RLS-Policies fuer Zugriffskontrolle.

---

## 1. Freundschaftssystem

### 1.1 Datenbankschema

```sql
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Duplikat-Vermeidung: requester_id muss immer kleiner sein als addressee_id.
  -- Die Anwendungslogik stellt sicher, dass die IDs vor dem INSERT sortiert werden.
  CONSTRAINT friendships_ordered_ids CHECK (requester_id < addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT friendships_no_self CHECK (requester_id != addressee_id)
);
```

### 1.2 Duplikat-Vermeidung

Der `CHECK (requester_id < addressee_id)` Constraint garantiert, dass jedes Freundschaftspaar nur einmal in der Tabelle existiert. Die Anwendungslogik (Supabase Edge Function oder Client-Code) muss die beiden UUIDs vor dem INSERT lexikographisch sortieren:

```typescript
// Hilfsfunktion fuer die Client-Seite
function createFriendshipPayload(userId: string, friendId: string) {
  const [requesterId, addresseeId] = [userId, friendId].sort();
  return {
    requester_id: requesterId,
    addressee_id: addresseeId,
    // initiated_by speichert, wer tatsaechlich die Anfrage gestellt hat
  };
}
```

**Hinweis:** Da `requester_id` durch die Sortierung nicht immer der tatsaechliche Anfragende ist, wird empfohlen, ein zusaetzliches Feld `initiated_by UUID REFERENCES profiles(id)` hinzuzufuegen, um den echten Absender zu speichern. Alternativ kann die Info in einer separaten Spalte `initiator_id` gehalten werden:

```sql
ALTER TABLE friendships ADD COLUMN initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
```

### 1.3 RLS-Policies

```sql
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Nutzer sehen nur eigene Freundschaften
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Nutzer koennen Freundschaftsanfragen erstellen (sie muessen Teil des Paares sein)
CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = initiated_by);

-- Nur der Adressat (initiated_by != auth.uid()) kann annehmen/ablehnen;
-- Jeder Beteiligte kann blockieren
CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Beide Seiten koennen die Freundschaft loeschen
CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
```

### 1.4 Einladungsfluss

**Option A: Einladungslink**
- Nutzer generiert einen einmaligen Einladungslink (z.B. `oramundi.app/invite/abc123`)
- Link wird per Messenger, E-Mail oder QR-Code geteilt
- Empfaenger oeffnet den Link, wird zur App weitergeleitet
- Falls eingeloggt: Freundschaftsanfrage wird automatisch erstellt
- Falls nicht eingeloggt: Weiterleitung zu Registrierung, danach automatische Anfrage
- Technisch: Einladungscodes in einer separaten `friend_invites` Tabelle mit Ablaufdatum speichern

```sql
CREATE TABLE friend_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  used_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Option B: Suche nach Anzeigename**
- Suchfeld in der App: Nutzer gibt den `display_name` ein
- Supabase-Query mit `ilike` auf `profiles.display_name`
- Ergebnisliste mit "Freundschaftsanfrage senden"-Button
- Datenschutz: Nur Nutzer anzeigen, die nicht blockiert sind

### 1.5 UI-Komponenten

| Komponente | Pfad | Beschreibung |
|---|---|---|
| `FriendList` | `src/components/social/FriendList.tsx` | Liste aller akzeptierten Freunde mit Online-Status |
| `FriendRequestBadge` | `src/components/social/FriendRequestBadge.tsx` | Badge-Zaehler fuer offene Anfragen (in Settings-Navigation) |
| `FriendRequestList` | `src/components/social/FriendRequestList.tsx` | Liste offener Anfragen mit Annehmen/Ablehnen-Buttons |
| `AddFriendModal` | `src/components/social/AddFriendModal.tsx` | Modal mit Suchfeld und Einladungslink-Generator |
| `FriendCard` | `src/components/social/FriendCard.tsx` | Einzelne Freundeskarte mit Avatar, Name, letzter Aktivitaet |

**Seitenstruktur:**
- `/settings/friends` -- Hauptseite fuer Freundschaftsverwaltung
- Badge auf dem Settings-Tab zeigt Anzahl offener Anfragen

---

## 2. Gebetsgruppen

### 2.1 Datenbankschema

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  max_members INT NOT NULL DEFAULT 50 CHECK (max_members BETWEEN 2 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE group_role AS ENUM ('admin', 'member');

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);
```

### 2.2 RLS-Policies

```sql
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Oeffentliche Gruppen sind fuer alle sichtbar; private nur fuer Mitglieder
CREATE POLICY "Public groups are visible to all"
  ON groups FOR SELECT
  USING (
    is_public = TRUE
    OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Eingeloggte Nutzer koennen Gruppen erstellen
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Nur Admins koennen Gruppen-Details aendern
CREATE POLICY "Admins can update their groups"
  ON groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Nur der Ersteller kann die Gruppe loeschen
CREATE POLICY "Creator can delete group"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- === group_members Policies ===
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Mitglieder sehen andere Mitglieder ihrer Gruppen
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Nutzer koennen sich selbst zu Gruppen hinzufuegen (beitreten)
CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nutzer koennen sich selbst entfernen; Admins koennen Mitglieder entfernen
CREATE POLICY "Users can leave or admins can remove"
  ON group_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### 2.3 Automatischer Admin beim Erstellen

Wenn ein Nutzer eine Gruppe erstellt, soll er automatisch als Admin-Mitglied hinzugefuegt werden:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_group();
```

### 2.4 Beitrittsmechanismen

**Via Einladungscode:**
```typescript
// Beitritt ueber Einladungscode
async function joinGroupByCode(inviteCode: string) {
  // 1. Gruppe anhand des Codes suchen
  const { data: group } = await supabase
    .from('groups')
    .select('id, max_members')
    .eq('invite_code', inviteCode)
    .single();

  // 2. Mitgliederzahl pruefen
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id);

  if (count >= group.max_members) throw new Error('Gruppe ist voll');

  // 3. Beitreten
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: currentUserId,
  });
}
```

**Via oeffentliche Gruppenliste:**
- Seite `/groups/discover` zeigt oeffentliche Gruppen
- Sortiert nach Mitgliederzahl oder Aktivitaet
- Beitritts-Button direkt in der Karte

### 2.5 Admin-Verwaltung

- Admins koennen Mitglieder entfernen
- Admins koennen andere Mitglieder zu Admins befoerdern
- Admins koennen Gruppenname, Beschreibung und Avatar aendern
- Admins koennen den Einladungscode erneuern (invalidiert den alten)
- Admins koennen die Gruppe zwischen oeffentlich/privat umschalten
- Letzer Admin kann die Gruppe nicht verlassen (muss zuerst einen anderen Admin ernennen oder die Gruppe loeschen)

### 2.6 UI-Komponenten

| Komponente | Pfad | Beschreibung |
|---|---|---|
| `GroupList` | `src/components/social/GroupList.tsx` | Liste eigener Gruppen |
| `GroupCard` | `src/components/social/GroupCard.tsx` | Karte mit Gruppenname, Mitgliederzahl, Avatar |
| `GroupDetail` | `src/components/social/GroupDetail.tsx` | Detail-Ansicht mit Mitgliederliste und Dashboard |
| `CreateGroupModal` | `src/components/social/CreateGroupModal.tsx` | Formular fuer neue Gruppe |
| `JoinGroupModal` | `src/components/social/JoinGroupModal.tsx` | Einladungscode-Eingabe |
| `GroupSettings` | `src/components/social/GroupSettings.tsx` | Admin-Einstellungen |
| `DiscoverGroups` | `src/components/social/DiscoverGroups.tsx` | Oeffentliche Gruppen durchsuchen |

**Seitenstruktur:**
- `/groups` -- Uebersicht eigener Gruppen
- `/groups/discover` -- Oeffentliche Gruppen entdecken
- `/groups/[id]` -- Gruppendetail mit Dashboard
- `/groups/[id]/settings` -- Gruppeneinstellungen (nur Admins)

---

## 3. Gruppen-Dashboard

### 3.1 Aggregierte Statistiken

Die Statistiken werden aus der bestehenden `prayer_sessions` Tabelle berechnet, gefiltert auf Mitglieder der jeweiligen Gruppe.

**Benoetigte Datenbank-Funktion:**

```sql
CREATE OR REPLACE FUNCTION public.get_group_stats(p_group_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_rosaries', (
      SELECT COUNT(*)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.completed = TRUE
    ),
    'active_today', (
      SELECT COUNT(DISTINCT ps.user_id)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.started_at >= CURRENT_DATE
    ),
    'total_members', (
      SELECT COUNT(*) FROM group_members WHERE group_id = p_group_id
    ),
    'this_week_rosaries', (
      SELECT COUNT(*)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.completed = TRUE
        AND ps.started_at >= date_trunc('week', CURRENT_DATE)
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Gruppen-Streak

Der Gruppen-Streak zaehlt aufeinanderfolgende Tage, an denen mindestens ein Mitglied gebetet hat:

```sql
CREATE OR REPLACE FUNCTION public.get_group_streak(p_group_id UUID)
RETURNS INT AS $$
DECLARE
  streak INT := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.completed = TRUE
        AND ps.started_at::date = check_date
    ) INTO has_activity;

    EXIT WHEN NOT has_activity;

    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 Mitglieder-Aktivitaetsfeed

Der Feed zeigt Aktivitaeten der Gruppenmitglieder, respektiert aber die Privatsphaere:

- **Angezeigt:** "Maria hat heute 2 Rosenkraenze gebetet" (aggregiert, keine Details)
- **Nicht angezeigt:** Welches Geheimnis, genaue Uhrzeiten, Standort
- **Optional:** Nutzer koennen in ihren Einstellungen die Aktivitaetsanzeige deaktivieren

```sql
-- View fuer datenschutzfreundliche Aktivitaetsanzeige
CREATE OR REPLACE VIEW group_member_activity AS
SELECT
  gm.group_id,
  gm.user_id,
  p.display_name,
  COUNT(ps.id) FILTER (WHERE ps.started_at >= CURRENT_DATE) AS rosaries_today,
  COUNT(ps.id) FILTER (WHERE ps.started_at >= date_trunc('week', CURRENT_DATE)) AS rosaries_this_week,
  MAX(ps.started_at) AS last_active
FROM group_members gm
JOIN profiles p ON p.id = gm.user_id
LEFT JOIN prayer_sessions ps ON ps.user_id = gm.user_id AND ps.completed = TRUE
GROUP BY gm.group_id, gm.user_id, p.display_name;
```

### 3.4 Wochen-/Monatsvisualisierung

Daten fuer ein Balken- oder Heatmap-Diagramm:

```sql
CREATE OR REPLACE FUNCTION public.get_group_weekly_activity(
  p_group_id UUID,
  p_weeks INT DEFAULT 4
)
RETURNS TABLE(week_start DATE, rosary_count BIGINT, active_members BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('week', ps.started_at)::date AS week_start,
    COUNT(ps.id) AS rosary_count,
    COUNT(DISTINCT ps.user_id) AS active_members
  FROM prayer_sessions ps
  JOIN group_members gm ON gm.user_id = ps.user_id
  WHERE gm.group_id = p_group_id
    AND ps.completed = TRUE
    AND ps.started_at >= CURRENT_DATE - (p_weeks * 7 || ' days')::INTERVAL
  GROUP BY date_trunc('week', ps.started_at)
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.5 UI-Komponenten

| Komponente | Pfad | Beschreibung |
|---|---|---|
| `GroupDashboard` | `src/components/social/GroupDashboard.tsx` | Haupt-Dashboard mit allen Statistiken |
| `GroupStatsCard` | `src/components/social/GroupStatsCard.tsx` | Karte mit Gesamt-Rosenkraenzen, aktiven Mitgliedern, Streak |
| `MemberActivityList` | `src/components/social/MemberActivityList.tsx` | Feed mit Mitgliederaktivitaet |
| `WeeklyChart` | `src/components/social/WeeklyChart.tsx` | Balkendiagramm Wochenaktivitaet |
| `MemberStatusDot` | `src/components/social/MemberStatusDot.tsx` | Gruen/Grau-Punkt neben Mitgliedern (aktiv heute/inaktiv) |

---

## 4. Gebetsziele

### 4.1 Datenbankschema

```sql
CREATE TYPE goal_target_type AS ENUM ('rosaries', 'minutes', 'days_streak');

CREATE TABLE prayer_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,  -- NULL = persoenliches Ziel
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 150),
  description TEXT CHECK (char_length(description) <= 500),
  target_count INT NOT NULL CHECK (target_count > 0),
  target_type goal_target_type NOT NULL DEFAULT 'rosaries',
  current_count INT NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ,  -- NULL = kein Zeitlimit
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prayer_goals ENABLE ROW LEVEL SECURITY;

-- Persoenliche Ziele: nur der Ersteller; Gruppenziele: alle Mitglieder
CREATE POLICY "Users can view own or group goals"
  ON prayer_goals FOR SELECT
  USING (
    creator_id = auth.uid()
    OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create goals"
  ON prayer_goals FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND (
      group_id IS NULL  -- persoenliches Ziel
      OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Creators can update goals"
  ON prayer_goals FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete goals"
  ON prayer_goals FOR DELETE
  USING (creator_id = auth.uid());
```

### 4.2 Automatische Fortschrittsverfolgung

Ein Trigger auf `prayer_sessions` aktualisiert automatisch den Fortschritt aller relevanten Ziele, wenn ein Gebet abgeschlossen wird:

```sql
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur bei abgeschlossenen Gebeten
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN

    -- Persoenliche Rosenkranz-Ziele aktualisieren
    UPDATE prayer_goals
    SET
      current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE completed_at
      END
    WHERE target_type = 'rosaries'
      AND completed_at IS NULL
      AND creator_id = NEW.user_id
      AND group_id IS NULL
      AND (deadline IS NULL OR deadline > NOW());

    -- Gruppenziele aktualisieren (alle Gruppen des Nutzers)
    UPDATE prayer_goals
    SET
      current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE completed_at
      END
    WHERE target_type = 'rosaries'
      AND completed_at IS NULL
      AND group_id IN (SELECT group_id FROM group_members WHERE user_id = NEW.user_id)
      AND (deadline IS NULL OR deadline > NOW());

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prayer_session_completed
  AFTER UPDATE ON prayer_sessions
  FOR EACH ROW
  WHEN (NEW.completed = TRUE AND (OLD.completed IS DISTINCT FROM TRUE))
  EXECUTE FUNCTION public.update_goal_progress();
```

### 4.3 Streak-Ziele (Sonderbehandlung)

Fuer `days_streak`-Ziele ist ein taeglicher Cron-Job notwendig (via `pg_cron` oder Supabase Edge Function), der prueft, ob der Nutzer/die Gruppe heute gebetet hat und den Streak-Zaehler aktualisiert:

```sql
CREATE OR REPLACE FUNCTION public.update_streak_goals()
RETURNS void AS $$
BEGIN
  -- Persoenliche Streak-Ziele: Nutzer hat heute gebetet
  UPDATE prayer_goals pg
  SET current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE NULL
      END
  WHERE pg.target_type = 'days_streak'
    AND pg.completed_at IS NULL
    AND pg.group_id IS NULL
    AND EXISTS (
      SELECT 1 FROM prayer_sessions ps
      WHERE ps.user_id = pg.creator_id
        AND ps.completed = TRUE
        AND ps.started_at::date = CURRENT_DATE
    );

  -- Streak-Ziele zuruecksetzen wenn nicht gebetet (gestern pruefen)
  UPDATE prayer_goals pg
  SET current_count = 0
  WHERE pg.target_type = 'days_streak'
    AND pg.completed_at IS NULL
    AND pg.group_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM prayer_sessions ps
      WHERE ps.user_id = pg.creator_id
        AND ps.completed = TRUE
        AND ps.started_at::date = CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.4 Zieltypen und Beispiele

| Typ | Beispiel | Tracking |
|---|---|---|
| `rosaries` | "50 Rosenkraenze im Mai" | +1 pro abgeschlossener `prayer_session` |
| `minutes` | "100 Minuten Gebet" | Differenz `ended_at - started_at` in Minuten |
| `days_streak` | "30 Tage am Stueck beten" | Taeglicher Cron-Job prueft Aktivitaet |

### 4.5 UI-Komponenten

| Komponente | Pfad | Beschreibung |
|---|---|---|
| `GoalList` | `src/components/social/GoalList.tsx` | Liste aller Ziele (persoenlich + Gruppe) |
| `GoalCard` | `src/components/social/GoalCard.tsx` | Karte mit Titel, Fortschrittsbalken, Deadline |
| `GoalProgressBar` | `src/components/social/GoalProgressBar.tsx` | Animierter Fortschrittsbalken |
| `CreateGoalForm` | `src/components/social/CreateGoalForm.tsx` | Formular mit Typ-Auswahl, Zielwert, optionalem Deadline |
| `GoalCelebration` | `src/components/social/GoalCelebration.tsx` | Konfetti/Feier-Animation bei Zielerreichung |

**Seitenstruktur:**
- `/goals` -- Persoenliche Ziele
- `/groups/[id]/goals` -- Gruppenziele (im Gruppen-Dashboard integriert)

**Feier-Animation:**
- Bei Zielerreichung (`completed_at` wird gesetzt) wird eine Konfetti-Animation ausgeloest
- Nutzer erhaelt eine In-App-Benachrichtigung
- Optional: Benachrichtigung an Gruppenmitglieder bei Gruppen-Zielen

---

## 5. Erforderliche Indizes

```sql
-- === Friendships ===
-- Suche nach allen Freundschaften eines Nutzers (beide Richtungen)
CREATE INDEX idx_friendships_requester ON friendships (requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships (addressee_id, status);
-- Offene Anfragen schnell finden
CREATE INDEX idx_friendships_pending ON friendships (addressee_id)
  WHERE status = 'pending';

-- === Friend Invites ===
CREATE INDEX idx_friend_invites_code ON friend_invites (code)
  WHERE used_by IS NULL AND expires_at > NOW();

-- === Groups ===
-- Oeffentliche Gruppen fuer Discover-Seite
CREATE INDEX idx_groups_public ON groups (created_at DESC)
  WHERE is_public = TRUE;
-- Einladungscode-Lookup (bereits durch UNIQUE abgedeckt, aber explizit fuer Klarheit)
-- invite_code hat bereits einen UNIQUE-Index

-- === Group Members ===
-- Gruppen eines Nutzers finden
CREATE INDEX idx_group_members_user ON group_members (user_id);
-- Mitglieder einer Gruppe finden
CREATE INDEX idx_group_members_group ON group_members (group_id);
-- Kombination fuer RLS-Abfragen
CREATE INDEX idx_group_members_user_group ON group_members (user_id, group_id);

-- === Prayer Goals ===
-- Persoenliche Ziele eines Nutzers
CREATE INDEX idx_prayer_goals_creator ON prayer_goals (creator_id)
  WHERE completed_at IS NULL;
-- Gruppenziele
CREATE INDEX idx_prayer_goals_group ON prayer_goals (group_id)
  WHERE group_id IS NOT NULL AND completed_at IS NULL;

-- === Prayer Sessions (Ergaenzung zum bestehenden Index) ===
-- Fuer Gruppen-Dashboard: abgeschlossene Sessions pro Nutzer
CREATE INDEX idx_prayer_sessions_user_completed ON prayer_sessions (user_id, started_at DESC)
  WHERE completed = TRUE;
```

---

## 6. Implementierungsreihenfolge

### Phase 1: Grundlagen (Woche 1-2)
1. **Freundschaftssystem** -- Tabellen, RLS, grundlegende API
   - Migration: `friendships`, `friend_invites` Tabellen
   - API-Routen oder Supabase-Client-Funktionen
   - UI: Freundesliste, Anfragen senden/empfangen
   - *Keine Abhaengigkeiten*

### Phase 2: Gruppen (Woche 3-4)
2. **Gebetsgruppen** -- Tabellen, RLS, Erstellen/Beitreten
   - Migration: `groups`, `group_members` Tabellen + Trigger
   - API fuer Erstellen, Beitreten, Verlassen
   - UI: Gruppenliste, Erstellen-Modal, Beitreten via Code
   - *Keine Abhaengigkeit von Phase 1, kann parallel begonnen werden*

### Phase 3: Dashboards (Woche 5-6)
3. **Gruppen-Dashboards** -- Statistikfunktionen, Aktivitaetsfeed
   - Migration: DB-Funktionen (`get_group_stats`, `get_group_streak`, etc.)
   - UI: Dashboard-Karten, Wochendiagramm, Mitgliederliste
   - *Abhaengig von Phase 2 (Gruppen muessen existieren)*

### Phase 4: Ziele (Woche 7-8)
4. **Gebetsziele** -- Tabellen, Trigger, UI
   - Migration: `prayer_goals` Tabelle + Trigger
   - UI: Zielliste, Erstellen-Formular, Fortschrittsbalken
   - Feier-Animation
   - *Teilweise abhaengig von Phase 2 (fuer Gruppenziele)*

### Phase 5: Polish (Woche 9-10)
5. **Verfeinerung und Integration**
   - Oeffentliche Gruppen entdecken
   - Benachrichtigungen (Freundschaftsanfragen, Ziel erreicht)
   - Performance-Optimierung (Indizes pruefen, Caching)
   - Streak-Cron-Job einrichten
   - E2E-Tests

### Abhaengigkeitsgraph

```
Phase 1 (Freunde)     Phase 2 (Gruppen)
       |                     |
       |                     v
       |              Phase 3 (Dashboards)
       |                     |
       v                     v
       +-----> Phase 4 (Ziele) <----+
                     |
                     v
              Phase 5 (Polish)
```

---

## 7. SQL-Migrationsvorlage

Die folgende Migration kann als `supabase/migrations/00002_social_features.sql` gespeichert werden:

```sql
-- Ora Mundi — Social Features Migration

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE group_role AS ENUM ('admin', 'member');
CREATE TYPE goal_target_type AS ENUM ('rosaries', 'minutes', 'days_streak');

-- ============================================================
-- FRIENDSHIPS
-- ============================================================

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT friendships_ordered_ids CHECK (requester_id < addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT friendships_no_self CHECK (requester_id != addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE INDEX idx_friendships_requester ON friendships (requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships (addressee_id, status);
CREATE INDEX idx_friendships_pending ON friendships (addressee_id)
  WHERE status = 'pending';

-- ============================================================
-- FRIEND INVITES
-- ============================================================

CREATE TABLE friend_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  used_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE friend_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invites"
  ON friend_invites FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = used_by);

CREATE POLICY "Users can create invites"
  ON friend_invites FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE INDEX idx_friend_invites_code ON friend_invites (code)
  WHERE used_by IS NULL;

-- ============================================================
-- GROUPS
-- ============================================================

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  max_members INT NOT NULL DEFAULT 50 CHECK (max_members BETWEEN 2 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Groups RLS (must come after group_members table exists)
CREATE POLICY "Public groups or member groups are visible"
  ON groups FOR SELECT
  USING (
    is_public = TRUE
    OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups"
  ON groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Creator can delete group"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- Group members RLS
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave or admins can remove"
  ON group_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-add creator as admin
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_group();

CREATE INDEX idx_groups_public ON groups (created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_group_members_user ON group_members (user_id);
CREATE INDEX idx_group_members_group ON group_members (group_id);
CREATE INDEX idx_group_members_user_group ON group_members (user_id, group_id);

-- ============================================================
-- PRAYER GOALS
-- ============================================================

CREATE TABLE prayer_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 150),
  description TEXT CHECK (char_length(description) <= 500),
  target_count INT NOT NULL CHECK (target_count > 0),
  target_type goal_target_type NOT NULL DEFAULT 'rosaries',
  current_count INT NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prayer_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or group goals"
  ON prayer_goals FOR SELECT
  USING (
    creator_id = auth.uid()
    OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create goals"
  ON prayer_goals FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND (
      group_id IS NULL
      OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Creators can update goals"
  ON prayer_goals FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete goals"
  ON prayer_goals FOR DELETE
  USING (creator_id = auth.uid());

CREATE INDEX idx_prayer_goals_creator ON prayer_goals (creator_id) WHERE completed_at IS NULL;
CREATE INDEX idx_prayer_goals_group ON prayer_goals (group_id) WHERE group_id IS NOT NULL AND completed_at IS NULL;

-- ============================================================
-- TRIGGERS: Goal Progress Tracking
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN

    -- Personal rosary goals
    UPDATE prayer_goals
    SET
      current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE completed_at
      END
    WHERE target_type = 'rosaries'
      AND completed_at IS NULL
      AND creator_id = NEW.user_id
      AND group_id IS NULL
      AND (deadline IS NULL OR deadline > NOW());

    -- Group rosary goals
    UPDATE prayer_goals
    SET
      current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE completed_at
      END
    WHERE target_type = 'rosaries'
      AND completed_at IS NULL
      AND group_id IN (SELECT group_id FROM group_members WHERE user_id = NEW.user_id)
      AND (deadline IS NULL OR deadline > NOW());

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prayer_session_completed
  AFTER UPDATE ON prayer_sessions
  FOR EACH ROW
  WHEN (NEW.completed = TRUE AND (OLD.completed IS DISTINCT FROM TRUE))
  EXECUTE FUNCTION public.update_goal_progress();

-- ============================================================
-- FUNCTIONS: Group Dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_group_stats(p_group_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify caller is a member
  IF NOT EXISTS (
    SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  SELECT json_build_object(
    'total_rosaries', (
      SELECT COUNT(*)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id AND ps.completed = TRUE
    ),
    'active_today', (
      SELECT COUNT(DISTINCT ps.user_id)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id AND ps.started_at >= CURRENT_DATE
    ),
    'total_members', (
      SELECT COUNT(*) FROM group_members WHERE group_id = p_group_id
    ),
    'this_week_rosaries', (
      SELECT COUNT(*)
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.completed = TRUE
        AND ps.started_at >= date_trunc('week', CURRENT_DATE)
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_group_streak(p_group_id UUID)
RETURNS INT AS $$
DECLARE
  streak INT := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  LOOP
    SELECT EXISTS(
      SELECT 1
      FROM prayer_sessions ps
      JOIN group_members gm ON gm.user_id = ps.user_id
      WHERE gm.group_id = p_group_id
        AND ps.completed = TRUE
        AND ps.started_at::date = check_date
    ) INTO has_activity;

    EXIT WHEN NOT has_activity;
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_group_weekly_activity(
  p_group_id UUID,
  p_weeks INT DEFAULT 4
)
RETURNS TABLE(week_start DATE, rosary_count BIGINT, active_members BIGINT) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this group';
  END IF;

  RETURN QUERY
  SELECT
    date_trunc('week', ps.started_at)::date AS week_start,
    COUNT(ps.id) AS rosary_count,
    COUNT(DISTINCT ps.user_id) AS active_members
  FROM prayer_sessions ps
  JOIN group_members gm ON gm.user_id = ps.user_id
  WHERE gm.group_id = p_group_id
    AND ps.completed = TRUE
    AND ps.started_at >= CURRENT_DATE - (p_weeks * 7 || ' days')::INTERVAL
  GROUP BY date_trunc('week', ps.started_at)
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTIONS: Streak Goals (call daily via pg_cron or Edge Function)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_streak_goals()
RETURNS void AS $$
BEGIN
  -- Increment streak for users who prayed today
  UPDATE prayer_goals pg
  SET current_count = current_count + 1,
      completed_at = CASE
        WHEN current_count + 1 >= target_count THEN NOW()
        ELSE NULL
      END
  WHERE pg.target_type = 'days_streak'
    AND pg.completed_at IS NULL
    AND pg.group_id IS NULL
    AND EXISTS (
      SELECT 1 FROM prayer_sessions ps
      WHERE ps.user_id = pg.creator_id
        AND ps.completed = TRUE
        AND ps.started_at::date = CURRENT_DATE
    );

  -- Reset streak for users who did NOT pray yesterday
  UPDATE prayer_goals pg
  SET current_count = 0
  WHERE pg.target_type = 'days_streak'
    AND pg.completed_at IS NULL
    AND pg.group_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM prayer_sessions ps
      WHERE ps.user_id = pg.creator_id
        AND ps.completed = TRUE
        AND ps.started_at::date = CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SUPPLEMENTARY INDEX on prayer_sessions
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user_completed
  ON prayer_sessions (user_id, started_at DESC)
  WHERE completed = TRUE;
```

---

## Offene Fragen und Entscheidungen

1. **Push-Benachrichtigungen:** Sollen Freundschaftsanfragen und Ziel-Erreichungen Push-Benachrichtigungen ausloesen? Falls ja, muss ein `notifications`-System geplant werden.

2. **Privatsphaeere-Einstellungen:** Soll es ein `privacy_settings`-Feld in `profiles` geben (z.B. `show_activity_to_friends`, `show_activity_to_groups`)?

3. **Gruppen-Chat:** Soll spaeter ein einfacher Chat in Gruppen integriert werden? Falls ja, sollte die Architektur dafuer vorbereitet werden (Supabase Realtime Channels).

4. **Moderation:** Brauchen wir eine Meldefunktion fuer unangemessene Gruppennamen oder -beschreibungen?

5. **Limits:** Soll es ein Maximum an Freundschaften oder Gruppenmitgliedschaften pro Nutzer geben?
