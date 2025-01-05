ALTER TABLE "sessions" ALTER COLUMN "metadata" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "token" varchar(24) NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "scope";--> statement-breakpoint
DROP TYPE "public"."session_scope";