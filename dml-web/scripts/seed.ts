import { getPayload } from "payload";
import config from "../src/payload/payload.config";
import { slugify } from "../src/payload/collections/Posts";
import { COMPANY_PROFILE_SEED, SITE_NAVIGATION_SEED } from "../src/lib/cms/company-seed";
import { CLIENTS_SEED } from "../src/lib/cms/clients-seed";
import { CERTIFICATIONS_SEED } from "../src/lib/cms/certifications-seed";
import { BUSINESS_LINES_SEED } from "../src/lib/cms/business-lines-seed";
import { VESSELS_SEED } from "../src/lib/cms/vessels-seed";
import { FLEET_CLASSES_SEED } from "../src/lib/cms/fleet-classes-seed";
import { LEGAL_DOCUMENTS_SEED } from "../src/lib/cms/legal-documents-seed";

/**
 * `bun run seed` (lihat package.json) menjalankan berkas ini lewat `bun
 * build` lebih dulu, BUKAN `bun scripts/seed.ts` langsung. Itu bukan
 * langkah opsional untuk kecepatan.
 *
 * Menjalankan berkas ini langsung lewat runtime ESM Bun memicu race
 * condition nyata di rantai impor sirkular @lexical/react <-> lexical
 * (dipicu payload.config.ts memuat lexicalEditor()): kelas
 * DecoratorBlockNode kadang dievaluasi sebelum DecoratorNode yang
 * diwarisinya selesai diinisialisasi, melempar "Cannot access
 * 'DecoratorNode' before initialization". Diverifikasi flaky, bukan
 * deterministik: delapan run langsung gagal sekitar satu dari lima kali.
 * Membangun berkas ini jadi satu bundel lebih dulu membuat resolusi modul
 * statis di waktu build, bukan dinamis di runtime, dan menghilangkan race
 * itu sepenuhnya (diverifikasi delapan run berturut-turut sukses).
 *
 * Bundel harus ditulis di dalam direktori proyek (.seed-bundle.js,
 * digitignore), BUKAN ke /tmp: pemeriksaan checkDependencies() bawaan
 * Payload berjalan salah kalau bundelnya berada di luar pohon proyek,
 * karena resolusi node_modules yang dipakainya bergantung lokasi berkas.
 *
 * Seed idempoten. Dijalankan berkali-kali menghasilkan keadaan yang sama:
 * ia mencari lebih dulu dan hanya membuat yang belum ada. Ia TIDAK PERNAH
 * menimpa dokumen yang sudah ada, supaya artikel yang sudah disunting klien
 * tidak dikembalikan ke teks awal oleh seed yang tidak sengaja dijalankan
 * ulang saat deploy.
 *
 * ISI ARTIKEL DI BAWAH ADALAH SUSUNAN AGEN, BUKAN TULISAN KLIEN.
 * Seluruh faktanya berasal dari materi yang sudah terverifikasi di
 * src/content/ dan di assets/CP DML.pdf; yang disusun cuma kalimat
 * penghubungnya. Teks ini menunggu review klien, dan klien bisa
 * mencabutnya dengan menghapus artikelnya dari /admin. Hook revalidasi
 * akan membersihkan jejaknya dari /artikel, beranda, dan sitemap tanpa
 * deploy ulang. Jangan menanam teks ini sebagai konstanta di dalam src/.
 */

function teks(value: string) {
  return {
    type: "text" as const,
    text: value,
    version: 1,
    detail: 0,
    format: 0,
    mode: "normal" as const,
    style: "",
  };
}

function paragraf(value: string) {
  return {
    type: "paragraph" as const,
    version: 1,
    format: "" as const,
    indent: 0,
    direction: "ltr" as const,
    textFormat: 0,
    children: [teks(value)],
  };
}

function isi(blocks: Array<ReturnType<typeof paragraf>>) {
  return {
    root: {
      type: "root" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: blocks,
    },
  };
}

/**
 * Tiga blok isi artikel, mengikuti skema `content` (type: "blocks") di
 * Posts.ts: paragraph menyimpan richText di field `text`, heading dan quote
 * menyimpan string biasa. `blockType` wajib persis salah satu slug blok yang
 * didaftarkan di sana.
 */
function blokParagraf(value: string) {
  return { blockType: "paragraph" as const, text: isi([paragraf(value)]) };
}

