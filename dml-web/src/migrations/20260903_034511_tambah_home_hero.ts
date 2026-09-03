import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"subheadline" varchar NOT NULL,
  	"scroll_label" varchar DEFAULT 'Gulir' NOT NULL,
  	"bbm_label" varchar NOT NULL,
  	"bbm_value" numeric NOT NULL,
  	"bbm_unit" varchar NOT NULL,
  	"bbm_description" varchar NOT NULL,
  	"bbm_cta_label" varchar NOT NULL,
  	"roro_label" varchar NOT NULL,
  	"roro_value" numeric NOT NULL,
  	"roro_unit" varchar NOT NULL,
  	"roro_description" varchar NOT NULL,
  	"roro_cta_label" varchar NOT NULL,
  	"roro_cta_href" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_hero" CASCADE;`)
}
