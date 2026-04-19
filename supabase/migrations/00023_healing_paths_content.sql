-- ============================================================================
-- 00023_healing_paths_content.sql
--
-- Erweitert die healing_programs/healing_program_days-Tabellen um die Felder,
-- die das "Wege zur Heilung und Befreiung"-Dokument vorsieht:
--
--   * scripture_motto      — Bibelvers-Motto als Untertitel
--     (z.B. "Selig, die reinen Herzens sind..." Mt 5,8)
--   * closing_de/en        — Nachwort / Weiterfuehrung nach dem letzten Tag
--   * requires_confessor   — Pastoraler Hinweis bei schweren Themen
--   * show_seelengemeinschaft — Seelengemeinschafts-Hinweis im Tagesfuss
--                              anzeigen (fuer Sucht-, Isolations-, Schamthemen)
--
--   * prayer_de/en         — Kurzes, freies Gebet des Tages
--                              (eigener Block neben Reflexion/Impuls)
--   * action_de/en         — Konkrete Handlung des Tages
--     (Der bestehende "intention_*" Spaltenname wurde fruehere als
--     Tagesgebets-Anliegen interpretiert; die vier Tagesbloecke verlangen
--     jedoch ein sauber getrenntes Gebet + Handlung. Wir lassen
--     intention_* bestehen, fuegen aber prayer_* und action_* als
--     eindeutig getrennte Felder hinzu.)
-- ============================================================================

alter table healing_programs
  add column if not exists scripture_motto text,
  add column if not exists closing_de text,
  add column if not exists closing_en text,
  add column if not exists requires_confessor boolean not null default false,
  add column if not exists show_seelengemeinschaft boolean not null default false;

alter table healing_program_days
  add column if not exists prayer_de text,
  add column if not exists prayer_en text,
  add column if not exists action_de text,
  add column if not exists action_en text;
