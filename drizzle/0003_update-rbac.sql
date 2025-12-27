ALTER TABLE "permission" ADD COLUMN "code" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "description" varchar(512);--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "description" varchar(512);--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_code_unique" UNIQUE("code");