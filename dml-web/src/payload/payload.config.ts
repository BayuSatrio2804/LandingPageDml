import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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
import { HomeHero } from "./globals/HomeHero";
import { HomeSections } from "./globals/HomeSections";
import { AboutPage } from "./globals/AboutPage";
import { BusinessPage } from "./globals/BusinessPage";
import { CompanyProfile } from "./globals/CompanyProfile";
import { SiteNavigation } from "./globals/SiteNavigation";
import { migrations } from "../migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Penyimpanan berkas upload Payload.
 *
 * Default: disk lokal lewat MEDIA_STATIC_DIR (lihat Media.ts) -- itu yang
 * dipakai `bun run dev`, test, dan image Docker dengan volume.
 *
 * Kalau BLOB_READ_WRITE_TOKEN ada (otomatis di-inject Vercel begitu Blob
 * store terhubung ke project), koleksi `media` dialihkan ke Vercel Blob.
 * Filesystem Vercel ephemeral, jadi tanpa ini tiap upload admin hilang di
 * redeploy berikutnya. Adapter-nya sendiri sudah balik ke disk lokal kalau
 * token-nya kosong, jadi tidak ada cabang env manual di sini.
 *
 * Berkas Blob selalu publik dan punya URL absolut sendiri
 * (`<store>.public.blob.vercel-storage.com/...`), jadi `media.url` bisa
 * langsung dipakai next/image dan opengraph-image.tsx tanpa proksi lewat
 * route /api/media/file/*.
 */
const storagePlugins = [
  vercelBlobStorage({
    collections: {
      // disablePayloadAccessControl: `media.url` jadi URL absolut Blob
      // (`<store>.public.blob.vercel-storage.com/...`), bukan route proksi
      // `/api/media/file/*`. next/image memakainya langsung tanpa satu
      // invokasi function per gambar, dan opengraph-image.tsx yang jalan
      // saat build bisa fetch byte cover-nya (route proksi belum hidup saat
      // build).
      media: { disablePayloadAccessControl: true },
    },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
];

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
  plugins: storagePlugins,
  collections: [Users, Media, Inquiries, Posts, Categories, Clients, Certifications, BusinessLines, Vessels, FleetClasses, LegalDocuments],
  globals: [
    HomeHero,
    HomeSections,
    AboutPage,
    BusinessPage,
    ArticlesPage,
    CompanyProfile,
    SiteNavigation,
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "../app/(payload)"),
    },
  },
});
