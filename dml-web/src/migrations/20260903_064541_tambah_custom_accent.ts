import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'ocean' BEFORE 'teal';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'pine' BEFORE 'forest';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'indigo' BEFORE 'plum';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'aubergine' BEFORE 'plum';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'wine';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'espresso';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'slate';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'charcoal';
  ALTER TYPE "public"."enum_appearance_theme" ADD VALUE 'custom';
  ALTER TABLE "appearance" ADD COLUMN "custom_accent" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "appearance" ALTER COLUMN "theme" SET DATA TYPE text;
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DEFAULT 'navy'::text;
  DROP TYPE "public"."enum_appearance_theme";
  CREATE TYPE "public"."enum_appearance_theme" AS ENUM('navy', 'teal', 'forest', 'plum');
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DEFAULT 'navy'::"public"."enum_appearance_theme";
  ALTER TABLE "appearance" ALTER COLUMN "theme" SET DATA TYPE "public"."enum_appearance_theme" USING "theme"::"public"."enum_appearance_theme";
  ALTER TABLE "appearance" DROP COLUMN "custom_accent";`)
}
