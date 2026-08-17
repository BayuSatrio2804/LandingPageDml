import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { buildConfig } from "payload";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? "" },
  }),
  editor: lexicalEditor(),
  sharp,
  collections: [Users, Media],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "../app/(payload)"),
    },
  },
});
