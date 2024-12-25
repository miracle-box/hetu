DO $$ BEGIN
 CREATE TYPE "public"."file_type" AS ENUM('texture_skin', 'texture_cape');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."session_scope" AS ENUM('default', 'yggdrasil');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."texture_type" AS ENUM('cape', 'skin', 'skin_slim');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."auth_type" AS ENUM('password');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."verification_method" AS ENUM('email');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"hash" varchar(64) NOT NULL,
	"size" bigint NOT NULL,
	"type" "file_type" NOT NULL,
	"mime_type" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" varchar(24) NOT NULL,
	"name" varchar NOT NULL,
	"skin_texture_id" varchar(24),
	"cape_texture_id" varchar(24),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"uid" varchar(24) NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"scope" "session_scope" NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "textures" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"author_id" varchar(24) NOT NULL,
	"name" varchar NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" "texture_type" NOT NULL,
	"hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_name_unique" UNIQUE("name"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar(24),
	"method" "verification_method" NOT NULL,
	"secret" varchar NOT NULL,
	"metadata" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ygg_server_sessions" (
	"server_id" varchar PRIMARY KEY NOT NULL,
	"access_token" varchar(24) NOT NULL,
	"client_ip" varchar,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_file_in_type" ON "files" USING btree ("hash","type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_primary_profile" ON "profiles" USING btree ("author_id") WHERE "profiles"."is_primary" = TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_lowercase_name" ON "profiles" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_password" ON "user_auth" USING btree ("user_id") WHERE "user_auth"."type" = 'password';