import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_company_profile_values_key" AS ENUM('D', 'M', 'L');
  CREATE TYPE "public"."enum_company_profile_standards_items_source" AS ENUM('cp-pdf', 'riset-publik', 'belum-terverifikasi');
  CREATE TABLE "company_profile_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"street" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"postal_code" varchar,
  	"province" varchar NOT NULL,
  	"phone" varchar,
  	"fax" varchar
  );
  
  CREATE TABLE "company_profile_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_company_profile_values_key" NOT NULL,
  	"term" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "company_profile_standards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"source" "enum_company_profile_standards_items_source" NOT NULL
  );
  
  CREATE TABLE "company_profile_standards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "company_profile_memberships" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"expansion" varchar
  );
  
  CREATE TABLE "company_profile_group_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"street" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"postal_code" varchar,
  	"province" varchar NOT NULL,
  	"phone" varchar,
  	"fax" varchar
  );
  
  CREATE TABLE "company_profile_group_units" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sector" varchar NOT NULL
  );
  
  CREATE TABLE "company_profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legal_name" varchar NOT NULL,
  	"short_name" varchar NOT NULL,
  	"abbreviation" varchar NOT NULL,
  	"tagline" varchar NOT NULL,
  	"founded_iso" timestamp(3) with time zone NOT NULL,
  	"founder" varchar NOT NULL,
  	"parent" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar NOT NULL,
  	"booking_url" varchar NOT NULL,
  	"fleet_summary_vessels" numeric NOT NULL,
  	"fleet_summary_passenger_vessels" numeric NOT NULL,
  	"fleet_summary_oil_transport_vessels" numeric NOT NULL,
  	"fleet_summary_people" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "company_profile_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_navigation_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "site_navigation_footer_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean DEFAULT false
  );
  
  CREATE TABLE "site_navigation_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "site_navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "company_profile_offices" ADD CONSTRAINT "company_profile_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_values" ADD CONSTRAINT "company_profile_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_standards_items" ADD CONSTRAINT "company_profile_standards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile_standards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_standards" ADD CONSTRAINT "company_profile_standards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_memberships" ADD CONSTRAINT "company_profile_memberships_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_group_offices" ADD CONSTRAINT "company_profile_group_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_group_units" ADD CONSTRAINT "company_profile_group_units_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_profile_texts" ADD CONSTRAINT "company_profile_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."company_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_navigation_nav_items" ADD CONSTRAINT "site_navigation_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_navigation_footer_groups_items" ADD CONSTRAINT "site_navigation_footer_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_navigation_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_navigation_footer_groups" ADD CONSTRAINT "site_navigation_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "company_profile_offices_order_idx" ON "company_profile_offices" USING btree ("_order");
  CREATE INDEX "company_profile_offices_parent_id_idx" ON "company_profile_offices" USING btree ("_parent_id");
  CREATE INDEX "company_profile_values_order_idx" ON "company_profile_values" USING btree ("_order");
  CREATE INDEX "company_profile_values_parent_id_idx" ON "company_profile_values" USING btree ("_parent_id");
  CREATE INDEX "company_profile_standards_items_order_idx" ON "company_profile_standards_items" USING btree ("_order");
  CREATE INDEX "company_profile_standards_items_parent_id_idx" ON "company_profile_standards_items" USING btree ("_parent_id");
  CREATE INDEX "company_profile_standards_order_idx" ON "company_profile_standards" USING btree ("_order");
  CREATE INDEX "company_profile_standards_parent_id_idx" ON "company_profile_standards" USING btree ("_parent_id");
  CREATE INDEX "company_profile_memberships_order_idx" ON "company_profile_memberships" USING btree ("_order");
  CREATE INDEX "company_profile_memberships_parent_id_idx" ON "company_profile_memberships" USING btree ("_parent_id");
  CREATE INDEX "company_profile_group_offices_order_idx" ON "company_profile_group_offices" USING btree ("_order");
  CREATE INDEX "company_profile_group_offices_parent_id_idx" ON "company_profile_group_offices" USING btree ("_parent_id");
  CREATE INDEX "company_profile_group_units_order_idx" ON "company_profile_group_units" USING btree ("_order");
  CREATE INDEX "company_profile_group_units_parent_id_idx" ON "company_profile_group_units" USING btree ("_parent_id");
  CREATE INDEX "company_profile_texts_order_parent" ON "company_profile_texts" USING btree ("order","parent_id");
  CREATE INDEX "site_navigation_nav_items_order_idx" ON "site_navigation_nav_items" USING btree ("_order");
  CREATE INDEX "site_navigation_nav_items_parent_id_idx" ON "site_navigation_nav_items" USING btree ("_parent_id");
  CREATE INDEX "site_navigation_footer_groups_items_order_idx" ON "site_navigation_footer_groups_items" USING btree ("_order");
  CREATE INDEX "site_navigation_footer_groups_items_parent_id_idx" ON "site_navigation_footer_groups_items" USING btree ("_parent_id");
  CREATE INDEX "site_navigation_footer_groups_order_idx" ON "site_navigation_footer_groups" USING btree ("_order");
  CREATE INDEX "site_navigation_footer_groups_parent_id_idx" ON "site_navigation_footer_groups" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "company_profile_offices" CASCADE;
  DROP TABLE "company_profile_values" CASCADE;
  DROP TABLE "company_profile_standards_items" CASCADE;
  DROP TABLE "company_profile_standards" CASCADE;
  DROP TABLE "company_profile_memberships" CASCADE;
  DROP TABLE "company_profile_group_offices" CASCADE;
  DROP TABLE "company_profile_group_units" CASCADE;
  DROP TABLE "company_profile" CASCADE;
  DROP TABLE "company_profile_texts" CASCADE;
  DROP TABLE "site_navigation_nav_items" CASCADE;
  DROP TABLE "site_navigation_footer_groups_items" CASCADE;
  DROP TABLE "site_navigation_footer_groups" CASCADE;
  DROP TABLE "site_navigation" CASCADE;
  DROP TYPE "public"."enum_company_profile_values_key";
  DROP TYPE "public"."enum_company_profile_standards_items_source";`)
}