function blokJudul(value: string) {
  return { blockType: "heading" as const, text: value };
}

type Blok = ReturnType<typeof blokParagraf> | ReturnType<typeof blokJudul>;

/**
 * Slug di sini SENGAJA sama dengan nilai enum lama (operasi/armada/
 * keselamatan/perusahaan) supaya makna URL dan penyaringan kategori tidak
 * berubah setelah category pindah dari select enum ke relasi koleksi.
 */
const KATEGORI: Array<{ name: string; slug: string }> = [
  { name: "Operasi", slug: "operasi" },
  { name: "Armada", slug: "armada" },
  { name: "Keselamatan", slug: "keselamatan" },
  { name: "Perusahaan", slug: "perusahaan" },
];

const ARTIKEL: Array<{
  slug: string;
  title: string;
  categorySlug: string;
  excerpt: string;
  publishedAt: string;
  cover: { file: string; alt: string };
  content: Blok[];
}> = [
  {
    slug: "operasi-ship-to-ship-di-titik-tanpa-jetty",
    title: "Operasi ship-to-ship di titik yang tidak punya jetty",
    categorySlug: "operasi",
    excerpt:
      "Memindahkan bahan bakar langsung antar kapal di tengah perairan, dari muat di terminal sampai dokumen serah selesai.",
    publishedAt: "2026-08-20T00:00:00.000Z",
    cover: {
      file: "public/media/lini-bisnis/operasi-sts-2400.webp",
      alt: "Dua kapal bersandar untuk transfer bahan bakar di tengah perairan",
    },
    // Fakta: src/features/home/day-cut.tsx dan STS_STEPS di
    // src/app/(site)/bisnis/transportasi-bbm/page.tsx, keduanya bersumber PDF.
    content: [
      blokParagraf(
        "Tidak semua titik serah punya jetty. Sebagian pelabuhan kecil dan titik distribusi di perairan Indonesia tidak bisa disandari kapal pengangkut berukuran besar, dan menunggu antrean sandar di pelabuhan yang lebih besar berarti pasokan sampai terlambat.",
      ),
      blokParagraf(
        "Ship-to-ship transfer menjawab keduanya. Bahan bakar dipindahkan langsung antar kapal di tengah perairan, sehingga titik yang tidak terjangkau jetty konvensional tetap terlayani tanpa bergantung pada giliran sandar.",
      ),
      blokJudul("Empat langkah, dari terminal sampai serah"),
      blokParagraf(
        "Motor tanker atau SPOB memuat bahan bakar cair di terminal, dengan dokumen muatan dan pemeriksaan yang mengikuti prosedur ISM Code.",
      ),
      blokParagraf(
        "Kapal lalu berlayar ke titik serah, termasuk titik yang tidak terjangkau jetty. Di sinilah armada berukuran berbeda punya gunanya masing-masing.",
      ),
      blokParagraf(
        "Di titik serah, dua kapal disandarkan dengan fender dan tali tambat, lalu diikat dalam posisi yang menahan gerak relatif keduanya sepanjang transfer.",
      ),
      blokParagraf(
        "Selang transfer dipasang, muatan dipindahkan, dan dokumen serah diselesaikan sebelum kedua kapal dilepas.",
      ),
    ],
  },
  {
    slug: "ism-code-dan-iso-9001-di-operasi-harian",
    title: "ISM Code dan ISO 9001:2015 di operasi harian",
    categorySlug: "keselamatan",
    excerpt:
      "Dua standar yang mengatur cara kerja armada, dan apa artinya bagi pihak yang menyerahkan muatannya kepada kami.",
    publishedAt: "2026-08-18T00:00:00.000Z",
    cover: {
      file: "public/media/bisnis/hub-bisnis-2400.webp",
      alt: "Armada kapal PT Dutabahari Menara Line di perairan",
    },
    // Fakta: src/content/certifications.ts dan COMPANY.standards, keduanya cp-pdf.
    content: [
      blokParagraf(
        "Pengangkutan bahan bakar cair adalah pekerjaan yang kesalahannya mahal, dan mahalnya tidak selalu berupa uang. Karena itu cara kerjanya diatur standar, bukan diserahkan pada kebiasaan tiap kapal.",
      ),
      blokJudul("ISM Code"),
      blokParagraf(
        "International Safety Management Code mengatur sistem manajemen keselamatan di atas kapal: siapa bertanggung jawab atas apa, bagaimana prosedur ditulis dan diperbarui, dan bagaimana kejadian dilaporkan serta ditindaklanjuti. Ia bukan sertifikat yang digantung lalu dilupakan, melainkan sistem yang harus terlihat jejaknya di operasi harian.",
      ),
      blokJudul("ISO 9001:2015"),
      blokParagraf(
        "ISO 9001:2015 mengatur sistem manajemen mutu. Di konteks pelayaran, ia menyentuh hal yang sering luput dari perhatian: konsistensi dokumen, ketertelusuran keputusan, dan cara keluhan pelanggan diproses sampai tuntas.",
      ),
      blokParagraf(
        "Keduanya bertemu di titik yang sama, yaitu prosedur yang sama dijalankan cara yang sama, siapa pun yang bertugas.",
      ),
    ],
  },
  {
    slug: "berdiri-1988-di-banjarmasin",
    title: "Berdiri 1988 di Banjarmasin",
    categorySlug: "perusahaan",
    excerpt:
      "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin pada 30 November 1988.",
    publishedAt: "2026-08-15T00:00:00.000Z",
    cover: {
      file: "public/media/hari/dji-0030-2400.webp",
      alt: "Kapal PT Dutabahari Menara Line dilihat dari udara",
    },
    // Fakta: src/content/timeline.ts dan src/content/company.ts, cp-pdf hal. 01 dan 02.
    content: [
      blokParagraf(
        "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin pada 30 November 1988. Kota itu sampai hari ini tetap jadi kantor pusatnya.",
      ),
      blokParagraf(
        "Perusahaan ini bagian dari Sinar Alam Corporation, dan menjalankan dua lini yang dioperasikannya sendiri: transportasi bahan bakar cair, serta penyeberangan penumpang dan kendaraan dengan kapal ro-ro.",
      ),
      blokParagraf(
        "Di luar dua lini itu, sejumlah perusahaan afiliasi menangani pekerjaan yang bersinggungan, termasuk perawatan armada dan pengoperasian lintasan penyeberangan tertentu.",
      ),
    ],
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi. Lihat .env.example.",
    );
  }

  const payload = await getPayload({ config });

  const users = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  const admin =
    users.docs[0] ??
    (await payload.create({
      collection: "users",
      data: { email, password, name: "Redaksi DML" },
    }));
  console.log(`admin: ${admin.id}`);

  const categoryIdBySlug: Record<string, number> = {};
  for (const kategori of KATEGORI) {
    const ada = await payload.find({
      collection: "categories",
      where: { slug: { equals: kategori.slug } },
      limit: 1,
    });
    const doc =
      ada.docs[0] ??
      (await payload.create({ collection: "categories", data: kategori }));
    categoryIdBySlug[kategori.slug] = doc.id;
    console.log(ada.docs[0] ? `kategori (sudah ada): ${kategori.slug}` : `kategori dibuat: ${kategori.slug}`);
  }

  // findGlobal pada global yang belum pernah disimpan mengembalikan nilai
  // default field tanpa createdAt/updatedAt terisi. Itu dipakai sebagai
  // penanda "belum ada baris sungguhan", supaya seed tidak menimpa
  // articles-page yang sudah disunting redaksi lewat /admin.
  const articlesPage = await payload.findGlobal({ slug: "articles-page" });
  if (!articlesPage.createdAt) {
    await payload.updateGlobal({
      slug: "articles-page",
      data: {
        heading: "Artikel",
        intro: "Kabar operasi, armada, dan keselamatan dari lapangan.",
        pageSize: 6,
        shareChannels: ["whatsapp", "linkedin", "x", "email", "copy"],
      },
    });
    console.log("articles-page: dibuat");
  } else {
    console.log("articles-page: sudah ada");
  }

  const companyProfile = await payload.findGlobal({ slug: "company-profile" });
  if (!companyProfile.createdAt) {
    await payload.updateGlobal({ slug: "company-profile", data: COMPANY_PROFILE_SEED });
    console.log("company-profile: dibuat");
  } else {
    console.log("company-profile: sudah ada");
  }

  const siteNavigation = await payload.findGlobal({ slug: "site-navigation" });
  if (!siteNavigation.createdAt) {
    await payload.updateGlobal({ slug: "site-navigation", data: SITE_NAVIGATION_SEED });
    console.log("site-navigation: dibuat");
  } else {
    console.log("site-navigation: sudah ada");
  }

  for (const client of CLIENTS_SEED) {
    const ada = await payload.find({
      collection: "clients",
      where: { name: { equals: client.name } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`klien (sudah ada): ${client.name}`);
      continue;
    }
    const logo = client.logoFile
      ? await payload.create({
          collection: "media",
          data: { alt: `Logo ${client.name}` },
          filePath: `public/assets/clients/${client.logoFile}`,
        })
      : null;
    await payload.create({
      collection: "clients",
      data: {
        name: client.name,
        sector: client.sector,
        logo: logo?.id,
        source: client.source,
        order: client.order,
      },
    });
    console.log(`klien dibuat: ${client.name}`);
  }

  for (const cert of CERTIFICATIONS_SEED) {
    const ada = await payload.find({
      collection: "certifications",
      where: { name: { equals: cert.name } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`sertifikasi (sudah ada): ${cert.name}`);
      continue;
    }
    const badge = await payload.create({
      collection: "media",
      data: { alt: cert.alt },
      filePath: `public/assets/cert/${cert.badgeFile}`,
    });
    await payload.create({
      collection: "certifications",
      data: {
        name: cert.name,
        badge: badge.id,
        alt: cert.alt,
        source: cert.source,
        order: cert.order,
      },
    });
    console.log(`sertifikasi dibuat: ${cert.name}`);
  }

  for (const line of BUSINESS_LINES_SEED) {
    const ada = await payload.find({
      collection: "business-lines",
      where: { slug: { equals: line.slug } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`lini bisnis (sudah ada): ${line.slug}`);
      continue;
    }
    await payload.create({
      collection: "business-lines",
      data: { ...line, metric: line.metric ?? undefined },
    });
    console.log(`lini bisnis dibuat: ${line.slug}`);
  }

  for (const fleetClass of FLEET_CLASSES_SEED) {
    const ada = await payload.find({
      collection: "fleet-classes",
      where: { slug: { equals: fleetClass.slug } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`kelas armada (sudah ada): ${fleetClass.slug}`);
      continue;
    }
    await payload.create({
      collection: "fleet-classes",
      data: {
        ...fleetClass,
        dwt: fleetClass.dwt ?? undefined,
        passengerCapacity: fleetClass.passengerCapacity ?? undefined,
      },
    });
    console.log(`kelas armada dibuat: ${fleetClass.slug}`);
  }

  for (const doc of LEGAL_DOCUMENTS_SEED) {
    const ada = await payload.find({
      collection: "legal-documents",
      where: { document: { equals: doc.document } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`dokumen legal (sudah ada): ${doc.document}`);
      continue;
    }
    await payload.create({ collection: "legal-documents", data: doc });
    console.log(`dokumen legal dibuat: ${doc.document}`);
  }

  const adaVessel = await payload.find({ collection: "vessels", limit: 1 });
  if (adaVessel.docs.length > 0) {
    console.log(`kapal (sudah ada): ${adaVessel.totalDocs} baris`);
  } else {
    for (const vessel of VESSELS_SEED) {
      await payload.create({ collection: "vessels", data: vessel });
    }
    console.log(`kapal dibuat: ${VESSELS_SEED.length} baris`);
  }

  for (const artikel of ARTIKEL) {
    const ada = await payload.find({
      collection: "posts",
      where: { slug: { equals: artikel.slug } },
      limit: 1,
    });
    if (ada.docs.length > 0) {
      console.log(`lewati (sudah ada): ${artikel.slug}`);
      continue;
    }

    const categoryId = categoryIdBySlug[artikel.categorySlug];
    if (!categoryId) {
      throw new Error(`Kategori "${artikel.categorySlug}" belum dibuat, cek daftar KATEGORI.`);
    }

    const media = await payload.create({
      collection: "media",
      data: { alt: artikel.cover.alt },
      filePath: artikel.cover.file,
    });

    await payload.create({
      collection: "posts",
      data: {
        title: artikel.title,
        slug: slugify(artikel.slug),
        excerpt: artikel.excerpt,
        category: categoryId,
        publishedAt: artikel.publishedAt,
        coverImage: media.id,
        author: admin.id,
        content: artikel.content,
        _status: "published",
      },
    });
    console.log(`buat: ${artikel.slug}`);
  }

  console.log("seed selesai");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
