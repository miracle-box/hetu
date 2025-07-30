CREATE TYPE "public"."skin_texture_variant" AS ENUM('classic', 'slim');--> statement-breakpoint
CREATE TABLE "mc_claims" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"user_id" varchar(24) NOT NULL,
	"mc_uuid" uuid NOT NULL,
	"mc_username" varchar NOT NULL,
	"skin_texture_url" varchar,
	"skin_texture_variant" "skin_texture_variant",
	"cape_texture_url" varchar,
	"cape_texture_alias" varchar,
	"bound_profile_id" varchar(24),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_mc_uuid" ON "mc_claims" USING btree ("mc_uuid");