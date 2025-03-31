CREATE TYPE "public"."verification_scenario" AS ENUM('signup', 'password_reset');--> statement-breakpoint
ALTER TYPE "public"."verification_method" RENAME TO "verification_type";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "method" TO "type";--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "scenario" "verification_scenario" NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "target" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "verified" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "tries_left" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "verifications" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "unique_secret" UNIQUE("target","type","secret");