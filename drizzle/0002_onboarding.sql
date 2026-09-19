ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "onboarding" jsonb DEFAULT '{}'::jsonb NOT NULL;
