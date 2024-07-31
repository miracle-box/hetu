CREATE TABLE IF NOT EXISTS "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar(24) NOT NULL,
	"name" varchar NOT NULL,
	"skin_texture_id" varchar(24),
	"cape_texture_id" varchar(24),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	CONSTRAINT "profile_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "unique_password";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_skin_texture_id_texture_id_fk" FOREIGN KEY ("skin_texture_id") REFERENCES "public"."texture"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile" ADD CONSTRAINT "profile_cape_texture_id_texture_id_fk" FOREIGN KEY ("cape_texture_id") REFERENCES "public"."texture"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_primary_profile" ON "profile" USING btree ("author_id") WHERE "profile"."is_primary" = TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_password" ON "user_auth" USING btree ("user_id") WHERE "user_auth"."type" = 'password';