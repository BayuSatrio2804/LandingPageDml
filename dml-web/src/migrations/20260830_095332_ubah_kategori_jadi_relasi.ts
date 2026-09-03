import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "category_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_category_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  ALTER TABLE "posts" DROP COLUMN "category";
  ALTER TABLE "_posts_v" DROP COLUMN "version_category";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum__posts_v_version_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_category" AS ENUM('operasi', 'armada', 'keselamatan', 'perusahaan');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('operasi', 'armada', 'keselamatan', 'perusahaan');
  ALTER TABLE "posts" DROP CONSTRAINT "posts_category_id_categories_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_category_id_categories_id_fk";
  
  DROP INDEX "posts_category_idx";
  DROP INDEX "_posts_v_version_version_category_idx";
  ALTER TABLE "posts" ADD COLUMN "category" "enum_posts_category";
  ALTER TABLE "_posts_v" ADD COLUMN "version_category" "enum__posts_v_version_category";
  ALTER TABLE "posts" DROP COLUMN "category_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_category_id";`)
}
