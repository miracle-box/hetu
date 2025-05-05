BEGIN;
ALTER TYPE "public"."auth_type" ADD VALUE 'oauth2';--> statement-breakpoint
ALTER TYPE "public"."verification_scenario" ADD VALUE 'oauth2_bind';--> statement-breakpoint
ALTER TYPE "public"."verification_scenario" ADD VALUE 'oauth2_signin';--> statement-breakpoint
ALTER TYPE "public"."verification_type" ADD VALUE 'oauth2';--> statement-breakpoint
COMMIT;

ALTER TABLE "verifications" DROP CONSTRAINT "unique_secret";--> statement-breakpoint
ALTER TABLE "user_auth" ADD COLUMN "provider" varchar;--> statement-breakpoint
ALTER TABLE "user_auth" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_oauth2_user" ON "user_auth" USING btree ("user_id","provider") WHERE "user_auth"."type" = 'oauth2';--> statement-breakpoint
CREATE UNIQUE INDEX "unique_oauth2_target" ON "user_auth" USING btree ("provider","credential") WHERE "user_auth"."type" = 'oauth2';
