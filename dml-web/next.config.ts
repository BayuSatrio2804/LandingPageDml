import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  /**
   * standalone memancarkan server minimal beserta hanya dependency yang
   * benar-benar dipakai, yang mengecilkan image container secara drastis.
   *
   * Ia berinteraksi dengan withPayload, dan interaksinya wajib diverifikasi
   * bukan diasumsikan: Payload memuat berkas config saat runtime, sementara
   * standalone bekerja dengan menelusuri berkas yang dipakai. Yang paling
   * mungkin luput dari hasil telusur adalah importMap admin dan berkas
   * migrasi. Task 20 Step 4 memeriksa /admin dari dalam container, bukan
   * dari next start lokal.
   */
  output: "standalone",
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
