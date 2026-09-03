import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "about_page_identity" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_intro1" varchar NOT NULL,
  	"hero_intro2" varchar NOT NULL,
  	"stat_labels_years" varchar NOT NULL,
  	"stat_labels_ships" varchar NOT NULL,
  	"stat_labels_people" varchar NOT NULL,
  	"stat_labels_sectors" varchar NOT NULL,
  	"core_values_heading" varchar NOT NULL,
  	"core_values_intro" varchar NOT NULL,
  	"core_values_medallion_caption" varchar NOT NULL,
  	"group_chart_heading" varchar NOT NULL,
  	"group_chart_intro" varchar NOT NULL,
  	"group_chart_parent_name" varchar NOT NULL,
  	"group_chart_parent_caption" varchar NOT NULL,
  	"legal_heading" varchar NOT NULL,
  	"legal_standards_label" varchar NOT NULL,
  	"legal_memberships_label" varchar NOT NULL,
  	"legal_footnote" varchar NOT NULL,
  	"offices_heading" varchar NOT NULL,
  	"offices_intro" varchar NOT NULL,
  	"offices_dml_owner_label" varchar NOT NULL,
  	"offices_group_owner_label" varchar NOT NULL,
  	"cta_heading" varchar NOT NULL,
  	"cta_primary_button_label" varchar NOT NULL,
  	"cta_secondary_button_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "about_page_identity" ADD CONSTRAINT "about_page_identity_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_texts" ADD CONSTRAINT "about_page_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "about_page_identity_order_idx" ON "about_page_identity" USING btree ("_order");
  CREATE INDEX "about_page_identity_parent_id_idx" ON "about_page_identity" USING btree ("_parent_id");
  CREATE INDEX "about_page_texts_order_parent" ON "about_page_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "about_page_identity" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_texts" CASCADE;`)
}
