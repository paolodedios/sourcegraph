ALTER TABLE github_apps
    ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'repos';
