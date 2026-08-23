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
  /**
   * withPayload() sendiri sudah memasang outputFileTracingIncludes untuk
   * @libsql/client (adapter DB lain, bukan yang dipakai repo ini) -- bukti
   * bahwa mekanisme ini memang jalan sanksi resmi untuk celah telusur
   * standalone, tapi tidak menutup celah untuk `jose`.
   *
   * Tanpa baris ini, container standalone gagal PERSIS di titik yang
   * paling gampang lolos dari pengujian curl biasa: bukan saat merender
   * /admin (itu cuma butuh importMap, sudah diverifikasi Task 20), tapi
   * saat benar-benar memverifikasi token JWT sesi login. jwt.js Payload
   * mengimpor `jose` secara statis, tapi @payloadcms/db-postgres
   * dieksternalkan (devBundleServerPackages:false), dan penelusur
   * standalone tidak mengikuti dependency package yang dieksternalkan
   * sedalam itu. Galatnya: "Cannot find package 'jose'", cuma muncul saat
   * ada percobaan verifikasi sesi sungguhan (login/create-first-user),
   * bukan saat GET biasa ke halaman mana pun -- ditemukan lewat verifikasi
   * upload-dan-publish Task 23 lewat browser sungguhan, bukan lewat gerbang
   * curl Task 20 yang tidak pernah menyentuh jalur ini.
   */
  outputFileTracingIncludes: {
    "**/*": ["./node_modules/jose/**"],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
