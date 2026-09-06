import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "business_page_hero_metrics" CASCADE;
  DROP TABLE "business_page_lini_utama_panels" CASCADE;
  DROP TABLE "business_page_alur_sts_steps" CASCADE;
  DROP TABLE "business_page_texts" CASCADE;
  ALTER TABLE "business_page" DROP COLUMN "hero_title";
  ALTER TABLE "business_page" DROP COLUMN "hero_intro";
  ALTER TABLE "business_page" DROP COLUMN "alur_sts_kicker";
  ALTER TABLE "business_page" DROP COLUMN "alur_sts_heading";
  ALTER TABLE "business_page" DROP COLUMN "alur_sts_intro";
  ALTER TABLE "business_page" DROP COLUMN "cta_kicker";
  ALTER TABLE "business_page" DROP COLUMN "cta_heading";
  ALTER TABLE "business_page" DROP COLUMN "cta_primary_button_label";
  ALTER TABLE "business_page" DROP COLUMN "cta_secondary_button_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  
  CREATE TABLE "business_page_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "business_page" ADD COLUMN "hero_title" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "hero_intro" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "alur_sts_kicker" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "alur_sts_heading" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "alur_sts_intro" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "cta_kicker" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "cta_heading" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "cta_primary_button_label" varchar NOT NULL;
  ALTER TABLE "business_page" ADD COLUMN "cta_secondary_button_label" varchar NOT NULL;
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
