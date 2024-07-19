DO $$ BEGIN
 CREATE TYPE "public"."auth_type" AS ENUM('password');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_auth" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"type" "auth_type" NOT NULL,
	"credential" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "password_hash";