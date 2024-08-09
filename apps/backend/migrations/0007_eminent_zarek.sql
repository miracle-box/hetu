DO $$ BEGIN
 CREATE TYPE "public"."session_scope" AS ENUM('default', 'yggdrasil');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "scope" "session_scope" NOT NULL;