import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "business_page_hero_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric NOT NULL,
  	"unit" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "business_page_lini_utama_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"num" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"metric" varchar NOT NULL,
  	"metric_label" varchar NOT NULL,
  	"cta" varchar NOT NULL
  );
  
  CREATE TABLE "business_page_alur_sts_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"desc" varchar NOT NULL
  );
  
  CREATE TABLE "business_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_intro" varchar NOT NULL,
  	"alur_sts_kicker" varchar NOT NULL,
  	"alur_sts_heading" varchar NOT NULL,
  	"alur_sts_intro" varchar NOT NULL,
  	"afiliasi_kicker" varchar NOT NULL,
  	"afiliasi_heading" varchar NOT NULL,
  	"afiliasi_subtext" varchar NOT NULL,
  	"klien_kicker" varchar NOT NULL,
  	"klien_heading" varchar NOT NULL,
  	"klien_stat1_unit" varchar NOT NULL,
  	"klien_stat1_caption" varchar NOT NULL,
  	"klien_stat2_value" varchar NOT NULL,
  	"klien_stat2_unit" varchar NOT NULL,
  	"klien_stat2_caption" varchar NOT NULL,
  	"klien_placeholder_note" varchar NOT NULL,
  	"cta_kicker" varchar NOT NULL,
  	"cta_heading" varchar NOT NULL,
  	"cta_primary_button_label" varchar NOT NULL,
  	"cta_secondary_button_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "business_page_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "business_page_hero_metrics" ADD CONSTRAINT "business_page_hero_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_page_lini_utama_panels" ADD CONSTRAINT "business_page_lini_utama_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_page_alur_sts_steps" ADD CONSTRAINT "business_page_alur_sts_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_page_texts" ADD CONSTRAINT "business_page_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "business_page_hero_metrics_order_idx" ON "business_page_hero_metrics" USING btree ("_order");
  CREATE INDEX "business_page_hero_metrics_parent_id_idx" ON "business_page_hero_metrics" USING btree ("_parent_id");
  CREATE INDEX "business_page_lini_utama_panels_order_idx" ON "business_page_lini_utama_panels" USING btree ("_order");
  CREATE INDEX "business_page_lini_utama_panels_parent_id_idx" ON "business_page_lini_utama_panels" USING btree ("_parent_id");
  CREATE INDEX "business_page_alur_sts_steps_order_idx" ON "business_page_alur_sts_steps" USING btree ("_order");
  CREATE INDEX "business_page_alur_sts_steps_parent_id_idx" ON "business_page_alur_sts_steps" USING btree ("_parent_id");
  CREATE INDEX "business_page_texts_order_parent" ON "business_page_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "business_page_hero_metrics" CASCADE;
  DROP TABLE "business_page_lini_utama_panels" CASCADE;
  DROP TABLE "business_page_alur_sts_steps" CASCADE;
  DROP TABLE "business_page" CASCADE;
  DROP TABLE "business_page_texts" CASCADE;`)
}
