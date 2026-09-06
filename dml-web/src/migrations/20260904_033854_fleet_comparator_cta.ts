import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_hero" ALTER COLUMN "eyebrow" DROP NOT NULL;
  ALTER TABLE "home_hero" ALTER COLUMN "subheadline" DROP NOT NULL;
  ALTER TABLE "home_sections" ADD COLUMN "fleet_comparator_cta_heading" varchar NOT NULL DEFAULT 'Butuh armada untuk transportasi BBM atau penyeberangan Anda?';
  ALTER TABLE "home_sections" ADD COLUMN "fleet_comparator_cta_button_label" varchar NOT NULL DEFAULT 'Hubungi Kami';
  ALTER TABLE "home_sections" ALTER COLUMN "fleet_comparator_cta_heading" DROP DEFAULT;
  ALTER TABLE "home_sections" ALTER COLUMN "fleet_comparator_cta_button_label" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_hero" ALTER COLUMN "eyebrow" SET NOT NULL;
  ALTER TABLE "home_hero" ALTER COLUMN "subheadline" SET NOT NULL;
  ALTER TABLE "home_sections" DROP COLUMN "fleet_comparator_cta_heading";
  ALTER TABLE "home_sections" DROP COLUMN "fleet_comparator_cta_button_label";`)
}
