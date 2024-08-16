ALTER TABLE "profile" DROP CONSTRAINT "profile_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_lowercase_name" ON "profile" USING btree (lower("name"));