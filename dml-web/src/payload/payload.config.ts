import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { buildConfig } from "payload";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Inquiries } from "./collections/Inquiries";
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
  }),
  editor: lexicalEditor(),
  sharp,
  collections: [Users, Media, Inquiries],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "../app/(payload)"),
    },
  },
});
