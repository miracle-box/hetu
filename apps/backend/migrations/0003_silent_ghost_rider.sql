DO $$ BEGIN
 CREATE TYPE "public"."texture_type" AS ENUM('skin', 'skin_slim', 'cape');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "texture" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"author_id" varchar(24) NOT NULL,
	"name" varchar NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" "texture_type" NOT NULL,
	"hash" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "texture" ADD CONSTRAINT "texture_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
