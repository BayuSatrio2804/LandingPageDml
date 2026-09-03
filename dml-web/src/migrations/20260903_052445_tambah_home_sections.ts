import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"day_cut_heading" varchar NOT NULL,
  	"day_cut_body" varchar NOT NULL,
  	"affiliates_heading" varchar NOT NULL,
  	"affiliates_subtext" varchar NOT NULL,
  	"fleet_comparator_heading" varchar NOT NULL,
  	"fleet_comparator_description" varchar NOT NULL,
  	"fleet_comparator_description_static" varchar NOT NULL,
  	"fleet_comparator_drag_hint" varchar NOT NULL,
  	"fleet_comparator_grid_hint" varchar NOT NULL,
  	"route_map_heading" varchar NOT NULL,
  	"route_map_description" varchar NOT NULL,
  	"since1988_heading" varchar NOT NULL,
  	"since1988_counter_caption" varchar NOT NULL,
  	"since1988_founding_sentence" varchar NOT NULL,
  	"since1988_genealogy_link_label" varchar NOT NULL,
  	"stats_ships_label" varchar NOT NULL,
  	"stats_people_label" varchar NOT NULL,
  	"stats_years_label" varchar NOT NULL,
  	"stats_ports_label" varchar NOT NULL,
  	"stats_memberships_heading" varchar NOT NULL,
  	"cta_heading" varchar NOT NULL,
  	"cta_button_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_sections" CASCADE;`)
}
