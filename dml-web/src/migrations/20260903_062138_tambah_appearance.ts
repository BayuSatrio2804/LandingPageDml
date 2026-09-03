import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_appearance_theme" AS ENUM('navy', 'teal', 'forest', 'plum');
  CREATE TABLE "appearance" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum_appearance_theme" DEFAULT 'navy' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "appearance" CASCADE;
  DROP TYPE "public"."enum_appearance_theme";`)
}
