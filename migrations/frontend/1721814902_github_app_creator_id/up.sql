ALTER TABLE IF EXISTS github_apps
    ADD COLUMN IF NOT EXISTS creator_id BIGINT DEFAULT 0;

ALTER TABLE IF EXISTS github_apps
    ALTER COLUMN creator_id SET NOT NULL;
