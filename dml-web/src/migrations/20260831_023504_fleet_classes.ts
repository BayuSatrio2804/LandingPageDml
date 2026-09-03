import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "fleet_classes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"category" varchar NOT NULL,
  	"length_meters" numeric NOT NULL,
  	"beam_meters" numeric NOT NULL,
  	"dwt" numeric,
  	"capacity_label" varchar NOT NULL,
  	"passenger_capacity" numeric,
  	"alt_text" varchar NOT NULL,
  	"order" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fleet_classes_id" integer;
  CREATE UNIQUE INDEX "fleet_classes_slug_idx" ON "fleet_classes" USING btree ("slug");
  CREATE INDEX "fleet_classes_updated_at_idx" ON "fleet_classes" USING btree ("updated_at");
  CREATE INDEX "fleet_classes_created_at_idx" ON "fleet_classes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fleet_classes_fk" FOREIGN KEY ("fleet_classes_id") REFERENCES "public"."fleet_classes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fleet_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("fleet_classes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fleet_classes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fleet_classes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fleet_classes_fk";
  
  DROP INDEX "payload_locked_documents_rels_fleet_classes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fleet_classes_id";`)
}
