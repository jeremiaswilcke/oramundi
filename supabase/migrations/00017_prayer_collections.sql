-- User prayer collections: personal sets of prayers from the library
-- (e.g. "My morning prayer" bundling Sign of the Cross + Morning Offering +
-- JPII daily + Angelus).

CREATE TABLE IF NOT EXISTS user_prayer_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT CHECK (char_length(description) <= 500),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_prayer_collections_user
  ON user_prayer_collections(user_id, sort_order);

ALTER TABLE user_prayer_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads collections"
  ON user_prayer_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owner writes collections"
  ON user_prayer_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates collections"
  ON user_prayer_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owner deletes collections"
  ON user_prayer_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Items inside a collection. prayer_slug refers to PRAYER_LIBRARY slugs in code
-- (or a special slug like "rosary:joyful" for mystery sets).
CREATE TABLE IF NOT EXISTS user_prayer_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES user_prayer_collections(id) ON DELETE CASCADE,
  prayer_slug TEXT NOT NULL CHECK (char_length(prayer_slug) BETWEEN 1 AND 120),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, prayer_slug)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection
  ON user_prayer_collection_items(collection_id, sort_order);

ALTER TABLE user_prayer_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads items"
  ON user_prayer_collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_prayer_collections c
      WHERE c.id = user_prayer_collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner writes items"
  ON user_prayer_collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_prayer_collections c
      WHERE c.id = user_prayer_collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner updates items"
  ON user_prayer_collection_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_prayer_collections c
      WHERE c.id = user_prayer_collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner deletes items"
  ON user_prayer_collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_prayer_collections c
      WHERE c.id = user_prayer_collection_items.collection_id
        AND c.user_id = auth.uid()
    )
  );
