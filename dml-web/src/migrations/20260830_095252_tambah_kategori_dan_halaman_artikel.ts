import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_page_share_channels" AS ENUM('whatsapp', 'linkedin', 'x', 'email', 'copy');
  CREATE TABLE "posts_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "_posts_v_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"attribution" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_page_share_channels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_articles_page_share_channels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "articles_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Artikel' NOT NULL,
  	"intro" varchar DEFAULT 'Kabar operasi, armada, dan keselamatan dari lapangan.' NOT NULL,
  	"notice" varchar,
  	"page_size" numeric DEFAULT 6 NOT NULL,
  	"featured_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "posts" ADD COLUMN "reading_minutes" numeric;
  ALTER TABLE "_posts_v" ADD COLUMN "version_reading_minutes" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "posts_blocks_paragraph" ADD CONSTRAINT "posts_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_heading" ADD CONSTRAINT "posts_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_quote" ADD CONSTRAINT "posts_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_image" ADD CONSTRAINT "posts_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_image" ADD CONSTRAINT "posts_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_paragraph" ADD CONSTRAINT "_posts_v_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_heading" ADD CONSTRAINT "_posts_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_quote" ADD CONSTRAINT "_posts_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image" ADD CONSTRAINT "_posts_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image" ADD CONSTRAINT "_posts_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_page_share_channels" ADD CONSTRAINT "articles_page_share_channels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_page" ADD CONSTRAINT "articles_page_featured_id_posts_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_blocks_paragraph_order_idx" ON "posts_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "posts_blocks_paragraph_parent_id_idx" ON "posts_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_paragraph_path_idx" ON "posts_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "posts_blocks_heading_order_idx" ON "posts_blocks_heading" USING btree ("_order");
  CREATE INDEX "posts_blocks_heading_parent_id_idx" ON "posts_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_heading_path_idx" ON "posts_blocks_heading" USING btree ("_path");
  CREATE INDEX "posts_blocks_quote_order_idx" ON "posts_blocks_quote" USING btree ("_order");
  CREATE INDEX "posts_blocks_quote_parent_id_idx" ON "posts_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_quote_path_idx" ON "posts_blocks_quote" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_order_idx" ON "posts_blocks_image" USING btree ("_order");
  CREATE INDEX "posts_blocks_image_parent_id_idx" ON "posts_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_image_path_idx" ON "posts_blocks_image" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_image_idx" ON "posts_blocks_image" USING btree ("image_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_blocks_paragraph_order_idx" ON "_posts_v_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_paragraph_parent_id_idx" ON "_posts_v_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_paragraph_path_idx" ON "_posts_v_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_heading_order_idx" ON "_posts_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_heading_parent_id_idx" ON "_posts_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_heading_path_idx" ON "_posts_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_quote_order_idx" ON "_posts_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_quote_parent_id_idx" ON "_posts_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_quote_path_idx" ON "_posts_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_order_idx" ON "_posts_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_image_parent_id_idx" ON "_posts_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_image_path_idx" ON "_posts_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_image_idx" ON "_posts_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "articles_page_share_channels_order_idx" ON "articles_page_share_channels" USING btree ("order");
  CREATE INDEX "articles_page_share_channels_parent_idx" ON "articles_page_share_channels" USING btree ("parent_id");
  CREATE INDEX "articles_page_featured_idx" ON "articles_page" USING btree ("featured_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_heading" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_page_share_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_page" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_blocks_paragraph" CASCADE;
  DROP TABLE "posts_blocks_heading" CASCADE;
  DROP TABLE "posts_blocks_quote" CASCADE;
  DROP TABLE "posts_blocks_image" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_blocks_paragraph" CASCADE;
  DROP TABLE "_posts_v_blocks_heading" CASCADE;
  DROP TABLE "_posts_v_blocks_quote" CASCADE;
  DROP TABLE "_posts_v_blocks_image" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "articles_page_share_channels" CASCADE;
  DROP TABLE "articles_page" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "posts" DROP COLUMN "reading_minutes";
  ALTER TABLE "_posts_v" DROP COLUMN "version_reading_minutes";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  DROP TYPE "public"."enum_articles_page_share_channels";`)
}
