ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'session'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "session" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "user_id";