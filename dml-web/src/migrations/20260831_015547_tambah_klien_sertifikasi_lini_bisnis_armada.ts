import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_clients_source" AS ENUM('cp-pdf', 'riset-publik', 'belum-terverifikasi');
  CREATE TYPE "public"."enum_certifications_source" AS ENUM('cp-pdf', 'riset-publik', 'belum-terverifikasi');
  CREATE TYPE "public"."enum_business_lines_kind" AS ENUM('lini-utama', 'afiliasi');
  CREATE TYPE "public"."enum_vessels_source" AS ENUM('cp-pdf', 'riset-publik', 'belum-terverifikasi');
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"sector" varchar NOT NULL,
  	"logo_id" integer,
  	"source" "enum_clients_source" NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "certifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"badge_id" integer NOT NULL,
  	"alt" varchar NOT NULL,
  	"source" "enum_certifications_source" NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_lines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "enum_business_lines_kind" NOT NULL,
  	"number" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"operator" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"metric_value" varchar,
  	"metric_label" varchar,
  	"media_id" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_lines_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "vessels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"class_slug" varchar NOT NULL,
  	"route_id" varchar,
  	"source" "enum_vessels_source" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "certifications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "business_lines_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vessels_id" integer;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certifications" ADD CONSTRAINT "certifications_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_lines_texts" ADD CONSTRAINT "business_lines_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_lines"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE INDEX "certifications_badge_idx" ON "certifications" USING btree ("badge_id");
  CREATE INDEX "certifications_updated_at_idx" ON "certifications" USING btree ("updated_at");
  CREATE INDEX "certifications_created_at_idx" ON "certifications" USING btree ("created_at");
  CREATE UNIQUE INDEX "business_lines_slug_idx" ON "business_lines" USING btree ("slug");
  CREATE INDEX "business_lines_updated_at_idx" ON "business_lines" USING btree ("updated_at");
  CREATE INDEX "business_lines_created_at_idx" ON "business_lines" USING btree ("created_at");
  CREATE INDEX "business_lines_texts_order_parent" ON "business_lines_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "vessels_name_idx" ON "vessels" USING btree ("name");
  CREATE INDEX "vessels_class_slug_idx" ON "vessels" USING btree ("class_slug");
  CREATE INDEX "vessels_updated_at_idx" ON "vessels" USING btree ("updated_at");
  CREATE INDEX "vessels_created_at_idx" ON "vessels" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certifications_fk" FOREIGN KEY ("certifications_id") REFERENCES "public"."certifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_lines_fk" FOREIGN KEY ("business_lines_id") REFERENCES "public"."business_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vessels_fk" FOREIGN KEY ("vessels_id") REFERENCES "public"."vessels"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_certifications_id_idx" ON "payload_locked_documents_rels" USING btree ("certifications_id");
  CREATE INDEX "payload_locked_documents_rels_business_lines_id_idx" ON "payload_locked_documents_rels" USING btree ("business_lines_id");
  CREATE INDEX "payload_locked_documents_rels_vessels_id_idx" ON "payload_locked_documents_rels" USING btree ("vessels_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "certifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_lines_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vessels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "certifications" CASCADE;
  DROP TABLE "business_lines" CASCADE;
  DROP TABLE "business_lines_texts" CASCADE;
  DROP TABLE "vessels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clients_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_certifications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_business_lines_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vessels_fk";
  
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  DROP INDEX "payload_locked_documents_rels_certifications_id_idx";
  DROP INDEX "payload_locked_documents_rels_business_lines_id_idx";
  DROP INDEX "payload_locked_documents_rels_vessels_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "certifications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "business_lines_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vessels_id";
  DROP TYPE "public"."enum_clients_source";
  DROP TYPE "public"."enum_certifications_source";
  DROP TYPE "public"."enum_business_lines_kind";
  DROP TYPE "public"."enum_vessels_source";`)
}
