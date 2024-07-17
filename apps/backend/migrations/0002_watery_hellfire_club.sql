ALTER TABLE "user" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_hash" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");