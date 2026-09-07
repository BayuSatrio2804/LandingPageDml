import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_career" DROP COLUMN "contact_per_line_heading";
  ALTER TABLE "contact_career" DROP COLUMN "contact_per_line_intro";
  ALTER TABLE "contact_career" DROP COLUMN "contact_per_line_link_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_career" ADD COLUMN "contact_per_line_heading" varchar NOT NULL;
  ALTER TABLE "contact_career" ADD COLUMN "contact_per_line_intro" varchar NOT NULL;
  ALTER TABLE "contact_career" ADD COLUMN "contact_per_line_link_label" varchar NOT NULL;`)
}
