import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_career" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"career_title" varchar NOT NULL,
  	"career_no_openings_text" varchar NOT NULL,
  	"career_spontaneous_text" varchar NOT NULL,
  	"career_whatsapp_button_label" varchar NOT NULL,
  	"career_whatsapp_message" varchar NOT NULL,
  	"contact_title" varchar NOT NULL,
  	"contact_intro" varchar NOT NULL,
  	"contact_phone_label" varchar NOT NULL,
  	"contact_maps_link_label" varchar NOT NULL,
  	"contact_per_line_heading" varchar NOT NULL,
  	"contact_per_line_intro" varchar NOT NULL,
  	"contact_per_line_link_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_career" CASCADE;`)
}
