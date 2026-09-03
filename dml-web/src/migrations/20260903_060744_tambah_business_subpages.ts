import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "business_subpages_bbm_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "business_subpages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bbm_eyebrow" varchar NOT NULL,
  	"bbm_title" varchar NOT NULL,
  	"bbm_kelas_armada_heading" varchar NOT NULL,
  	"bbm_kelas_armada_desc" varchar NOT NULL,
  	"bbm_sumber_note" varchar NOT NULL,
  	"bbm_daftar_kapal_heading" varchar NOT NULL,
  	"bbm_daftar_kapal_desc" varchar NOT NULL,
  	"bbm_alur_heading" varchar NOT NULL,
  	"bbm_alur_desc" varchar NOT NULL,
  	"bbm_standar_heading" varchar NOT NULL,
  	"bbm_cta_label" varchar NOT NULL,
  	"roro_eyebrow" varchar NOT NULL,
  	"roro_title" varchar NOT NULL,
  	"roro_lintasan_heading" varchar NOT NULL,
  	"roro_lintasan_desc" varchar NOT NULL,
  	"roro_armada_heading" varchar NOT NULL,
  	"roro_armada_desc" varchar NOT NULL,
  	"roro_length_label" varchar NOT NULL,
  	"roro_length_unit" varchar NOT NULL,
  	"roro_capacity_label" varchar NOT NULL,
  	"roro_tiket_heading" varchar NOT NULL,
  	"roro_tiket_desc" varchar NOT NULL,
  	"roro_tiket_button_label" varchar NOT NULL,
  	"inquiry_title" varchar NOT NULL,
  	"inquiry_intro" varchar NOT NULL,
  	"inquiry_direct_contact_label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "business_subpages_bbm_steps" ADD CONSTRAINT "business_subpages_bbm_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_subpages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "business_subpages_bbm_steps_order_idx" ON "business_subpages_bbm_steps" USING btree ("_order");
  CREATE INDEX "business_subpages_bbm_steps_parent_id_idx" ON "business_subpages_bbm_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "business_subpages_bbm_steps" CASCADE;
  DROP TABLE "business_subpages" CASCADE;`)
}
