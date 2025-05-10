CREATE TABLE IF NOT EXISTS "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_group" varchar(50) NOT NULL,
	"attack_method" varchar(100) NOT NULL,
	"target_type" varchar(100),
	"confidence" integer NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"features" json,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "threats" (
	"id" serial PRIMARY KEY NOT NULL,
	"apt_group" varchar(50) NOT NULL,
	"attack_method" varchar(100) NOT NULL,
	"target" varchar(100),
	"location" varchar(100),
	"confidence" integer,
	"timestamp" timestamp DEFAULT now(),
	"details" json,
	"source" varchar(50) NOT NULL,
	"source_url" varchar(500),
	"ioc" varchar(500),
	"verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"favorite_groups" json,
	"dashboard_layout" json,
	"dark_mode" boolean DEFAULT true,
	"alerts_enabled" boolean DEFAULT true,
	"last_visited" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"password" text,
	"image" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
