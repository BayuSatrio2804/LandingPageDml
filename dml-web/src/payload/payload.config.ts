import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { buildConfig } from "payload";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Inquiries } from "./collections/Inquiries";
import { Posts } from "./collections/Posts";
import { Categories } from "./collections/Categories";
import { Clients } from "./collections/Clients";
import { Certifications } from "./collections/Certifications";
import { BusinessLines } from "./collections/BusinessLines";
import { Vessels } from "./collections/Vessels";
import { FleetClasses } from "./collections/FleetClasses";
import { LegalDocuments } from "./collections/LegalDocuments";
import { ArticlesPage } from "./globals/ArticlesPage";
import { CompanyProfile } from "./globals/CompanyProfile";
import { SiteNavigation } from "./globals/SiteNavigation";
import { migrations } from "../migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? "" },
    // Bundled production builds (next build/start) can't read migration files
    // off disk dynamically, jadi migrasi harus diwire statis lewat
    // prodMigrations. Ini juga yang bikin src/migrations/index.ts (dan
    // migrasi individualnya) terhubung ke entry point sungguhan, bukan
    // dead code.
    prodMigrations: migrations,
    // push:false wajib: tanpa ini, "bun run dev" diam-diam push skema
    // langsung ke DB dan menandai baris migrasi dengan batch:-1. Baris itu
    // membuat migrate() (termasuk prodMigrations di atas saat boot
    // produksi) berhenti di prompt konfirmasi interaktif, yang hang
    // selamanya di proses non-TTY (container, CI, Playwright webServer).
    // Migrasi terkomit sudah jadi satu-satunya sumber kebenaran skema.
    push: false,
  }),
  editor: lexicalEditor(),
  sharp,
  collections: [Users, Media, Inquiries, Posts, Categories, Clients, Certifications, BusinessLines, Vessels, FleetClasses, LegalDocuments],
  globals: [ArticlesPage, CompanyProfile, SiteNavigation],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "../app/(payload)"),
    },
  },
});
