# Plan 9 — Artikel, OG image, pengerasan, dan deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup seluruh bagian situs yang belum pernah dibangun dan tidak menunggu data klien: cabang artikel beserta CMS-nya, OG image dan dua JSON-LD yang diminta master spec tapi tak pernah dikerjakan, error boundary, dan seluruh jalur deployment yang selama ini nol.

**Architecture:** Empat fase berurutan. Fase A menambah satu koleksi Payload (`posts`) beserta dua route publik, hook revalidasi, seksi beranda, dan script seed yang sekaligus jadi fixture autentikasi Playwright. Fase B mengisi lubang SEO dengan satu PNG OG korporat yang dikomit plus route `next/og` untuk artikel. Fase C membangun error boundary dan memaku lokasi upload Payload. Fase D membungkus semuanya jadi image Docker `standalone` dengan volume upload persisten dan migrasi yang jalan saat container start. Tiap fase berakhir di keadaan hijau yang bisa di-commit, jadi eksekusi boleh berhenti di batas fase.

**Tech Stack:** Next.js 16.3.1 App Router, React 19.2, Tailwind v4, Payload CMS 3.88 (Postgres), `@payloadcms/richtext-lexical` 3.88, `next/og`, sharp, zod v4, GSAP, vitest, Playwright, Docker, bun.

**Spec:** `docs/superpowers/specs/2026-08-23-dml-plan-9-artikel-og-dan-deployment-design.md`

Plan ini mengerjakan seluruh spec itu. Tidak ada bagian yang ditunda ke plan berikutnya.

---

## Yang sengaja TIDAK dikerjakan plan ini

Bagian 3 spec mendaftar tujuh butir yang menunggu klien dan satu keputusan. Ringkasnya, supaya pengeksekusi tidak "berinisiatif" menutupnya:

- Fasilitas dan jadwal kapal ro-ro, logo sertifikasi asli, status HSSE, selisih 64 vs 66 kapal, nama lengkap `OB Sahoya 0`, dimensi kapal, persetujuan copy Visi dan Misi, logo klien "Trusted by". **Semua menunggu klien. Jangan mengarang isinya.**
- **`JobPosting` JSON-LD tidak dikembalikan.** Plan 8 menghapusnya sebagai kode mati dan itu benar. Ia lahir bersama lowongan pertama, bukan sebelumnya.
- **Adapter S3 tidak diimplementasikan**, hanya didokumentasikan (Task 23).
- **Merge `denis` ke `master`** tidak dilakukan plan ini.

---

## Global Constraints

Setiap task tunduk pada seluruh butir di bawah. Tidak diulang per task.

- **Bahasa.** Seluruh copy yang tampil ke pengunjung, alt text, komentar kode, dan pesan commit ditulis dalam bahasa Indonesia.
- **bun saja.** `package.json` menetapkan `packageManager: bun@1.3.14`. Jangan pernah menjalankan `npm install` atau `yarn`.
- **Cwd.** Seluruh perintah dijalankan dari `dml-web/`, kecuali perintah `git` yang dijalankan dari akar repo `company-profile/`.
- **Commit tiap task.** Satu task, satu commit. Jangan menumpuk.
- **Sumber data.** Setiap fakta perusahaan baru wajib membawa komentar sumber dan `SourceTag` (`"cp-pdf" | "riset-publik" | "belum-terverifikasi"`, `src/content/types.ts:12`). Apa pun yang tidak ada di `assets/CP DML.pdf` **tidak dibuat**. Ini berlaku penuh pada artikel seed di Task 9.
- **`<Image>` dari `next/image`, bukan `<img>` mentah.** `eslint-config-next` mengaktifkan `@next/next/no-img-element`, jadi `<img>` mentah menggagalkan `bun run lint`. Satu pengecualian tunggal: berkas `opengraph-image.tsx` di Task 14, karena `ImageResponse` merender lewat Satori dan tidak mengenal komponen `next/image`. Pengecualian itu diberi komentar `eslint-disable` beralasan, bukan dibiarkan lolos diam-diam.
- **`transition-all` dilarang.** Repo saat ini nol. Selalu sebut properti yang ditransisikan, misalnya `transition-colors`.
- **Larangan visual** (master spec 7.11): tanpa marquee, custom cursor, scroll cue, eyebrow bernomor seksi, dot status dekoratif, strip lokasi atau cuaca, fake screenshot dari div, em dash di copy, pill yang ditumpuk di atas foto, caption kredit foto palsu, label versi.
- **Aksesibilitas wajib:** pembungkus tabel yang menggulir memakai `tabIndex={0}` + `role="region"` + `aria-label`; setiap input membawa `autoComplete` yang benar; setiap heading memakai `text-pretty` (otomatis lewat `SectionHeader`); tidak ada elemen interaktif yang tak terjangkau keyboard selama animasi.
- **Setiap halaman baru wajib** memanggil `buildMetadata` dari `@/lib/seo/metadata` dan menyisipkan `breadcrumbJsonLd` lewat `safeJsonLdString` dari `@/lib/seo/json-ld`.
- **Postgres wajib hidup sebelum `bun run test:e2e` dan, sejak Task 7, juga sebelum `bun run build`:**
  ```bash
  docker compose up -d
  until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
  ```
- **Angka Lighthouse dari mesin ini tidak dipercaya sebagai bukti regresi.** Plan 4 mencatat run yang lolos sekali dan gagal tiga kali di rentang 5800 sampai 5930 ms karena kontensi CPU desktop. Ambang 5000 ms di `lighthouserc.json` **tidak boleh disentuh**.
- **`bun run doctor` menyisakan tepat satu temuan**, yaitu pengecualian permanen `effect-needs-cleanup` di `use-hero-choreography.ts` yang terdokumentasi sejak Plan 6. Karena `react-doctor` keluar non-nol selama masih ada temuan, rantai `&&` di `bun run check` berhenti di sana dan `bun run lighthouse` harus dijalankan sebagai perintah terpisah. Ini keadaan yang diketahui, bukan kegagalan.
- **Jangan menyentuh `push: false`** di `payload.config.ts`. Docblock di sana menjelaskan kenapa dev-mode schema push menghasilkan baris `batch:-1` yang membuat `migrate()` menggantung selamanya di proses non-TTY.

---

## File Structure

**Dibuat:**

| Berkas | Tanggung jawab |
|---|---|
| `src/payload/collections/Posts.ts` | Koleksi artikel: field, access, hook slug, hook revalidasi |
| `src/payload/collections/Posts.test.ts` | Tes bentuk config: access read menyaring draft, drafts aktif, slug unik |
| `src/migrations/20260823_*_tambah_posts.ts` | Migrasi `posts` beserta tabel versi, plus `users.name` |
| `src/features/articles/queries.ts` | Satu-satunya pintu query artikel. Menyaring `_status` eksplisit |
| `src/features/articles/queries.test.ts` | Tes bahwa query publik selalu menyaring published |
| `src/features/articles/article-list.tsx` | Daftar artikel editorial, artikel pertama berbobot besar |
| `src/features/articles/article-list.test.tsx` | Tes render daftar, termasuk empty state |
| `src/features/articles/latest-articles.tsx` | Seksi Artikel Terbaru di beranda, hilang saat kosong |
| `src/features/articles/latest-articles.test.tsx` | Tes seksi beranda |
| `src/features/articles/format-date.ts` | Format tanggal Indonesia, dipakai daftar dan detail |
| `src/features/articles/format-date.test.ts` | Tes format tanggal |
| `src/app/(site)/artikel/page.tsx` | Route daftar artikel |
| `src/app/(site)/artikel/[slug]/page.tsx` | Route detail artikel |
| `src/app/(site)/artikel/[slug]/opengraph-image.tsx` | OG image artikel lewat `next/og` |
| `src/app/(site)/error.tsx` | Error boundary halaman publik |
| `src/app/global-error.tsx` | Error boundary root layout |
| `scripts/seed.ts` | Seed idempoten: admin pertama plus artikel awal |
| `scripts/prepare-og-korporat.ts` | Membangkitkan satu PNG OG 1200x630, dikomit |
| `public/assets/og/korporat.png` | Hasil script di atas |
| `tests/e2e/global-setup.ts` | Menjalankan seed sebelum spec mana pun |
| `tests/e2e/artikel.spec.ts` | E2E artikel: daftar, detail, no-JS, draft tidak bocor |
| `tests/e2e/admin-publish.spec.ts` | Login, buat artikel, publish, muncul tanpa rebuild |
| `tests/e2e/error-boundary.spec.ts` | Boundary benar-benar menangkap |
| `Dockerfile` | Build multi-stage bun, runner `standalone` |
| `.dockerignore` | Mencegah `node_modules` dan `.next` lokal ikut terkirim |
| `docker-entrypoint.sh` | `payload migrate` lalu serahkan ke server |
| `docker-compose.prod.yml` | Aplikasi, Postgres, dua named volume |

**Dimodifikasi:**

| Berkas | Perubahan |
|---|---|
| `src/payload/collections/Users.ts` | Tambah field `name`, `useAsTitle` pindah ke `name` |
| `src/payload/collections/Media.ts` | `staticDir` eksplisit |
| `src/payload/payload.config.ts` | Daftarkan `Posts` |
| `src/migrations/index.ts` | Daftarkan migrasi baru |
| `src/app/sitemap.ts` | Jadi async, kembalikan `/artikel` plus slug published |
| `src/app/sitemap.test.ts` | Ditulis ulang untuk bentuk async |
| `src/app/(site)/layout.tsx` | `metadataBase`, JSON-LD `LocalBusiness` |
| `src/app/(site)/page.tsx` | Sisipkan `LatestArticles` |
| `src/lib/seo/metadata.ts` | `metadataBase` dan `openGraph.images` |
| `src/lib/seo/json-ld.ts` | Tambah `articleJsonLd`, `serviceJsonLd`, `localBusinessJsonLd` |
| `src/lib/seo/json-ld.test.ts` | Tes ketiga builder baru |
| `src/app/(site)/bisnis/transportasi-bbm/page.tsx` | Sisipkan `serviceJsonLd` |
| `src/app/(site)/bisnis/penumpang-roro/page.tsx` | Sisipkan `serviceJsonLd` |
| `src/features/home/hero-copy.tsx` | Arahkan CTA BBM ke halaman yang kini ada, hapus TODO usang |
| `src/features/home/cta-section.tsx` | Hapus TODO usang |
| `src/features/home/hero.test.tsx` | Sesuaikan asersi href CTA BBM |
| `tests/e2e/a11y-viewport.spec.ts` | Tambah dua route artikel |
| `playwright.config.ts` | Daftarkan `globalSetup` |
| `next.config.ts` | `output: 'standalone'` |
| `package.json` | Script `seed`, `prepare:og` |
| `.env.example` | `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` |
| `README.md` | Build butuh Postgres, seed, runbook deployment |

---

## Fase A — Artikel

### Task 1: `Users` mendapat field `name`

`Users.fields` hari ini array kosong. Begitu `posts.author` merelasikannya, byline artikel akan menampilkan alamat email penulis ke seluruh pengunjung.

**Files:**
- Modify: `src/payload/collections/Users.ts`
- Test: `src/payload/collections/Users.test.ts` (create)

**Interfaces:**
- Produces: koleksi `users` punya field `name` bertipe text, `required: true`. Task 2 merelasikannya dari `posts.author`. Task 9 mengisinya saat membuat admin pertama.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/payload/collections/Users.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { Users } from "./Users";

describe("Users", () => {
  it("punya field name yang wajib diisi", () => {
    const name = Users.fields.find(
      (field) => "name" in field && field.name === "name",
    );
    expect(name).toBeDefined();
    expect(name).toMatchObject({ type: "text", required: true });
  });

  it("memakai name sebagai judul, bukan email", () => {
    // Sebelum Plan 9 nilainya "email", yang membuat daftar user dan dropdown
    // relasi penulis di admin menampilkan alamat email sebagai judul baris.
    expect(Users.admin?.useAsTitle).toBe("name");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/payload/collections/Users.test.ts`
Expected: FAIL. Tes pertama gagal karena `Users.fields` kosong sehingga `name` `undefined`; tes kedua gagal karena `useAsTitle` masih `"email"`.

- [ ] **Step 3: Implementasi**

Ganti isi `src/payload/collections/Users.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  /**
   * useAsTitle memakai `name`, bukan `email`. Sejak Plan 9 koleksi ini jadi
   * target relasi `posts.author`, dan judul baris koleksi ikut jadi label
   * dropdown relasi di admin. Dengan `email`, editor memilih penulis dari
   * daftar alamat email, dan alamat itu juga yang berpotensi terbawa ke
   * byline artikel yang tayang publik.
   */
  admin: { useAsTitle: "name" },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Nama yang tampil sebagai penulis artikel." },
    },
  ],
};
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/payload/collections/Users.test.ts`
Expected: PASS, 2 tes.

- [ ] **Step 5: Gerbang cepat**

Run: `bun run lint && bun run typecheck`
Expected: keduanya bersih.

Migrasinya **tidak** dibuat di task ini. Ia digabung ke migrasi Task 2 supaya `posts` dan kolom `users.name` mendarat dalam satu transaksi, dan supaya tidak ada keadaan antara di mana `posts.author` menunjuk kolom yang belum ada.

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/payload/collections/Users.ts dml-web/src/payload/collections/Users.test.ts
git commit -m "feat: field name pada koleksi users

Tanpa ini posts.author akan menampilkan alamat email penulis sebagai
byline artikel yang tayang publik, dan sebagai label dropdown relasi di
admin. useAsTitle ikut pindah dari email ke name.

Migrasinya digabung ke migrasi posts supaya kolom ini dan tabel yang
merelasikannya mendarat sekali jalan."
```

---

### Task 2: Koleksi `posts`, migrasi, dan tipe

Task terbesar di fase A. Ia membuat koleksi, mendaftarkannya, membangkitkan migrasi beserta tabel versi, lalu meregenerasi tipe.

**Files:**
- Create: `src/payload/collections/Posts.ts`
- Create: `src/payload/collections/Posts.test.ts`
- Modify: `src/payload/payload.config.ts`
- Modify: `src/migrations/index.ts`
- Create: `src/migrations/20260823_*_tambah_posts.ts` dan `.json` (dibangkitkan)
- Modify: `src/payload/payload-types.ts` (dibangkitkan)

**Interfaces:**
- Consumes: field `name` pada `users` dari Task 1.
- Produces: koleksi slug `"posts"` dengan field `title`, `slug`, `excerpt`, `coverImage`, `content`, `category`, `publishedAt`, `author`, `seo.metaTitle`, `seo.metaDescription`, plus `_status` dari `versions.drafts`. Tipe `Post` diekspor `src/payload/payload-types.ts`. Task 3 seterusnya memakainya.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/payload/collections/Posts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { Posts } from "./Posts";

function fieldNamed(name: string) {
  return Posts.fields.find((field) => "name" in field && field.name === name);
}

describe("Posts", () => {
  it("mengaktifkan draft lewat versions, bukan lewat field _status", () => {
    // _status bukan field yang ditulis tangan. Ia lahir dari versions.drafts,
    // dan perbedaan itu menentukan bentuk migrasinya: drafts membangkitkan
    // tabel versi terpisah (_posts_v beserta anaknya).
    expect(Posts.versions).toMatchObject({ drafts: true });
    expect(fieldNamed("_status")).toBeUndefined();
  });

  it("slug unik dan terindeks", () => {
    expect(fieldNamed("slug")).toMatchObject({
      type: "text",
      unique: true,
      index: true,
    });
  });

  it("coverImage wajib dan menunjuk koleksi media", () => {
    expect(fieldNamed("coverImage")).toMatchObject({
      type: "upload",
      relationTo: "media",
      required: true,
    });
  });

  it("author menunjuk koleksi users", () => {
    expect(fieldNamed("author")).toMatchObject({
      type: "relationship",
      relationTo: "users",
    });
  });

  it("excerpt dibatasi 200 karakter", () => {
    expect(fieldNamed("excerpt")).toMatchObject({ type: "textarea", maxLength: 200 });
  });

  it("pembaca anonim hanya melihat dokumen published", () => {
    // Bukan false. Bentuk where-constraint inilah yang membuat draft tidak
    // pernah bocor sambil tetap terbaca admin yang login.
    const read = Posts.access?.read;
    expect(read).toBeTypeOf("function");
    const anon = read!({ req: { user: null } } as never);
    expect(anon).toEqual({ _status: { equals: "published" } });
  });

  it("pembaca terautentikasi melihat semuanya", () => {
    const read = Posts.access?.read;
    expect(read!({ req: { user: { id: 1 } } } as never)).toBe(true);
  });

  it("tulis hanya untuk user terautentikasi", () => {
    for (const gate of ["create", "update", "delete"] as const) {
      const fn = Posts.access?.[gate];
      expect(fn).toBeTypeOf("function");
      expect(fn!({ req: { user: null } } as never)).toBe(false);
      expect(fn!({ req: { user: { id: 1 } } } as never)).toBe(true);
    }
  });

  it("mengisi slug dari title kalau slug kosong", () => {
    const hook = Posts.hooks?.beforeValidate?.[0];
    expect(hook).toBeTypeOf("function");
    const result = hook!({
      data: { title: "Operasi Ship to Ship di Perairan Dangkal" },
    } as never) as { slug?: string };
    expect(result.slug).toBe("operasi-ship-to-ship-di-perairan-dangkal");
  });

  it("tidak menimpa slug yang sudah diisi tangan", () => {
    const hook = Posts.hooks?.beforeValidate?.[0];
    const result = hook!({
      data: { title: "Judul Baru", slug: "slug-lama" },
    } as never) as { slug?: string };
    expect(result.slug).toBe("slug-lama");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/payload/collections/Posts.test.ts`
Expected: FAIL dengan error resolusi modul, `Posts.ts` belum ada.

- [ ] **Step 3: Implementasi koleksi**

Buat `src/payload/collections/Posts.ts`:

```ts
import type { CollectionConfig } from "payload";

/**
 * Turunkan slug dari judul. Diekspor supaya bisa diuji langsung dan supaya
 * scripts/seed.ts memakai aturan yang persis sama dengan yang dipakai admin.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
  },
  /**
   * drafts:true, bukan field bernama _status. Payload membangkitkan kolom
   * _status sendiri beserta tabel versi terpisah (_posts_v dan anaknya).
   * Konsekuensinya ada di migrasi: migrasi koleksi ini jauh lebih besar
   * daripada migrasi inquiries, dan keluarannya wajib dibaca sebelum
   * dikomit, bukan dianggap seragam dengan migrasi sebelumnya.
   */
  versions: { drafts: true },
  access: {
    /**
     * Publik hanya melihat published. Bentuknya where-constraint, bukan
     * false, supaya admin yang login tetap bisa membaca draft lewat REST
     * dan lewat admin panel.
     *
     * PERINGATAN yang tidak boleh dihapus: Local API `payload.find()`
     * memakai `overrideAccess: true` secara default, persis seperti
     * `payload.create()` yang sudah didokumentasikan di Inquiries.ts sejak
     * Plan 8. Artinya gerbang ini TIDAK melindungi Server Component yang
     * memanggil payload.find() langsung. Halaman publik wajib menyaring
     * _status sendiri di query-nya; itulah alasan seluruh query artikel
     * dipusatkan di src/features/articles/queries.ts, bukan disebar.
     * Kalau aturan itu dilanggar, draft tayang ke publik dengan build
     * hijau dan seluruh tes unit hijau.
     */
    read: ({ req: { user } }) =>
      Boolean(user) || { _status: { equals: "published" } },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (!data.slug && typeof data.title === "string") {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Terisi otomatis dari judul. Mengubahnya setelah artikel terbit membuat alamat lama mati.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: { description: "Dipakai sebagai meta description dan ringkasan di kartu." },
    },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    { name: "content", type: "richText", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Operasi", value: "operasi" },
        { label: "Armada", value: "armada" },
        { label: "Keselamatan", value: "keselamatan" },
        { label: "Perusahaan", value: "perusahaan" },
      ],
    },
    { name: "publishedAt", type: "date", required: true },
    { name: "author", type: "relationship", relationTo: "users", required: true },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          admin: { description: "Opsional. Kosong berarti memakai judul artikel." },
        },
        {
          name: "metaDescription",
          type: "textarea",
          admin: { description: "Opsional. Kosong berarti memakai excerpt." },
        },
      ],
    },
  ],
  timestamps: true,
};
```

Hook revalidasi **belum** dipasang di sini. Ia ditambahkan Task 6, setelah kedua route yang direvalidasi benar-benar ada. Memasangnya sekarang berarti memanggil `revalidatePath` pada alamat yang belum pernah dirender.

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/payload/collections/Posts.test.ts`
Expected: PASS, 10 tes.

- [ ] **Step 5: Daftarkan koleksi**

Di `src/payload/payload.config.ts`, tambah impor dan masukkan ke array:

```ts
import { Posts } from "./collections/Posts";
```
```ts
collections: [Users, Media, Inquiries, Posts],
```

- [ ] **Step 6: Nyalakan Postgres dan bangkitkan migrasi**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run payload migrate:create tambah_posts
```

- [ ] **Step 7: Baca migrasi yang dibangkitkan sebelum mempercayainya**

```bash
grep -c "CREATE TABLE" src/migrations/*tambah_posts.ts
grep -n "CREATE TABLE\|ALTER TABLE" src/migrations/*tambah_posts.ts
```

Yang wajib terlihat, dan kalau salah satunya tidak ada berarti ada yang salah dan eksekusi berhenti di sini:

1. `CREATE TABLE "posts"`.
2. **Tabel versi**, bernama `_posts_v` beserta tabel anaknya. Ini bukti `versions: { drafts: true }` benar-benar terbaca. Kalau tidak ada, koleksinya tidak mengaktifkan drafts dan seluruh alur publish akan gagal belakangan dengan cara yang membingungkan.
3. `ALTER TABLE "users" ADD COLUMN "name"` dari Task 1.

- [ ] **Step 8: Periksa kolom `users.name` terhadap baris yang sudah ada**

Ini langkah yang paling mudah dilewati dan paling mahal kalau dilewati. `name` bersifat `required`, dan menambahkan kolom NOT NULL ke tabel yang **sudah berisi baris** gagal kecuali ada default.

```bash
docker compose exec -T postgres psql -U dml -d dml -c "SELECT count(*) FROM users;"
```

- Kalau hasilnya `0`, database lokal kosong dan migrasi akan lolos di sini tanpa membuktikan apa pun. **Buat satu user lebih dulu**, lalu ulangi, supaya jalur yang sebenarnya terjadi di produksi ikut teruji:
  ```bash
  bun run payload migrate
  docker compose exec -T postgres psql -U dml -d dml -c "INSERT INTO users (email, hash, salt, updated_at, created_at) VALUES ('uji@example.com', 'x', 'x', now(), now());"
  ```
  Lalu `bun run payload migrate:down` dan `bun run payload migrate` ulang.
- Kalau migrasi gagal dengan galat NOT NULL, sunting berkas migrasi supaya kolomnya ditambahkan dengan default sementara, diisi, baru ditegakkan:
  ```sql
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  UPDATE "users" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL;
  ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
  ```

- [ ] **Step 9: Jalankan migrasi dan daftarkan**

```bash
bun run payload migrate
```

Lalu tambahkan entri baru ke `src/migrations/index.ts` mengikuti bentuk tiga entri yang sudah ada persis:

```ts
import * as migration_20260823_XXXXXX_tambah_posts from './20260823_XXXXXX_tambah_posts';
```
```ts
  {
    up: migration_20260823_XXXXXX_tambah_posts.up,
    down: migration_20260823_XXXXXX_tambah_posts.down,
    name: '20260823_XXXXXX_tambah_posts',
  },
```

Ganti `XXXXXX` dengan stempel waktu yang benar-benar dibangkitkan. `prodMigrations` mengimpornya statis; migrasi yang tidak terdaftar tidak pernah jalan di produksi, dan diamnya total.

- [ ] **Step 10: Regenerasi tipe**

```bash
bun run generate:types
```
Expected: `src/payload/payload-types.ts` kini mengekspor `interface Post`.

Verifikasi: `grep -n "export interface Post\b" src/payload/payload-types.ts`

- [ ] **Step 11: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`
Expected: seluruhnya bersih.

- [ ] **Step 12: Commit**

```bash
git add dml-web/src/payload/collections/Posts.ts dml-web/src/payload/collections/Posts.test.ts \
        dml-web/src/payload/payload.config.ts dml-web/src/payload/payload-types.ts \
        dml-web/src/migrations/
git commit -m "feat: koleksi posts dengan draft, slug otomatis, dan akses terkunci

versions.drafts, bukan field _status tulis tangan, jadi migrasinya ikut
membawa tabel versi _posts_v. Migrasi yang sama menambahkan users.name
supaya posts.author tidak pernah menunjuk kolom yang belum ada.

access.read mengembalikan where-constraint, bukan false, supaya draft
tidak bocor ke publik tapi tetap terbaca admin. Peringatan bahwa Local
API payload.find() default overrideAccess:true ditulis sebagai komentar
di koleksinya, karena gerbang itu tidak melindungi Server Component."
```

---

### Task 3: Pintu query artikel

Seluruh query artikel lewat satu berkas. Alasannya bukan kerapian, melainkan jebakan `overrideAccess` di Task 2: `payload.find()` dari Server Component mengabaikan `access.read`, jadi penyaringan `_status` harus ada di kode aplikasi, dan menyebarnya ke banyak berkas berarti cepat atau lambat ada satu tempat yang lupa.

**Files:**
- Create: `src/features/articles/queries.ts`
- Create: `src/features/articles/queries.test.ts`

**Interfaces:**
- Consumes: tipe `Post` dari `@/payload/payload-types`, koleksi `"posts"` dari Task 2.
- Produces:
  - `PUBLISHED_WHERE`: objek where konstan, diekspor untuk diuji.
  - `listPublishedPosts(limit?: number): Promise<Post[]>`
  - `findPublishedPost(slug: string): Promise<Post | null>`
  - `listPublishedSlugs(): Promise<string[]>`

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/articles/queries.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const find = vi.fn();
vi.mock("payload", () => ({ getPayload: async () => ({ find }) }));
vi.mock("@payload-config", () => ({ default: {} }));

import {
  PUBLISHED_WHERE,
  listPublishedPosts,
  findPublishedPost,
  listPublishedSlugs,
} from "./queries";

beforeEach(() => {
  find.mockReset();
  find.mockResolvedValue({ docs: [] });
});

describe("query artikel", () => {
  it("selalu menyaring published, karena overrideAccess Local API default true", () => {
    expect(PUBLISHED_WHERE).toEqual({ _status: { equals: "published" } });
  });

  it("listPublishedPosts menyaring published dan mengurut terbaru dulu", async () => {
    await listPublishedPosts();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        where: PUBLISHED_WHERE,
        sort: "-publishedAt",
      }),
    );
  });

  it("listPublishedPosts meneruskan limit", async () => {
    await listPublishedPosts(3);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ limit: 3 }));
  });

  it("findPublishedPost mencari slug DAN status sekaligus", async () => {
    await findPublishedPost("operasi-sts");
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { and: [{ slug: { equals: "operasi-sts" } }, PUBLISHED_WHERE] },
      }),
    );
  });

  it("findPublishedPost mengembalikan null kalau tidak ketemu", async () => {
    expect(await findPublishedPost("tidak-ada")).toBeNull();
  });

  it("listPublishedSlugs mengembalikan slug saja", async () => {
    find.mockResolvedValue({ docs: [{ slug: "a" }, { slug: "b" }] });
    expect(await listPublishedSlugs()).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/articles/queries.test.ts`
Expected: FAIL, modul `./queries` belum ada.

- [ ] **Step 3: Implementasi**

Buat `src/features/articles/queries.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { Post } from "@/payload/payload-types";

/**
 * Satu-satunya pintu query artikel di seluruh aplikasi, dan itu disengaja.
 *
 * Local API payload.find() memakai overrideAccess: true secara default,
 * jadi access.read pada koleksi Posts TIDAK berlaku untuk Server Component.
 * Penyaringan draft harus dilakukan di sini, di kode aplikasi. Menyebar
 * payload.find({ collection: "posts" }) ke banyak berkas berarti cepat atau
 * lambat ada satu yang lupa menyaring, dan artikel draft tayang ke publik
 * dengan build hijau serta seluruh tes unit hijau.
 *
 * Kalau suatu saat butuh query artikel yang belum ditangani di sini,
 * tambahkan fungsinya di berkas ini. Jangan memanggil payload.find untuk
 * koleksi posts dari tempat lain.
 */
export const PUBLISHED_WHERE = { _status: { equals: "published" } } as const;

async function client() {
  return getPayload({ config });
}

export async function listPublishedPosts(limit?: number): Promise<Post[]> {
  const payload = await client();
  const result = await payload.find({
    collection: "posts",
    where: PUBLISHED_WHERE,
    sort: "-publishedAt",
    depth: 1,
    ...(limit === undefined ? {} : { limit }),
  });
  return result.docs as Post[];
}

export async function findPublishedPost(slug: string): Promise<Post | null> {
  const payload = await client();
  const result = await payload.find({
    collection: "posts",
    where: { and: [{ slug: { equals: slug } }, PUBLISHED_WHERE] },
    depth: 1,
    limit: 1,
  });
  return (result.docs[0] as Post | undefined) ?? null;
}

export async function listPublishedSlugs(): Promise<string[]> {
  const payload = await client();
  const result = await payload.find({
    collection: "posts",
    where: PUBLISHED_WHERE,
    depth: 0,
    limit: 1000,
    select: { slug: true },
  });
  return (result.docs as Array<{ slug: string }>).map((doc) => doc.slug);
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/articles/queries.test.ts`
Expected: PASS, 6 tes.

- [ ] **Step 5: Gerbang cepat**

Run: `bun run lint && bun run typecheck`

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/features/articles/
git commit -m "feat: pintu tunggal query artikel yang selalu menyaring draft

payload.find() default overrideAccess:true, jadi access.read di koleksi
Posts tidak berlaku untuk Server Component. Penyaringan _status harus
ada di kode aplikasi, dan memusatkannya di satu berkas mencegah ada satu
pemanggil yang lupa lalu menayangkan draft."
```

---

### Task 4: Format tanggal Indonesia

Dipakai daftar artikel, detail artikel, dan seksi beranda. Dipisah supaya ketiganya tidak menulis tiga varian format yang berbeda.

**Files:**
- Create: `src/features/articles/format-date.ts`
- Create: `src/features/articles/format-date.test.ts`

**Interfaces:**
- Produces: `formatTanggal(iso: string): string`, mengembalikan bentuk `"23 Agustus 2026"`. Dipakai Task 5, 6, dan 7.

- [ ] **Step 1: Tulis tes yang gagal**

```ts
import { describe, expect, it } from "vitest";
import { formatTanggal } from "./format-date";

describe("formatTanggal", () => {
  it("menulis tanggal dalam bahasa Indonesia", () => {
    expect(formatTanggal("2026-08-23T00:00:00.000Z")).toBe("23 Agustus 2026");
  });

  it("menangani bulan satu digit tanpa nol di depan", () => {
    expect(formatTanggal("2026-01-05T00:00:00.000Z")).toBe("5 Januari 2026");
  });

  it("mengembalikan string kosong untuk nilai yang tidak bisa dibaca", () => {
    // publishedAt bersifat required di koleksi, tapi data lama atau impor
    // manual bisa melanggarnya. Halaman tidak boleh crash karena itu.
    expect(formatTanggal("bukan-tanggal")).toBe("");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/articles/format-date.test.ts`
Expected: FAIL, modul belum ada.

- [ ] **Step 3: Implementasi**

```ts
/**
 * Zona waktu dipaku ke UTC, bukan zona mesin. Tanpa itu artikel yang terbit
 * pada 00:30 WIB akan tampil bertanggal sehari lebih awal di server yang
 * berjalan di UTC, dan tanggal di kartu tidak lagi cocok dengan tanggal di
 * halaman detail kalau keduanya dirender di proses yang berbeda.
 */
const FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTanggal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return FORMATTER.format(date);
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/articles/format-date.test.ts`
Expected: PASS, 3 tes.

- [ ] **Step 5: Commit**

```bash
git add dml-web/src/features/articles/format-date.ts dml-web/src/features/articles/format-date.test.ts
git commit -m "feat: format tanggal artikel bahasa Indonesia

Zona waktu dipaku UTC supaya tanggal yang sama tidak tampil berbeda
antara halaman yang dirender di proses berbeda."
```

---

### Task 5: Daftar artikel dan route `/artikel`

**Design read.** Pembaca halaman ini panel procurement yang menilai apakah operator ini serius, atau kandidat kerja yang mengecek apakah perusahaannya hidup. Bukan pembaca blog konsumen. Bentuknya editorial korporat: artikel pertama berbobot besar, sisanya daftar berpembatas. **Bukan tiga kartu identik**, yang dilarang master spec 7.11 dan yang, dengan hanya tiga artikel, terbaca seperti halaman gagal memuat.

Paginasi tidak dibangun. Ambangnya ditulis sebagai konstanta supaya kelak tinggal dinaikkan.

**Files:**
- Create: `src/features/articles/article-list.tsx`
- Create: `src/features/articles/article-list.test.tsx`
- Create: `src/app/(site)/artikel/page.tsx`

**Interfaces:**
- Consumes: `listPublishedPosts` (Task 3), `formatTanggal` (Task 4), tipe `Post` dan `Media` dari `@/payload/payload-types`.
- Produces:
  - `ArticleList({ posts }: { posts: Post[] })`, Server Component murni tanpa query sendiri.
  - `resolveMedia(value: Post["coverImage"]): Media | null`, diekspor untuk dipakai ulang Task 6, 7, dan 14.
  - `CATEGORY_LABELS: Record<string, string>`, diekspor untuk dipakai ulang Task 6 dan 14.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/articles/article-list.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArticleList, resolveMedia, CATEGORY_LABELS } from "./article-list";
import type { Post } from "@/payload/payload-types";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: "Operasi ship to ship di perairan dangkal",
    slug: "operasi-sts",
    excerpt: "Ringkasan singkat.",
    category: "operasi",
    publishedAt: "2026-08-23T00:00:00.000Z",
    coverImage: {
      id: 9,
      alt: "Kapal tanker",
      url: "/media/kapal.jpg",
      width: 1600,
      height: 900,
    },
    content: {},
    author: { id: 1, name: "Redaksi DML" },
    updatedAt: "2026-08-23T00:00:00.000Z",
    createdAt: "2026-08-23T00:00:00.000Z",
    ...overrides,
  } as unknown as Post;
}

describe("ArticleList", () => {
  it("menampilkan empty state saat tidak ada artikel", () => {
    render(<ArticleList posts={[]} />);
    expect(screen.getByText("Belum ada artikel")).toBeInTheDocument();
  });

  it("artikel pertama tampil sebagai sorotan dengan excerpt", () => {
    render(<ArticleList posts={[post()]} />);
    const sorotan = screen.getByTestId("artikel-sorotan");
    expect(within(sorotan).getByText("Ringkasan singkat.")).toBeInTheDocument();
  });

  it("artikel berikutnya masuk daftar, bukan sorotan kedua", () => {
    render(
      <ArticleList
        posts={[post(), post({ id: 2, slug: "kedua", title: "Artikel kedua" })]}
      />,
    );
    expect(screen.getAllByTestId("artikel-sorotan")).toHaveLength(1);
    expect(screen.getAllByTestId("artikel-baris")).toHaveLength(1);
  });

  it("tiap artikel menaut ke slug-nya", () => {
    render(<ArticleList posts={[post()]} />);
    expect(
      screen.getByRole("link", { name: /operasi ship to ship/i }),
    ).toHaveAttribute("href", "/artikel/operasi-sts");
  });

  it("menampilkan tanggal terbit dalam bahasa Indonesia", () => {
    render(<ArticleList posts={[post()]} />);
    expect(screen.getByText("23 Agustus 2026")).toBeInTheDocument();
  });

  it("menampilkan label kategori manusiawi, bukan nilai enum", () => {
    render(<ArticleList posts={[post()]} />);
    expect(screen.getByText("Operasi")).toBeInTheDocument();
    expect(screen.queryByText("operasi")).toBeNull();
  });
});

describe("resolveMedia", () => {
  it("mengembalikan objek media saat depth mengembangkannya", () => {
    expect(resolveMedia({ id: 9, url: "/media/a.jpg" } as never)?.url).toBe("/media/a.jpg");
  });

  it("mengembalikan null saat relasi masih berupa id", () => {
    // depth:0 mengembalikan angka. Komponen tidak boleh crash karenanya.
    expect(resolveMedia(9 as never)).toBeNull();
  });
});

describe("CATEGORY_LABELS", () => {
  it("memuat keempat kategori koleksi", () => {
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([
      "armada",
      "keselamatan",
      "operasi",
      "perusahaan",
    ]);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/articles/article-list.test.tsx`
Expected: FAIL, modul `./article-list` belum ada.

- [ ] **Step 3: Implementasi komponen**

Buat `src/features/articles/article-list.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Media, Post } from "@/payload/payload-types";
import { formatTanggal } from "./format-date";

/**
 * Label kategori dipisah dari nilai enum koleksi. Nilai enum ikut masuk
 * query string dan slug kalau kelak ada penyaringan; labelnya yang boleh
 * berubah tanpa memindahkan data.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  operasi: "Operasi",
  armada: "Armada",
  keselamatan: "Keselamatan",
  perusahaan: "Perusahaan",
};

/**
 * Relasi Payload mengembalikan angka saat depth 0 dan objek saat depth
 * lebih tinggi. Query artikel memakai depth 1, tapi komponen tetap
 * menangani bentuk angka supaya ia tidak crash kalau dipanggil dari
 * pemanggil dengan depth berbeda.
 */
export function resolveMedia(value: Post["coverImage"]): Media | null {
  return typeof value === "object" && value !== null ? (value as Media) : null;
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
      <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
    </p>
  );
}

function Sorotan({ post }: { post: Post }) {
  const cover = resolveMedia(post.coverImage);
  return (
    <article data-testid="artikel-sorotan" className="border-b border-surface-3 pb-12">
      <Link href={`/artikel/${post.slug}`} className="group block">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? ""}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="aspect-[16/9] w-full rounded-card object-cover"
          />
        ) : null}
        <div className="mt-6">
          <Meta post={post} />
          <h2 className="mt-3 max-w-[24ch] font-display text-pretty text-3xl font-bold text-ink transition-colors group-hover:text-accent md:text-4xl">
            {post.title}
          </h2>
          <p className="mt-4 max-w-[60ch] text-ink-muted">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

function Baris({ post }: { post: Post }) {
  const cover = resolveMedia(post.coverImage);
  return (
    <article data-testid="artikel-baris" className="py-8">
      <Link href={`/artikel/${post.slug}`} className="group flex items-start gap-6">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? ""}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="160px"
            className="hidden aspect-[4/3] w-40 shrink-0 rounded-card object-cover sm:block"
          />
        ) : null}
        <div>
          <Meta post={post} />
          <h3 className="mt-2 max-w-[40ch] font-display text-pretty text-xl font-bold text-ink transition-colors group-hover:text-accent md:text-2xl">
            {post.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

export function ArticleList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="mt-10 max-w-[60ch] rounded-card border border-surface-3 bg-surface-2 p-8">
        <p className="text-ink">Belum ada artikel</p>
        <p className="mt-3 text-sm text-ink-muted">
          Kabar operasi, armada, dan keselamatan akan terbit di halaman ini.
        </p>
      </div>
    );
  }

  const [sorotan, ...sisanya] = posts;
  return (
    <div className="mt-10">
      <Sorotan post={sorotan} />
      {sisanya.length > 0 ? (
        <div className="divide-y divide-surface-3">
          {sisanya.map((post) => (
            <Baris key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/articles/article-list.test.tsx`
Expected: PASS, 9 tes.

- [ ] **Step 5: Buat route**

Buat `src/app/(site)/artikel/page.tsx`:

```tsx
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { listPublishedPosts } from "@/features/articles/queries";
import { ArticleList } from "@/features/articles/article-list";

export const metadata: Metadata = buildMetadata({
  title: "Artikel | PT Dutabahari Menara Line",
  description:
    "Kabar operasi, armada, dan keselamatan dari PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988.",
  path: "/artikel",
});

/**
 * Paginasi sengaja belum dibangun. Ambang di bawah adalah titik di mana ia
 * mulai layak: selama jumlah artikel published masih di bawahnya, paginasi
 * adalah kode yang tidak pernah dieksekusi. Kalau ambang ini terlampaui,
 * tambahkan paginasi, jangan diam-diam memotong daftar.
 */
const AMBANG_PAGINASI = 20;

export default async function ArtikelPage() {
  const posts = await listPublishedPosts(AMBANG_PAGINASI);
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-pretty text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Artikel
      </h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Kabar operasi, armada, dan keselamatan dari lapangan.
      </p>

      <ArticleList posts={posts} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verifikasi halaman benar-benar tayang**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run build && bun run start &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/artikel
curl -s http://localhost:3000/artikel | grep -c "Belum ada artikel"
kill %1
```
Expected: `200`, lalu `1`. Koleksi masih kosong di titik ini, jadi empty state adalah hasil yang benar.

- [ ] **Step 7: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/articles/article-list.tsx dml-web/src/features/articles/article-list.test.tsx \
        "dml-web/src/app/(site)/artikel/page.tsx"
git commit -m "feat: halaman daftar artikel dengan tata letak editorial

Artikel pertama jadi sorotan, sisanya daftar berpembatas. Bukan grid
kartu identik: master spec 7.11 melarangnya, dan dengan tiga artikel
grid itu terbaca seperti halaman yang gagal memuat.

Empty state tetap dibangun meski situs akan tayang dengan isi, karena
klien bisa menghapus seluruh artikel dari /admin kapan saja."
```

---

### Task 6: Halaman detail artikel

**Files:**
- Create: `src/app/(site)/artikel/[slug]/page.tsx`
- Modify: `src/lib/seo/json-ld.ts`
- Modify: `src/lib/seo/json-ld.test.ts`

**Interfaces:**
- Consumes: `findPublishedPost`, `listPublishedSlugs` (Task 3), `resolveMedia`, `CATEGORY_LABELS` (Task 5), `formatTanggal` (Task 4).
- Produces: `articleJsonLd(input: { title: string; description: string; path: string; publishedAt: string; imageUrl?: string; authorName?: string })` di `src/lib/seo/json-ld.ts`.

- [ ] **Step 1: Tulis tes JSON-LD yang gagal**

Tambahkan ke `src/lib/seo/json-ld.test.ts`, dan tambahkan `articleJsonLd` ke daftar impor di kepala berkas:

```ts
describe("articleJsonLd", () => {
  const input = {
    title: "Operasi ship to ship",
    description: "Ringkasan.",
    path: "/artikel/operasi-sts",
    publishedAt: "2026-08-23T00:00:00.000Z",
    imageUrl: "https://contoh.test/media/kapal.jpg",
    authorName: "Redaksi DML",
  };

  it("memakai tipe Article dengan URL absolut", () => {
    const data = articleJsonLd(input) as Record<string, unknown>;
    expect(data["@type"]).toBe("Article");
    expect(String(data.mainEntityOfPage)).toMatch(/\/artikel\/operasi-sts$/);
    expect(String(data.mainEntityOfPage)).toMatch(/^https?:\/\//);
  });

  it("membawa penulis dan tanggal terbit", () => {
    const data = articleJsonLd(input) as Record<string, unknown>;
    expect(data.author).toEqual({ "@type": "Person", name: "Redaksi DML" });
    expect(data.datePublished).toBe("2026-08-23T00:00:00.000Z");
  });

  it("menghilangkan penulis dan gambar kalau tidak ada, bukan mengisinya kosong", () => {
    const data = articleJsonLd({
      title: "T",
      description: "D",
      path: "/artikel/t",
      publishedAt: "2026-08-23T00:00:00.000Z",
    }) as Record<string, unknown>;
    expect("author" in data).toBe(false);
    expect("image" in data).toBe(false);
  });

  it("aman saat judul artikel memuat penutup script", () => {
    // Inilah alasan escape "<" dipasang di safeJsonLdString sejak Plan 3.
    // Judul artikel adalah input admin, dan ini pemakaian pertamanya.
    const data = articleJsonLd({
      ...input,
      title: 'Judul </script><script>alert(1)</script>',
    });
    expect(safeJsonLdString(data)).not.toContain("</script>");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/lib/seo/json-ld.test.ts`
Expected: FAIL, `articleJsonLd` belum diekspor.

- [ ] **Step 3: Implementasi builder**

Tambahkan ke `src/lib/seo/json-ld.ts`, di bawah `breadcrumbJsonLd`:

```ts
/**
 * JSON-LD artikel. Field opsional dihilangkan sepenuhnya kalau tidak ada,
 * bukan diisi string kosong: validator structured data memperlakukan
 * properti kosong sebagai kesalahan, sementara properti yang absen memang
 * boleh absen untuk tipe Article.
 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  imageUrl?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt,
    publisher: {
      "@type": "Organization",
      name: COMPANY.legalName,
      url: SITE_URL,
    },
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName } }
      : {}),
  };
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/lib/seo/json-ld.test.ts`
Expected: PASS.

- [ ] **Step 5: Buat halaman detail**

Buat `src/app/(site)/artikel/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { buildMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { findPublishedPost, listPublishedSlugs } from "@/features/articles/queries";
import { resolveMedia, CATEGORY_LABELS } from "@/features/articles/article-list";
import { formatTanggal } from "@/features/articles/format-date";
import type { User } from "@/payload/payload-types";

/**
 * JANGAN menambahkan `export const dynamicParams = false` di berkas ini.
 *
 * Saat `next build` berjalan, koleksi artikel bisa saja kosong, sehingga
 * generateStaticParams di bawah mengembalikan array kosong. Artikel yang
 * dipublikasikan SETELAH build hanya bisa dirender karena dynamicParams
 * bernilai true secara default. Mematikannya membunuh persis alur yang jadi
 * alasan keberadaan seluruh pipeline CMS ini, dan matinya senyap: build
 * tetap hijau, tes unit tetap hijau, hanya alur publish yang mati.
 *
 * Catatan terkait: dynamicParams tidak tersedia saat cacheComponents menyala.
 * Itu satu alasan tambahan, di luar risiko Payload, kenapa cacheComponents
 * tetap mati untuk rilis ini.
 */
export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) return buildMetadata({
    title: "Artikel tidak ditemukan | PT Dutabahari Menara Line",
    description: "Artikel yang dicari tidak tersedia.",
    path: `/artikel/${slug}`,
  });

  return buildMetadata({
    title: `${post.seo?.metaTitle ?? post.title} | PT Dutabahari Menara Line`,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/artikel/${post.slug}`,
  });
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPublishedPost(slug);
  if (!post) notFound();

  const cover = resolveMedia(post.coverImage);
  const author = typeof post.author === "object" && post.author !== null
    ? (post.author as User)
    : null;

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Artikel", path: "/artikel" },
    { name: post.title, path: `/artikel/${post.slug}` },
  ]);

  const article = articleJsonLd({
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/artikel/${post.slug}`,
    publishedAt: post.publishedAt,
    ...(cover?.url ? { imageUrl: absoluteUrl(cover.url) } : {}),
    ...(author?.name ? { authorName: author.name } : {}),
  });

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[70ch]">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
          <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
          {author?.name ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{author.name}</span>
            </>
          ) : null}
        </p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {post.title}
        </h1>
      </div>

      {cover?.url ? (
        <Image
          src={cover.url}
          alt={cover.alt ?? ""}
          width={cover.width ?? 1600}
          height={cover.height ?? 900}
          sizes="(min-width: 1400px) 1400px, 100vw"
          className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
        />
      ) : null}

      {/*
        Renderer resmi Payload, bukan serializer tangan. Menulis pemetaan node
        Lexical sendiri berarti memeliharanya selamanya untuk sesuatu yang
        sudah disediakan paket yang sudah jadi dependency.
      */}
      <div className="prose-artikel mx-auto mt-12 max-w-[70ch] text-ink">
        <RichText data={post.content as SerializedEditorState} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(article) }}
      />
    </article>
  );
}
```

Kalau `bun run typecheck` menolak cast `as SerializedEditorState`, **jangan turun ke `any` atau `as never`.** Tipe yang benar sudah ada di `Post["content"]` hasil `bun run generate:types`; pakai itu langsung tanpa cast. Verifikasi lebih dulu bahwa impornya memang ada:

```bash
grep -c "SerializedEditorState" node_modules/lexical/index.d.ts
head -1 node_modules/@payloadcms/richtext-lexical/dist/lexical-proxy/lexical.d.ts
```
Expected: `1`, lalu `export * from 'lexical'`. Keduanya sudah diperiksa saat plan ini ditulis; langkah di atas cuma menangkap perubahan versi paket.

- [ ] **Step 6: Beri gaya isi richtext**

`RichText` memancarkan `<h2>`, `<p>`, `<ul>`, `<a>` telanjang tanpa class. Tanpa gaya, artikel tayang sebagai teks tanpa jarak. Tailwind v4 di repo ini tidak memakai plugin typography, jadi gayanya ditulis sekali sebagai satu class di `src/app/globals.css`:

```css
.prose-artikel :is(h2) {
  margin-top: 2.5rem;
  font-family: var(--font-gt-america), sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-wrap: pretty;
}
.prose-artikel :is(h3) {
  margin-top: 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-wrap: pretty;
}
.prose-artikel :is(p) {
  margin-top: 1.25rem;
  line-height: 1.75;
}
.prose-artikel :is(ul, ol) {
  margin-top: 1.25rem;
  padding-left: 1.5rem;
  list-style: disc;
}
.prose-artikel :is(ol) {
  list-style: decimal;
}
.prose-artikel :is(li) {
  margin-top: 0.5rem;
}
.prose-artikel :is(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 7: Verifikasi slug tak dikenal jatuh ke 404**

```bash
bun run build && bun run start &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/artikel/slug-yang-tidak-ada
kill %1
```
Expected: `404`.

- [ ] **Step 8: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 9: Commit**

```bash
git add "dml-web/src/app/(site)/artikel/[slug]/page.tsx" dml-web/src/lib/seo/json-ld.ts \
        dml-web/src/lib/seo/json-ld.test.ts dml-web/src/app/globals.css
git commit -m "feat: halaman detail artikel dengan richtext resmi dan JSON-LD Article

RichText dari @payloadcms/richtext-lexical/react, bukan serializer
tangan. Larangan dynamicParams=false ditulis sebagai komentar di
berkasnya, bukan cuma di spec, karena melanggarnya mematikan alur
publish dengan senyap.

Tes JSON-LD memakai judul yang memuat penutup script. Escape di
safeJsonLdString dipasang sejak Plan 3 justru untuk kasus ini, dan ini
pemakaian pertamanya."
```

---

### Task 7: Hook revalidasi

Sekarang kedua route ada, jadi hook boleh memanggilnya.

**Files:**
- Modify: `src/payload/collections/Posts.ts`
- Modify: `src/payload/collections/Posts.test.ts`

**Interfaces:**
- Consumes: route `/artikel` (Task 5) dan `/artikel/[slug]` (Task 6).
- Produces: `Posts.hooks.afterChange` dan `Posts.hooks.afterDelete` memanggil `revalidatePath` untuk empat permukaan.

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan ke `src/payload/collections/Posts.test.ts`. Mock harus berada di kepala berkas, sebelum impor `Posts`:

```ts
import { vi } from "vitest";
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));
```

Lalu blok tes:

```ts
describe("revalidasi", () => {
  beforeEach(() => revalidatePath.mockReset());

  it("menyegarkan empat permukaan saat artikel berubah", async () => {
    const hook = Posts.hooks?.afterChange?.[0];
    await hook!({ doc: { slug: "baru" }, previousDoc: { slug: "baru" } } as never);
    const dipanggil = revalidatePath.mock.calls.map(([path]) => path);
    expect(dipanggil).toEqual(
      expect.arrayContaining(["/artikel", "/artikel/baru", "/", "/sitemap.xml"]),
    );
  });

  it("menyegarkan slug lama DAN baru saat slug berubah", async () => {
    // Tanpa ini halaman di alamat lama hidup terus sebagai hantu.
    const hook = Posts.hooks?.afterChange?.[0];
    await hook!({ doc: { slug: "baru" }, previousDoc: { slug: "lama" } } as never);
    const dipanggil = revalidatePath.mock.calls.map(([path]) => path);
    expect(dipanggil).toEqual(expect.arrayContaining(["/artikel/lama", "/artikel/baru"]));
  });

  it("menyegarkan juga saat artikel dihapus", async () => {
    const hook = Posts.hooks?.afterDelete?.[0];
    await hook!({ doc: { slug: "dihapus" } } as never);
    const dipanggil = revalidatePath.mock.calls.map(([path]) => path);
    expect(dipanggil).toEqual(
      expect.arrayContaining(["/artikel", "/artikel/dihapus", "/", "/sitemap.xml"]),
    );
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/payload/collections/Posts.test.ts`
Expected: FAIL, `Posts.hooks.afterChange` masih `undefined`.

- [ ] **Step 3: Implementasi**

Di `src/payload/collections/Posts.ts`, tambahkan impor dan perluas `hooks`:

```ts
import { revalidatePath } from "next/cache";
```

```ts
/**
 * revalidatePath, bukan revalidateTag. Di Next 16 revalidateTag(tag) satu
 * argumen sudah deprecated, dan unstable_cache ditandai digantikan `use
 * cache`, yang hanya tersedia kalau cacheComponents menyala. cacheComponents
 * dimatikan untuk rilis ini karena dukungan Payload belum dijamin, dan
 * karena menyalakannya juga menghilangkan dynamicParams yang jadi tumpuan
 * alur publish. Alasan lengkap ada di spec Plan 8 bagian 10.2.
 *
 * Empat permukaan, dan cuma empat, yang memuat artikel:
 * daftar, detail, beranda (seksi Artikel Terbaru), dan sitemap.
 */
function revalidasiArtikel(slugs: Array<string | undefined>) {
  revalidatePath("/artikel");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/artikel/${slug}`);
  }
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
```

Lalu di dalam `hooks`:

```ts
    afterChange: [
      ({ doc, previousDoc }) => {
        // Slug lama ikut disegarkan. Kalau tidak, artikel yang slug-nya
        // diubah akan tetap hidup di alamat lama sebagai halaman hantu
        // yang isinya versi basi.
        revalidasiArtikel([doc?.slug, previousDoc?.slug]);
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidasiArtikel([doc?.slug]);
      },
    ],
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/payload/collections/Posts.test.ts`
Expected: PASS, 13 tes.

- [ ] **Step 5: Buktikan `revalidatePath("/sitemap.xml")` benar-benar bekerja**

Spec bagian 4.3 menandai pemanggilan ini **belum terverifikasi**: dokumen Next 16 tidak menyebut metadata route dalam konteks `revalidatePath`. Buktinya baru bisa diambil setelah Task 9 dan Task 10 ada, jadi langkah ini **dieksekusi di Task 11 Step 6**, bukan di sini. Yang dilakukan sekarang cuma mencatat utangnya.

- [ ] **Step 6: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 7: Commit**

```bash
git add dml-web/src/payload/collections/Posts.ts dml-web/src/payload/collections/Posts.test.ts
git commit -m "feat: hook revalidasi artikel untuk empat permukaan

revalidatePath, bukan revalidateTag yang sudah deprecated di Next 16 dan
bukan unstable_cache yang dokumennya sendiri menyatakan digantikan.

Slug lama ikut disegarkan saat slug berubah, kalau tidak alamat lama
hidup terus sebagai halaman hantu berisi versi basi.

Kebenaran revalidatePath('/sitemap.xml') masih utang; ia dibuktikan
empiris di Task 11."
```

---

### Task 8: Seksi Artikel Terbaru di beranda

Tiga artikel terbaru, setelah `Certifications` dan sebelum `CtaSection`. Alasan posisinya sudah tertulis di docblock `page.tsx`: tidak boleh ada dua seksi berurutan dengan keluarga tata letak yang sama. Sertifikasi badge grid, artikel kartu editorial bergambar, CTA bidang teks.

**Seksi ini hilang sepenuhnya kalau koleksi kosong.** Tidak ada empty state di beranda; beranda halaman penjualan, dan "belum ada artikel" di sana melemahkan tanpa memberi apa pun.

**Files:**
- Create: `src/features/articles/latest-articles.tsx`
- Create: `src/features/articles/latest-articles.test.tsx`
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `listPublishedPosts` (Task 3), `resolveMedia`, `CATEGORY_LABELS` (Task 5), `formatTanggal` (Task 4), `SectionHeader` dari `@/components/ui/section-header`, `CtaLink` dari `@/components/ui/cta-link`.
- Produces: dua ekspor dari berkas yang sama, dipisah supaya bagian yang menyentuh database tidak ikut masuk tes render.
  - `LatestArticlesView({ posts }: { posts: Post[] })`, murni presentasi.
  - `LatestArticles()`, async Server Component yang query lalu merender `LatestArticlesView`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/articles/latest-articles.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LatestArticlesView } from "./latest-articles";
import type { Post } from "@/payload/payload-types";

function post(id: number, title: string): Post {
  return {
    id,
    title,
    slug: `artikel-${id}`,
    excerpt: "Ringkasan.",
    category: "operasi",
    publishedAt: "2026-08-23T00:00:00.000Z",
    coverImage: { id, alt: "Kapal", url: "/media/a.jpg", width: 1600, height: 900 },
    content: {},
    author: { id: 1, name: "Redaksi DML" },
    updatedAt: "2026-08-23T00:00:00.000Z",
    createdAt: "2026-08-23T00:00:00.000Z",
  } as unknown as Post;
}

describe("LatestArticlesView", () => {
  it("tidak merender apa pun saat koleksi kosong", () => {
    // Beranda adalah halaman penjualan. "Belum ada artikel" di sana
    // melemahkan tanpa memberi apa pun, jadi seksinya hilang seluruhnya.
    const { container } = render(<LatestArticlesView posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("merender seksi saat ada artikel", () => {
    render(<LatestArticlesView posts={[post(1, "Artikel satu")]} />);
    expect(screen.getByRole("heading", { name: "Artikel Terbaru" })).toBeInTheDocument();
  });

  it("menaut ke tiap artikel dan ke daftar lengkap", () => {
    render(<LatestArticlesView posts={[post(1, "Artikel satu")]} />);
    expect(screen.getByRole("link", { name: /artikel satu/i })).toHaveAttribute(
      "href",
      "/artikel/artikel-1",
    );
    expect(screen.getByRole("link", { name: /semua artikel/i })).toHaveAttribute(
      "href",
      "/artikel",
    );
  });

  it("menampilkan paling banyak tiga artikel", () => {
    render(
      <LatestArticlesView
        posts={[post(1, "Satu"), post(2, "Dua"), post(3, "Tiga"), post(4, "Empat")]}
      />,
    );
    expect(screen.getAllByTestId("artikel-terbaru")).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/articles/latest-articles.test.tsx`
Expected: FAIL, modul belum ada.

- [ ] **Step 3: Implementasi**

Buat `src/features/articles/latest-articles.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/payload/payload-types";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaLink } from "@/components/ui/cta-link";
import { formatTanggal } from "./format-date";
import { resolveMedia, CATEGORY_LABELS } from "./article-list";

const JUMLAH = 3;

/**
 * Dipisah dari komponen async di bawah supaya tes render tidak perlu
 * menyentuh database sama sekali. Yang diuji bentuknya; yang menyentuh
 * Payload cuma pembungkus tiga baris.
 */
export function LatestArticlesView({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-wash py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            title="Artikel Terbaru"
            description="Kabar operasi, armada, dan keselamatan dari lapangan."
          />
          <CtaLink href="/artikel" variant="ghost">
            Semua Artikel
          </CtaLink>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {posts.slice(0, JUMLAH).map((post) => {
            const cover = resolveMedia(post.coverImage);
            return (
              <article key={post.id} data-testid="artikel-terbaru">
                <Link href={`/artikel/${post.slug}`} className="group block">
                  {cover?.url ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt ?? ""}
                      width={cover.width ?? 1600}
                      height={cover.height ?? 900}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="aspect-[4/3] w-full rounded-card object-cover"
                    />
                  ) : null}
                  <p className="mt-5 flex flex-wrap items-center gap-x-3 font-mono text-xs text-ink-muted">
                    <span>{CATEGORY_LABELS[post.category] ?? post.category}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt}>{formatTanggal(post.publishedAt)}</time>
                  </p>
                  <h3 className="mt-2 font-display text-pretty text-xl font-bold text-ink transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function LatestArticles() {
  /**
   * Impor dinamis, bukan impor di kepala berkas. queries.ts memuat
   * @payload-config, dan vitest mengalias itu ke config Payload sungguhan.
   * Impor statis berarti tes render di jsdom ikut memuat seluruh config CMS
   * hanya untuk memeriksa markup. Menundanya ke sini membuat modul itu tidak
   * pernah dievaluasi selama tes komponen.
   */
  const { listPublishedPosts } = await import("./queries");
  const posts = await listPublishedPosts(JUMLAH);
  return <LatestArticlesView posts={posts} />;
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/articles/latest-articles.test.tsx`
Expected: PASS, 4 tes.

- [ ] **Step 5: Sisipkan ke beranda**

Di `src/app/(site)/page.tsx`, tambahkan impor:

```tsx
import { LatestArticles } from "@/features/articles/latest-articles";
```

lalu sisipkan tepat di antara `<Certifications />` dan `<CtaSection />`:

```tsx
      <Certifications />
      <LatestArticles />
      <CtaSection />
```

Tambahkan satu kalimat ke docblock urutan seksi yang sudah ada di berkas itu:

```
 * Seksi artikel disisipkan di antara sertifikasi dan CTA karena keduanya
 * beda keluarga tata letak: badge grid, lalu kartu editorial bergambar,
 * lalu bidang teks. Ia hilang seluruhnya kalau koleksi artikel kosong.
```

- [ ] **Step 6: Verifikasi beranda tetap tayang dengan koleksi kosong**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run build && bun run start &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s http://localhost:3000/ | grep -c "Artikel Terbaru"
kill %1
```
Expected: `200`, lalu `0`. Koleksi masih kosong, jadi seksinya memang harus absen.

- [ ] **Step 7: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/articles/latest-articles.tsx \
        dml-web/src/features/articles/latest-articles.test.tsx "dml-web/src/app/(site)/page.tsx"
git commit -m "feat: seksi Artikel Terbaru di beranda

Hilang seluruhnya saat koleksi kosong, bukan menampilkan empty state.
Beranda halaman penjualan; pengakuan bahwa belum ada artikel di sana
melemahkan tanpa memberi apa pun.

Presentasi dipisah dari query supaya tes render tidak menyentuh
database."
```

---

### Task 9: Sitemap dinamis

`sitemap()` berubah jadi async dan mengembalikan `/artikel` beserta slug published. Ini **merombak** `src/app/sitemap.test.ts` yang ditulis Plan 8: enam tesnya menganggap fungsinya sinkron dan seluruh isinya berasal dari `STATIC_PATHS`. Perombakan itu adalah langkah eksplisit di sini, bukan kejutan.

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/sitemap.test.ts` (ditulis ulang)

**Interfaces:**
- Consumes: `listPublishedPosts` (Task 3).
- Produces: `STATIC_PATHS` tetap diekspor dan kini memuat `/artikel`. Default export jadi `async function sitemap(): Promise<MetadataRoute.Sitemap>`.

- [ ] **Step 1: Tulis ulang tes**

Ganti seluruh isi `src/app/sitemap.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const listPublishedPosts = vi.fn();
vi.mock("@/features/articles/queries", () => ({ listPublishedPosts }));

import sitemap, { STATIC_PATHS } from "./sitemap";

/**
 * Path di sitemap dicocokkan ke berkas page.tsx yang benar-benar ada di disk.
 * Tanpa tes ini sitemap bisa melenceng diam-diam dari route, dan cacat persis
 * itu hidup di repo sejak Plan 1: enam URL yang 404 diiklankan ke mesin
 * pencari selama tujuh plan.
 */
function pageFileFor(path: string): string {
  const segment = path === "/" ? "" : path;
  return resolve(process.cwd(), `src/app/(site)${segment}/page.tsx`);
}

beforeEach(() => {
  listPublishedPosts.mockReset();
  listPublishedPosts.mockResolvedValue([]);
});

describe("sitemap", () => {
  it("setiap path statis punya berkas page.tsx yang benar-benar ada", () => {
    for (const path of STATIC_PATHS) {
      expect(existsSync(pageFileFor(path)), `route hilang untuk ${path}`).toBe(true);
    }
  });

  it("tidak lagi mengiklankan /bisnis/galangan-kapal", () => {
    // DMLD adalah perusahaan terpisah di Sinar Alam Corporation, bukan lini
    // DML. Lihat docblock di src/content/navigation.ts.
    expect(STATIC_PATHS).not.toContain("/bisnis/galangan-kapal");
  });

  it("kembali mengiklankan /artikel sejak Plan 9", () => {
    expect(STATIC_PATHS).toContain("/artikel");
  });

  it("memuat keempat route bisnis", () => {
    expect(STATIC_PATHS).toContain("/bisnis");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm");
    expect(STATIC_PATHS).toContain("/bisnis/penumpang-roro");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm/permintaan-informasi");
  });

  it("beranda punya prioritas tertinggi", async () => {
    const entries = await sitemap();
    const home = entries.find((entry) => entry.url.endsWith("/"));
    expect(home?.priority).toBe(1);
  });

  it("setiap entri punya URL absolut", async () => {
    for (const entry of await sitemap()) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });

  it("menambahkan satu entri per artikel published", async () => {
    listPublishedPosts.mockResolvedValue([
      { slug: "operasi-sts", updatedAt: "2026-08-23T00:00:00.000Z" },
      { slug: "sejak-1988", updatedAt: "2026-08-22T00:00:00.000Z" },
    ]);
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/artikel/operasi-sts"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/artikel/sejak-1988"))).toBe(true);
  });

  it("hanya memuat artikel yang lewat pintu query published", async () => {
    // Penyaringan draft milik queries.ts. Tes ini menjaga sitemap tetap
    // memakai pintu itu dan tidak pernah query koleksi posts sendiri.
    await sitemap();
    expect(listPublishedPosts).toHaveBeenCalled();
  });

  it("tidak meledak kalau database tidak bisa dihubungi", async () => {
    // Sitemap yang gagal berarti build gagal. Kehilangan entri artikel
    // sementara jauh lebih ringan daripada situs yang tidak bisa dibangun.
    listPublishedPosts.mockRejectedValue(new Error("koneksi ditolak"));
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/artikel"))).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/app/sitemap.test.ts`
Expected: FAIL. `/artikel` belum ada di `STATIC_PATHS`, dan `await sitemap()` pada fungsi sinkron tidak menghasilkan entri artikel.

- [ ] **Step 3: Implementasi**

Ganti isi `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { listPublishedPosts } from "@/features/articles/queries";

/**
 * Diekspor supaya sitemap.test.ts bisa mencocokkan tiap path ke berkas
 * page.tsx yang benar-benar ada. Sebelum Plan 8, daftar ini memuat enam URL
 * yang 404 dan diiklankan ke mesin pencari selama tujuh plan.
 *
 * /bisnis/galangan-kapal dicoret permanen: PT Dutabahari Menara Line Dockyard
 * adalah perusahaan terpisah di dalam Sinar Alam Corporation, bukan lini DML.
 * Lihat docblock di src/content/navigation.ts.
 *
 * /artikel kembali sejak Plan 9, bersama slug artikel published yang
 * ditambahkan secara dinamis di bawah.
 */
export const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/transportasi-bbm/permintaan-informasi",
  "/bisnis/penumpang-roro",
  "/artikel",
  "/karier",
  "/kontak",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statis: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  /**
   * Kegagalan database tidak boleh menjatuhkan sitemap. Sitemap yang gagal
   * berarti `next build` gagal, dan kehilangan entri artikel untuk sementara
   * jauh lebih ringan daripada situs yang tidak bisa dibangun sama sekali.
   */
  let artikel: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    artikel = posts.map((post) => ({
      url: absoluteUrl(`/artikel/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("sitemap: gagal memuat artikel", error);
  }

  return [...statis, ...artikel];
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/app/sitemap.test.ts`
Expected: PASS, 9 tes.

- [ ] **Step 5: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/app/sitemap.ts dml-web/src/app/sitemap.test.ts
git commit -m "feat: sitemap memuat artikel published

Fungsinya jadi async dan /artikel kembali ke STATIC_PATHS. Enam tes
Plan 8 ditulis ulang untuk bentuk async; itu dampak yang diketahui,
bukan kejutan.

Kegagalan database ditangkap dan dicatat, tidak dilempar. Sitemap yang
melempar berarti next build gagal, dan kehilangan entri artikel
sementara jauh lebih ringan daripada situs yang tidak bisa dibangun."
```

---

### Task 10: Seed idempoten dan fixture autentikasi

Satu berkas menyelesaikan dua masalah berbeda.

**Masalah pertama, dan ini risiko eksekusi terbesar fase A:** spec Playwright admin-publish di Task 11 tidak punya cara login. Hari ini tidak ada seed script, tidak ada auth fixture di `tests/e2e/`, dan user pertama Payload lahir dari `/admin/create-first-user`. Tanpa berkas ini, Task 11 buntu di tengah jalan.

**Masalah kedua:** keputusan 4 spec menuntut situs tayang dengan isi, bukan dengan `/artikel` kosong.

**Batas isi yang tidak boleh dilanggar.** Ketiga artikel hanya menyusun ulang materi yang sudah terverifikasi. **Tidak ada angka baru, tanggal baru, nama orang baru, atau klaim pelanggan.** HSSE tidak disebut sama sekali karena statusnya masih `belum-terverifikasi` di `certifications.ts`. Yang disusun kalimat penghubungnya, bukan faktanya.

**Files:**
- Create: `scripts/seed.ts`
- Create: `tests/e2e/global-setup.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`
- Modify: `.env.example`

**Interfaces:**
- Consumes: koleksi `posts` (Task 2), `users` dengan field `name` (Task 1), `slugify` dari `@/payload/collections/Posts` (Task 2).
- Produces: `bun run seed` yang idempoten. Membuat satu user admin dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD`, tiga media, dan tiga artikel published.

- [ ] **Step 1: Tambahkan variabel environment**

Sisipkan ke `.env.example`:

```bash
# Kredensial admin pertama yang dibuat `bun run seed`. Dipakai juga oleh
# tests/e2e/global-setup.ts supaya spec admin-publish punya akun yang pasti
# ada. JANGAN memakai nilai contoh ini di produksi: seed berjalan saat setup
# container pertama, dan akun dengan sandi yang tertulis di repo publik sama
# saja dengan admin panel tanpa sandi.
SEED_ADMIN_EMAIL=admin@dutabaharimenaraline.co.id
SEED_ADMIN_PASSWORD=ganti-dengan-sandi-panjang-yang-acak
```

- [ ] **Step 2: Tulis script seed**

Buat `scripts/seed.ts`:

```ts
import { getPayload } from "payload";
import config from "../src/payload/payload.config";
import { slugify } from "../src/payload/collections/Posts";

/**
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
    type: "text",
    text: value,
    version: 1,
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
  };
}

function paragraf(value: string) {
  return {
    type: "paragraph",
    version: 1,
    format: "",
    indent: 0,
    direction: "ltr",
    textFormat: 0,
    children: [teks(value)],
  };
}

function judul(value: string) {
  return {
    type: "heading",
    tag: "h2",
    version: 1,
    format: "",
    indent: 0,
    direction: "ltr",
    children: [teks(value)],
  };
}

function isi(blocks: Array<ReturnType<typeof paragraf>>) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: blocks,
    },
  };
}

const ARTIKEL = [
  {
    slug: "operasi-ship-to-ship-di-titik-tanpa-jetty",
    title: "Operasi ship-to-ship di titik yang tidak punya jetty",
    category: "operasi",
    excerpt:
      "Memindahkan bahan bakar langsung antar kapal di tengah perairan, dari muat di terminal sampai dokumen serah selesai.",
    publishedAt: "2026-08-20T00:00:00.000Z",
    cover: {
      file: "public/media/lini-bisnis/operasi-sts-2400.webp",
      alt: "Dua kapal bersandar untuk transfer bahan bakar di tengah perairan",
    },
    // Fakta: src/features/home/day-cut.tsx dan STS_STEPS di
    // src/app/(site)/bisnis/transportasi-bbm/page.tsx, keduanya bersumber PDF.
    content: isi([
      paragraf(
        "Tidak semua titik serah punya jetty. Sebagian pelabuhan kecil dan titik distribusi di perairan Indonesia tidak bisa disandari kapal pengangkut berukuran besar, dan menunggu antrean sandar di pelabuhan yang lebih besar berarti pasokan sampai terlambat.",
      ),
      paragraf(
        "Ship-to-ship transfer menjawab keduanya. Bahan bakar dipindahkan langsung antar kapal di tengah perairan, sehingga titik yang tidak terjangkau jetty konvensional tetap terlayani tanpa bergantung pada giliran sandar.",
      ),
      judul("Empat langkah, dari terminal sampai serah"),
      paragraf(
        "Motor tanker atau SPOB memuat bahan bakar cair di terminal, dengan dokumen muatan dan pemeriksaan yang mengikuti prosedur ISM Code.",
      ),
      paragraf(
        "Kapal lalu berlayar ke titik serah, termasuk titik yang tidak terjangkau jetty. Di sinilah armada berukuran berbeda punya gunanya masing-masing.",
      ),
      paragraf(
        "Di titik serah, dua kapal disandarkan dengan fender dan tali tambat, lalu diikat dalam posisi yang menahan gerak relatif keduanya sepanjang transfer.",
      ),
      paragraf(
        "Selang transfer dipasang, muatan dipindahkan, dan dokumen serah diselesaikan sebelum kedua kapal dilepas.",
      ),
    ]),
  },
  {
    slug: "ism-code-dan-iso-9001-di-operasi-harian",
    title: "ISM Code dan ISO 9001:2015 di operasi harian",
    category: "keselamatan",
    excerpt:
      "Dua standar yang mengatur cara kerja armada, dan apa artinya bagi pihak yang menyerahkan muatannya kepada kami.",
    publishedAt: "2026-08-18T00:00:00.000Z",
    cover: {
      file: "public/media/bisnis/hub-bisnis-2400.webp",
      alt: "Armada kapal PT Dutabahari Menara Line di perairan",
    },
    // Fakta: src/content/certifications.ts dan COMPANY.standards, keduanya cp-pdf.
    content: isi([
      paragraf(
        "Pengangkutan bahan bakar cair adalah pekerjaan yang kesalahannya mahal, dan mahalnya tidak selalu berupa uang. Karena itu cara kerjanya diatur standar, bukan diserahkan pada kebiasaan tiap kapal.",
      ),
      judul("ISM Code"),
      paragraf(
        "International Safety Management Code mengatur sistem manajemen keselamatan di atas kapal: siapa bertanggung jawab atas apa, bagaimana prosedur ditulis dan diperbarui, dan bagaimana kejadian dilaporkan serta ditindaklanjuti. Ia bukan sertifikat yang digantung lalu dilupakan, melainkan sistem yang harus terlihat jejaknya di operasi harian.",
      ),
      judul("ISO 9001:2015"),
      paragraf(
        "ISO 9001:2015 mengatur sistem manajemen mutu. Di konteks pelayaran, ia menyentuh hal yang sering luput dari perhatian: konsistensi dokumen, ketertelusuran keputusan, dan cara keluhan pelanggan diproses sampai tuntas.",
      ),
      paragraf(
        "Keduanya bertemu di titik yang sama, yaitu prosedur yang sama dijalankan cara yang sama, siapa pun yang bertugas.",
      ),
    ]),
  },
  {
    slug: "berdiri-1988-di-banjarmasin",
    title: "Berdiri 1988 di Banjarmasin",
    category: "perusahaan",
    excerpt:
      "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin pada 30 November 1988.",
    publishedAt: "2026-08-15T00:00:00.000Z",
    cover: {
      file: "public/media/hari/dji-0030-2400.webp",
      alt: "Kapal PT Dutabahari Menara Line dilihat dari udara",
    },
    // Fakta: src/content/timeline.ts dan src/content/company.ts, cp-pdf hal. 01 dan 02.
    content: isi([
      paragraf(
        "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin pada 30 November 1988. Kota itu sampai hari ini tetap jadi kantor pusatnya.",
      ),
      paragraf(
        "Perusahaan ini bagian dari Sinar Alam Corporation, dan menjalankan dua lini yang dioperasikannya sendiri: transportasi bahan bakar cair, serta penyeberangan penumpang dan kendaraan dengan kapal ro-ro.",
      ),
      paragraf(
        "Di luar dua lini itu, sejumlah perusahaan afiliasi menangani pekerjaan yang bersinggungan, termasuk perawatan armada dan pengoperasian lintasan penyeberangan tertentu.",
      ),
    ]),
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
        category: artikel.category,
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
```

- [ ] **Step 3: Daftarkan script**

Tambahkan ke `scripts` di `package.json`:

```json
    "seed": "PAYLOAD_CONFIG_PATH=src/payload/payload.config.ts bun scripts/seed.ts",
```

- [ ] **Step 4: Jalankan seed dan buktikan idempotensinya**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run seed
bun run seed
```
Expected: run pertama mencetak tiga baris `buat:`. Run kedua mencetak tiga baris `lewati (sudah ada):` dan **nol** `buat:`. Kalau run kedua membuat duplikat, seed tidak idempoten dan eksekusi berhenti di sini.

- [ ] **Step 5: Buktikan artikel benar-benar tayang**

```bash
bun run build && bun run start &
sleep 8
curl -s http://localhost:3000/artikel | grep -c "Operasi ship-to-ship"
curl -s http://localhost:3000/ | grep -c "Artikel Terbaru"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty
kill %1
```
Expected: `1`, `1`, `200`. Seksi beranda kini muncul, yang di Task 8 sengaja masih `0`.

- [ ] **Step 6: Pasang globalSetup Playwright**

Buat `tests/e2e/global-setup.ts`:

```ts
import { spawnSync } from "node:child_process";

/**
 * Seed dijalankan sekali sebelum spec mana pun. Tanpa ini, admin-publish.spec
 * tidak punya akun untuk login: user pertama Payload lahir dari
 * /admin/create-first-user, dan mendorong spec melewati alur itu membuat tes
 * bergantung pada urutan eksekusi antar berkas spec.
 *
 * Seed bersifat idempoten, jadi menjalankannya di tiap run aman.
 */
export default function globalSetup() {
  const hasil = spawnSync("bun", ["run", "seed"], {
    stdio: "inherit",
    env: process.env,
  });
  if (hasil.status !== 0) {
    throw new Error(
      "seed gagal. Pastikan Postgres hidup dan SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD terisi di .env.local.",
    );
  }
}
```

Di `playwright.config.ts`, tambahkan di dalam `defineConfig`:

```ts
  globalSetup: "./tests/e2e/global-setup.ts",
```

- [ ] **Step 7: Buktikan globalSetup jalan**

Run: `bun run test:e2e tests/e2e/beranda.spec.ts`
Expected: keluaran seed muncul di awal (tiga baris `lewati`), lalu spec beranda lolos.

- [ ] **Step 8: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 9: Commit**

```bash
git add dml-web/scripts/seed.ts dml-web/tests/e2e/global-setup.ts \
        dml-web/playwright.config.ts dml-web/package.json dml-web/.env.example
git commit -m "feat: seed idempoten untuk admin pertama dan tiga artikel awal

Menyelesaikan dua masalah sekaligus. Pertama, spec admin-publish tidak
punya cara login sama sekali: tidak ada seed, tidak ada fixture, dan user
pertama Payload lahir dari /admin/create-first-user. Kedua, situs tayang
dengan isi, bukan dengan halaman artikel kosong.

Isi ketiga artikel adalah susunan agen dari materi yang sudah
terverifikasi di src/content dan di company profile. Nol angka baru, nol
tanggal baru, nol nama baru, dan HSSE tidak disebut karena statusnya
masih belum-terverifikasi. Teksnya menunggu review klien, dan klien bisa
mencabutnya dari /admin tanpa deploy ulang."
```

---

### Task 11: E2E artikel, admin-publish, dan bukti revalidasi

**Files:**
- Create: `tests/e2e/artikel.spec.ts`
- Create: `tests/e2e/admin-publish.spec.ts`
- Modify: `tests/e2e/a11y-viewport.spec.ts`

**Interfaces:**
- Consumes: seed dari Task 10, route dari Task 5 dan 6, hook dari Task 7.

- [ ] **Step 1: Spec artikel publik**

Buat `tests/e2e/artikel.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("navigasi utama membawa ke daftar artikel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").first().getByRole("link", { name: "Artikel" }).click();
  await expect(page).toHaveURL(/\/artikel$/);
  await expect(page.getByRole("heading", { level: 1, name: "Artikel" })).toBeVisible();
});

test("daftar menaut ke halaman detail", async ({ page }) => {
  await page.goto("/artikel");
  await page.getByRole("link", { name: /Operasi ship-to-ship/ }).first().click();
  await expect(page).toHaveURL(/\/artikel\/operasi-ship-to-ship-di-titik-tanpa-jetty$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Operasi ship-to-ship");
});

test("halaman detail merender isi richtext, bukan JSON mentah", async ({ page }) => {
  await page.goto("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
  await expect(page.getByRole("heading", { name: "Empat langkah, dari terminal sampai serah" })).toBeVisible();
  // Kalau serializer gagal, isi Lexical bocor sebagai objek. Jaga eksplisit.
  await expect(page.locator("body")).not.toContainText('"type":"paragraph"');
});

test("slug yang tidak ada memberi 404, bukan halaman kosong", async ({ page }) => {
  const response = await page.goto("/artikel/slug-yang-tidak-pernah-ada");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
});

test("beranda menampilkan seksi Artikel Terbaru", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Artikel Terbaru" })).toBeVisible();
});

test("sitemap memuat slug artikel", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
});

test("halaman artikel terbaca tanpa JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/artikel");
  await expect(page.getByRole("heading", { level: 1, name: "Artikel" })).toBeVisible();

  await page.goto("/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty");
  await expect(page.getByText("Empat langkah, dari terminal sampai serah")).toBeVisible();

  await context.close();
});
```

- [ ] **Step 2: Jalankan spec artikel**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run test:e2e tests/e2e/artikel.spec.ts
```
Expected: 7 lolos.

- [ ] **Step 3: Spec admin-publish**

Ini spec yang membuktikan revalidasi benar-benar bekerja, dan sekaligus **verifikasi browser pertama untuk `/admin`** sepanjang umur repo. Ia menutup butir 1 dari lima item terbuka Plan 2.

Buat `tests/e2e/admin-publish.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "";

// Judul dibuat unik per run supaya spec bisa dijalankan berkali-kali di
// database yang sama tanpa bertabrakan dengan slug unik. Bukan Math.random:
// nilai berbasis waktu cukup, dan jejaknya bisa ditelusuri di /admin.
const STAMP = String(Date.now());
const JUDUL = `Uji publikasi ${STAMP}`;
const SLUG = `uji-publikasi-${STAMP}`;

test.describe.configure({ mode: "serial" });

test("kredensial seed tersedia", () => {
  // Gagal lebih awal dengan pesan yang jelas, bukan gagal di form login
  // dengan galat yang terbaca seperti bug UI admin.
  expect(EMAIL, "SEED_ADMIN_EMAIL belum diisi di .env.local").not.toBe("");
  expect(PASSWORD, "SEED_ADMIN_PASSWORD belum diisi di .env.local").not.toBe("");
});

test("artikel yang dipublikasikan lewat admin muncul tanpa rebuild", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /login/i }).click();
  await expect(page).toHaveURL(/\/admin(\/|$)/);

  await page.goto("/admin/collections/posts/create");

  await page.getByLabel("Title").fill(JUDUL);
  await page.getByLabel("Slug").fill(SLUG);
  await page.getByLabel("Excerpt").fill("Artikel uji yang dibuat spec Playwright.");

  // Cover image memakai media yang sudah dibuat seed, bukan mengunggah
  // berkas baru: yang diuji di sini alur publikasi dan revalidasi, bukan
  // alur upload.
  await page.getByRole("button", { name: /choose from existing/i }).first().click();
  await page.getByRole("button", { name: /select/i }).first().click();

  await page.getByLabel("Category").selectOption("operasi");
  await page.getByLabel("Published At").fill("2026-08-23");

  await page.locator(".rich-text-lexical [contenteditable='true']").first()
    .fill("Isi artikel uji.");

  await page.getByLabel("Status").selectOption("published");
  await page.getByRole("button", { name: /^save$/i }).click();
  await expect(page.getByText(/updated successfully|created successfully/i)).toBeVisible();

  // Inilah asersinya. Tidak ada rebuild di antara publish dan pemeriksaan
  // di bawah; kalau hook revalidasi Task 7 tidak bekerja, ketiga
  // pemeriksaan ini gagal.
  await page.goto("/artikel");
  await expect(page.getByText(JUDUL)).toBeVisible();

  await page.goto(`/artikel/${SLUG}`);
  await expect(page.getByRole("heading", { level: 1, name: JUDUL })).toBeVisible();

  await page.goto("/");
  await expect(page.getByText(JUDUL)).toBeVisible();
});

test("artikel berstatus draft tidak pernah tampil ke publik", async ({ page, request }) => {
  const slugDraft = `uji-draft-${STAMP}`;

  await page.goto("/admin");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /login/i }).click();

  await page.goto("/admin/collections/posts/create");
  await page.getByLabel("Title").fill(`Draft ${STAMP}`);
  await page.getByLabel("Slug").fill(slugDraft);
  await page.getByLabel("Excerpt").fill("Draft yang tidak boleh tayang.");
  await page.getByRole("button", { name: /choose from existing/i }).first().click();
  await page.getByRole("button", { name: /select/i }).first().click();
  await page.getByLabel("Category").selectOption("operasi");
  await page.getByLabel("Published At").fill("2026-08-23");
  await page.locator(".rich-text-lexical [contenteditable='true']").first().fill("Rahasia.");
  await page.getByRole("button", { name: /save draft/i }).click();

  // Ini tes keamanan, bukan tes tampilan. Local API payload.find() memakai
  // overrideAccess:true secara default, jadi kalau ada satu saja pemanggil
  // yang lupa menyaring _status, draft tayang ke publik dengan build hijau
  // dan seluruh tes unit hijau. Lihat komentar di queries.ts.
  const detail = await request.get(`/artikel/${slugDraft}`);
  expect(detail.status()).toBe(404);

  const daftar = await request.get("/artikel");
  expect(await daftar.text()).not.toContain(`Draft ${STAMP}`);

  const peta = await request.get("/sitemap.xml");
  expect(await peta.text()).not.toContain(slugDraft);
});
```

- [ ] **Step 4: Jalankan spec admin-publish**

Run: `bun run test:e2e tests/e2e/admin-publish.spec.ts`

Kalau gagal karena label form admin tidak cocok, **jangan melemahkan asersinya**. Buka `/admin/collections/posts/create` di browser sungguhan, baca label yang benar-benar dirender Payload 3.88, lalu perbaiki selektornya. Payload merender label dari nama field, tapi kapitalisasi dan spasinya ditentukan versi paket, bukan oleh plan ini.

- [ ] **Step 5: Tambahkan route artikel ke sapuan aksesibilitas**

Di `tests/e2e/a11y-viewport.spec.ts`, tambahkan dua entri ke `ROUTES`:

```ts
  "/artikel",
  "/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty",
```

Run: `bun run test:e2e tests/e2e/a11y-viewport.spec.ts`
Expected: 30 tes lolos (10 route kali 3 viewport).

- [ ] **Step 6: Bayar utang verifikasi `revalidatePath("/sitemap.xml")`**

Spec bagian 4.3 menandai pemanggilan ini belum terverifikasi karena dokumen Next 16 tidak menyebut metadata route sama sekali dalam konteks `revalidatePath`. Sekarang alat buktinya lengkap.

```bash
bun run build && bun run start &
sleep 8
curl -s http://localhost:3000/sitemap.xml | grep -c "operasi-ship-to-ship" # baseline
```

Lalu, lewat `/admin` di browser, ubah slug artikel "Berdiri 1988 di Banjarmasin" jadi `berdiri-1988-di-banjarmasin-uji` dan simpan. Tanpa restart server:

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "berdiri-1988-di-banjarmasin-uji"
kill %1
```

- Kalau hasilnya `1`: pemanggilan itu bekerja. Catat hasilnya di pesan commit, dan hapus kata "belum terverifikasi" dari komentar di `Posts.ts`.
- Kalau hasilnya `0`: **jalankan cadangan yang sudah ditentukan di muka**, jangan mencari akal lain. Tambahkan ke `src/app/sitemap.ts`:
  ```ts
  /**
   * Diverifikasi 23 Agustus 2026: revalidatePath("/sitemap.xml") tidak
   * menyentuh metadata route ini, jadi sitemap disegarkan berkala. Telat
   * satu jam tidak merugikan siapa pun; sitemap yang tidak pernah berubah
   * merugikan.
   */
  export const revalidate = 3600;
  ```
  Lalu ubah komentar pemanggilan di `Posts.ts` jadi catatan bahwa ia dipertahankan sebagai no-op yang murah, atau hapus pemanggilannya. Catat pilihan itu di pesan commit.

Kembalikan slug artikel ke nilai semula setelah pengujian.

- [ ] **Step 7: Commit**

```bash
git add dml-web/tests/e2e/artikel.spec.ts dml-web/tests/e2e/admin-publish.spec.ts \
        dml-web/tests/e2e/a11y-viewport.spec.ts dml-web/src/payload/collections/Posts.ts \
        dml-web/src/app/sitemap.ts
git commit -m "test: e2e artikel, alur publish admin, dan bukti revalidasi

admin-publish.spec adalah verifikasi browser pertama untuk /admin
sepanjang umur repo, dan menutup butir 1 dari lima item terbuka Plan 2.
Ia membuktikan revalidasi bekerja: artikel yang dipublikasikan muncul di
tiga permukaan tanpa rebuild di antaranya.

Spec draft-tidak-bocor adalah tes keamanan, bukan tes tampilan. Local
API default overrideAccess:true, jadi satu pemanggil yang lupa menyaring
_status sudah cukup untuk menayangkan draft dengan seluruh gerbang
hijau.

Utang verifikasi revalidatePath('/sitemap.xml') dari Task 7 dibayar di
sini."
```

---

### Task 12: README dan penutupan fase A

Sejak `/` melakukan query artikel, `bun run build` membutuhkan Postgres hidup, bukan hanya `bun run test:e2e`. README hari ini hanya memperingatkan untuk e2e, padahal `bun run check` menjalankan build dan lighthouse. Tanpa baris ini, anggota tim pertama yang menjalankan `check` di mesin dingin mendapat kegagalan yang terbaca seperti bug kode.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Perbarui langkah setup**

Di bagian "Setup fresh clone", sisipkan langkah baru setelah `bun run payload migrate`:

```markdown
6. `bun run seed` untuk membuat akun admin pertama beserta tiga artikel awal.
   Isi `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di `.env.local` lebih dulu.
   Script ini idempoten, jadi menjalankannya ulang aman.
7. `bun run dev`, buka `http://localhost:3000`
```

(Nomor 5 yang lama, `bun run dev`, dihapus karena digantikan nomor 7.)

- [ ] **Step 2: Tambahkan peringatan Postgres pada build**

Sisipkan di bagian "Perintah penting", tepat sebelum entri `bun run check`:

```markdown
> **Postgres harus hidup sebelum `bun run build`, bukan hanya sebelum
> `bun run test:e2e`.** Sejak beranda memuat seksi Artikel Terbaru dan
> `sitemap.ts` menarik slug artikel, build melakukan query database. Di mesin
> dingin, `bun run check` akan gagal di tahap build dengan galat koneksi yang
> terbaca seperti bug kode. Jalankan lebih dulu:
> ```bash
> docker compose up -d
> until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
> ```
> `sitemap.ts` sendiri menangkap kegagalan query dan tetap memancarkan path
> statis, jadi build tidak jatuh karenanya. Yang jatuh adalah beranda.
```

- [ ] **Step 3: Tambahkan bagian artikel**

Sisipkan sebelum bagian "Angka armada yang masih menunggu konfirmasi klien":

```markdown
## Artikel dan CMS

Artikel tinggal di koleksi `posts` Payload dan disunting lewat `/admin`.
Halaman korporat tidak berada di CMS; editor hanya menyentuh artikel.

Publikasi tidak butuh rebuild. Hook `afterChange` dan `afterDelete` memanggil
`revalidatePath` untuk `/artikel`, `/artikel/<slug>`, `/`, dan `/sitemap.xml`.
Slug lama ikut disegarkan saat slug berubah, supaya alamat lama tidak hidup
terus sebagai halaman hantu.

Seluruh query artikel wajib lewat `src/features/articles/queries.ts`. Local
API `payload.find()` memakai `overrideAccess: true` secara default, jadi
`access.read` di koleksi `posts` **tidak** melindungi Server Component.
Penyaringan `_status` ada di kode aplikasi, dan memusatkannya mencegah satu
pemanggil yang lupa lalu menayangkan draft.

### Tiga artikel awal menunggu review klien

`bun run seed` membuat tiga artikel: operasi ship-to-ship, ISM Code dan
ISO 9001:2015, serta berdirinya perusahaan pada 1988. Seluruh faktanya berasal
dari `src/content/` dan dari `assets/CP DML.pdf`, tapi **kalimatnya disusun
agen, bukan ditulis klien**, jadi teksnya menunggu persetujuan bersama copy
Visi dan Misi.

Kalau klien menolak, hapus artikelnya dari `/admin`. Hook revalidasi
membersihkan jejaknya dari `/artikel`, beranda, dan sitemap tanpa deploy
ulang. Tidak ada teks itu yang tertanam di dalam `src/`.
```

- [ ] **Step 4: Gerbang penuh fase A**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run lint && bun run typecheck && bun run test && bun run build && bun run doctor
bun run lighthouse
bun run test:e2e
```

Expected: lint bersih, typecheck bersih, seluruh tes unit lolos, build sukses, `doctor` menyisakan **tepat satu** temuan (pengecualian permanen `effect-needs-cleanup`, yang juga menghentikan rantai `&&` sehingga lighthouse dijalankan terpisah), lighthouse lolos, seluruh spec e2e lolos.

Kalau lighthouse gagal di rentang 5800 sampai 5930 ms, **jangan naikkan ambang di `lighthouserc.json`**. Itu pola kontensi CPU yang terdokumentasi sejak Plan 4. Yang layak diperiksa lebih dulu: apakah seksi Artikel Terbaru menambahkan gambar besar tanpa `sizes` yang benar.

- [ ] **Step 5: Commit**

```bash
git add dml-web/README.md
git commit -m "docs: README untuk artikel, seed, dan build yang kini butuh Postgres

Sejak beranda query artikel, bun run build butuh database hidup, bukan
cuma test:e2e. Tanpa catatan ini, orang pertama yang menjalankan check di
mesin dingin mendapat kegagalan yang terbaca seperti bug kode.

Tiga artikel seed dicatat sebagai menunggu review klien, beserta cara
mencabutnya dari /admin tanpa deploy ulang.

Fase A selesai. Gerbang penuh hijau."
```

---

## Fase B — SEO dan OG image

### Task 13: `metadataBase`

**Urutan ini bagian dari desain, bukan preferensi.** `buildMetadata` hari ini mengembalikan URL absolut lewat `absoluteUrl()`, jadi canonical sudah benar. Tapi `metadataBase` tidak pernah diset di mana pun, dan begitu OG image masuk dengan path relatif, Next memperingatkan saat build lalu me-resolve gambarnya terhadap `localhost:3000`. Kartu OG yang menunjuk localhost tidak pernah tampil di WhatsApp maupun LinkedIn.

**Files:**
- Modify: `src/lib/seo/metadata.ts`
- Create: `src/lib/seo/metadata.test.ts`

**Interfaces:**
- Produces: `buildMetadata` mengembalikan `metadataBase: URL`. Task 14 dan 15 bergantung padanya.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/lib/seo/metadata.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildMetadata, absoluteUrl, SITE_URL } from "./metadata";

describe("buildMetadata", () => {
  const meta = buildMetadata({
    title: "Judul",
    description: "Deskripsi",
    path: "/contoh",
  });

  it("menyetel metadataBase", () => {
    // Tanpa ini, openGraph.images berpath relatif akan diresolusi terhadap
    // localhost dan kartu OG-nya tidak pernah tampil saat dibagikan.
    expect(meta.metadataBase?.toString()).toBe(new URL(SITE_URL).toString());
  });

  it("canonical tetap absolut", () => {
    expect(String(meta.alternates?.canonical)).toBe(absoluteUrl("/contoh"));
  });

  it("openGraph memakai URL absolut dan locale Indonesia", () => {
    expect(meta.openGraph?.url).toBe(absoluteUrl("/contoh"));
    expect(meta.openGraph).toMatchObject({ locale: "id_ID", type: "website" });
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/lib/seo/metadata.test.ts`
Expected: FAIL pada tes pertama, `metadataBase` masih `undefined`.

- [ ] **Step 3: Implementasi**

Di `src/lib/seo/metadata.ts`, tambahkan satu baris di dalam objek yang dikembalikan `buildMetadata`, di atas `title`:

```ts
    /**
     * Tanpa metadataBase, gambar OG berpath relatif diresolusi terhadap
     * localhost:3000 dan Next memperingatkannya saat build. Canonical sudah
     * absolut lewat absoluteUrl(), jadi masalahnya cuma menyentuh gambar,
     * dan justru gambar yang paling tidak terlihat rusak sampai ada yang
     * membagikan tautannya.
     */
    metadataBase: new URL(SITE_URL),
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/lib/seo/metadata.test.ts`
Expected: PASS, 3 tes.

- [ ] **Step 5: Commit**

```bash
git add dml-web/src/lib/seo/metadata.ts dml-web/src/lib/seo/metadata.test.ts
git commit -m "feat: metadataBase supaya gambar OG tidak menunjuk localhost

Dikerjakan sebelum task OG mana pun. Urutannya bagian dari desain: path
relatif tanpa metadataBase diresolusi ke localhost, dan kerusakannya
tidak terlihat sampai ada yang membagikan tautannya."
```

---

### Task 14: OG image korporat

**Penyimpangan dari spec bagian 5.2, dengan alasannya.** Spec menulis "dibangkitkan sekali lewat script dan dikomit". Plan ini memakai **konvensi berkas `opengraph-image.tsx` milik Next** sebagai gantinya. Tiga alasan:

1. Ia jalur resmi yang didokumentasikan Next untuk persoalan ini, dan CLAUDE.md repo ini menetapkan jalur resmi menang atas rakitan sendiri.
2. Hasilnya tetap **statis**. Berkas tanpa parameter dinamis dibangkitkan saat build lalu disajikan sebagai berkas, jadi kekhawatiran spec soal kerja runtime tidak berlaku.
3. Ia otomatis mengisi `openGraph.images` dan `twitter.images` untuk **seluruh** halaman di dalam grup route, termasuk halaman yang belum ada. Pendekatan script menuntut tiap halaman mengingat untuk menyebut berkasnya, dan satu halaman yang lupa gagal dengan diam.

Yang tidak berubah dari spec: satu kartu untuk seluruh halaman korporat, komposisinya memakai bahan yang sudah dimiliki repo, dan artikel mendapat kartunya sendiri di Task 15.

**Files:**
- Create: `src/lib/seo/og-template.tsx`
- Create: `src/app/(site)/opengraph-image.tsx`

**Interfaces:**
- Consumes: `metadataBase` (Task 13), token warna dari `@/lib/tokens`.
- Produces:
  - `OG_SIZE = { width: 1200, height: 630 }`
  - `OG_CONTENT_TYPE = "image/png"`
  - `loadOgFont(): Promise<ArrayBuffer>`
  - `OgCard({ kicker, title, imageUrl }: { kicker: string; title: string; imageUrl?: string })`
  Ketiganya dipakai ulang Task 15.

- [ ] **Step 1: Buat template bersama**

Buat `src/lib/seo/og-template.tsx`:

```tsx
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TOKENS } from "@/lib/tokens";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * ImageResponse merender lewat Satori, yang tidak mengenal next/font dan
 * tidak membaca CSS variable. Fontnya harus diserahkan sebagai ArrayBuffer.
 * Kalau langkah ini dilewati, gambar tetap terbentuk memakai font fallback
 * dan kegagalannya senyap: tidak ada error, cuma tipografi yang salah.
 */
export async function loadOgFont(): Promise<ArrayBuffer> {
  const file = path.join(process.cwd(), "src/fonts/GTAmerica-ExtendedBold.woff2");
  const buffer = await readFile(file);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/**
 * Satu komposisi untuk kartu korporat dan kartu artikel. Satori hanya
 * mendukung sebagian CSS, jadi gayanya ditulis inline dan flexbox eksplisit,
 * bukan lewat class Tailwind: Satori tidak memproses Tailwind sama sekali.
 */
export function OgCard({
  kicker,
  title,
  imageUrl,
}: {
  kicker: string;
  title: string;
  imageUrl?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: TOKENS.heroGround,
        position: "relative",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Satori merender
        // markup ini sendiri dan tidak mengenal komponen next/image.
        <img
          src={imageUrl}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: TOKENS.accentLift }}>{kicker}</div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 62,
            lineHeight: 1.1,
            color: "#FFFFFF",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 24, color: "#C3CEDE" }}>
          PT Dutabahari Menara Line
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Buat berkas OG korporat**

Buat `src/app/(site)/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE, loadOgFont } from "@/lib/seo/og-template";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "PT Dutabahari Menara Line, perusahaan pelayaran Banjarmasin sejak 1988";

/**
 * Berkas ini tidak punya parameter dinamis, jadi Next membangkitkannya sekali
 * saat build lalu menyajikannya sebagai berkas statis. Tidak ada kerja
 * runtime, dan seluruh halaman di dalam grup (site) mewarisi gambar ini tanpa
 * perlu menyebutnya di metadata masing-masing. Artikel menimpanya lewat
 * berkas opengraph-image miliknya sendiri.
 */
export default async function Image() {
  const [font, foto] = await Promise.all([
    loadOgFont(),
    readFile(path.join(process.cwd(), "public/media/bisnis/hub-bisnis-1600.webp")),
  ]);

  const dataUri = `data:image/webp;base64,${foto.toString("base64")}`;

  return new ImageResponse(
    (
      <OgCard
        kicker="Sejak 1988, Banjarmasin"
        title="Transportasi BBM dan penyeberangan ro-ro"
        imageUrl={dataUri}
      />
    ),
    {
      ...size,
      fonts: [{ name: "GT America", data: font, style: "normal", weight: 700 }],
    },
  );
}
```

- [ ] **Step 3: Build dan buktikan gambarnya benar-benar terbentuk**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run build && bun run start &
sleep 8
curl -s -o /tmp/og-korporat.png -w "%{http_code} %{content_type}\n" \
  "$(curl -s http://localhost:3000/ | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"$//')"
file /tmp/og-korporat.png
kill %1
```
Expected: `200 image/png`, dan `file` melaporkan `PNG image data, 1200 x 630`.

Kalau `og:image` tidak ada di HTML sama sekali, konvensi berkasnya tidak terbaca. Periksa lokasi berkas: ia harus tepat di `src/app/(site)/opengraph-image.tsx`, sejajar dengan `layout.tsx` grup itu.

- [ ] **Step 4: Buktikan halaman dalam juga mewarisinya**

```bash
bun run start &
sleep 8
for path in / /tentang-kami /bisnis /bisnis/transportasi-bbm /karier /kontak /artikel; do
  printf "%s -> " "$path"
  /usr/bin/curl -s "http://localhost:3000$path" | grep -c 'property="og:image"'
done
kill %1
```
Expected: setiap baris `1` atau lebih. Nol pada salah satu berarti halaman itu menimpa `openGraph` dengan cara yang membuang gambar warisannya.

- [ ] **Step 5: Lihat gambarnya dengan mata**

Buka `/tmp/og-korporat.png`. Yang diperiksa, dan ini tidak bisa diotomatiskan:

- Tipografinya GT America, bukan font fallback. Kalau hurufnya terlihat seperti serif atau seperti Arial, `loadOgFont` gagal senyap dan langkahnya harus dibetulkan, bukan diterima.
- Teks putih terbaca di atas foto. Kalau tidak, turunkan `opacity` foto.
- Tidak ada teks yang terpotong di tepi kanvas.

- [ ] **Step 6: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 7: Commit**

```bash
git add dml-web/src/lib/seo/og-template.tsx "dml-web/src/app/(site)/opengraph-image.tsx"
git commit -m "feat: kartu OG korporat lewat konvensi opengraph-image Next

Menyimpang dari spec 5.2 yang menulis script pembangkit terpisah, dengan
alasan: konvensi berkas adalah jalur resmi, hasilnya tetap statis karena
berkas tanpa parameter dinamis dibangkitkan saat build, dan seluruh
halaman dalam grup (site) mewarisinya tanpa perlu menyebutnya satu per
satu. Pendekatan script menuntut tiap halaman mengingat, dan yang lupa
gagal dengan diam.

Font diserahkan sebagai ArrayBuffer. Satori tidak mengenal next/font,
dan tanpa langkah itu gambar tetap terbentuk memakai font fallback tanpa
error apa pun."
```

---

### Task 15: OG image artikel

**Files:**
- Create: `src/app/(site)/artikel/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `OgCard`, `OG_SIZE`, `OG_CONTENT_TYPE`, `loadOgFont` (Task 14), `findPublishedPost` (Task 3), `resolveMedia`, `CATEGORY_LABELS` (Task 5), `absoluteUrl` (metadata).

- [ ] **Step 1: Implementasi**

Buat `src/app/(site)/artikel/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { absoluteUrl } from "@/lib/seo/metadata";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE, loadOgFont } from "@/lib/seo/og-template";
import { findPublishedPost } from "@/features/articles/queries";
import { resolveMedia, CATEGORY_LABELS } from "@/features/articles/article-list";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Artikel PT Dutabahari Menara Line";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, font] = await Promise.all([findPublishedPost(slug), loadOgFont()]);

  const cover = post ? resolveMedia(post.coverImage) : null;
  /**
   * Satori tidak punya konteks request, jadi path relatif tidak bisa
   * diresolusi. URL harus absolut. Artikel tanpa cover secara teori tidak
   * mungkin ada karena coverImage bersifat required, tapi data lama atau
   * impor manual bisa melanggar constraint yang ditegakkan di lapisan
   * aplikasi, dan kartu OG yang gagal dirender lebih buruk daripada kartu
   * berlatar warna solid.
   */
  const imageUrl = cover?.url ? absoluteUrl(cover.url) : undefined;

  return new ImageResponse(
    (
      <OgCard
        kicker={post ? (CATEGORY_LABELS[post.category] ?? post.category) : "Artikel"}
        title={post?.title ?? "Artikel"}
        {...(imageUrl ? { imageUrl } : {})}
      />
    ),
    {
      ...size,
      fonts: [{ name: "GT America", data: font, style: "normal", weight: 700 }],
    },
  );
}
```

- [ ] **Step 2: Buktikan kartunya memuat judul artikel, bukan judul korporat**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run build && bun run start &
sleep 8
URL=$(/usr/bin/curl -s http://localhost:3000/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty \
  | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"$//')
echo "$URL"
/usr/bin/curl -s -o /tmp/og-artikel.png -w "%{http_code} %{content_type}\n" "$URL"
file /tmp/og-artikel.png
kill %1
```
Expected: URL memuat segmen `/artikel/operasi-ship-to-ship-di-titik-tanpa-jetty/opengraph-image`, respons `200 image/png`, ukuran 1200x630.

- [ ] **Step 3: Lihat gambarnya dengan mata**

Buka `/tmp/og-artikel.png`. Kartu harus memuat kategori "Operasi" dan judul artikel itu sendiri, di atas cover artikelnya, bukan foto korporat dari Task 14. Kalau yang tampil judul korporat, berkas artikel tidak menimpa berkas grup dan lokasinya harus diperiksa.

- [ ] **Step 4: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test && bun run build`

- [ ] **Step 5: Commit**

```bash
git add "dml-web/src/app/(site)/artikel/[slug]/opengraph-image.tsx"
git commit -m "feat: kartu OG per artikel lewat next/og

Judul dan kategori artikel di atas cover-nya sendiri. Cover diserahkan
sebagai URL absolut karena Satori tidak punya konteks request untuk
meresolusi path relatif.

Artikel tanpa cover jatuh ke latar warna solid. coverImage memang
required di koleksi, tapi kartu OG yang gagal dirender lebih buruk
daripada kartu polos."
```

---

### Task 16: JSON-LD `Service` dan `LocalBusiness`

Master spec bagian 12 mendaftar lima jenis JSON-LD. `Organization` dan `BreadcrumbList` sudah ada sejak Plan 3; `Article` lahir di Task 6. Dua sisanya belum pernah dibangun.

**Files:**
- Modify: `src/lib/seo/json-ld.ts`
- Modify: `src/lib/seo/json-ld.test.ts`
- Modify: `src/app/(site)/bisnis/transportasi-bbm/page.tsx`
- Modify: `src/app/(site)/bisnis/penumpang-roro/page.tsx`
- Modify: `src/app/(site)/layout.tsx`

**Interfaces:**
- Consumes: `MAIN_LINES` dari `@/content/business-lines`, `COMPANY` dari `@/content/company`.
- Produces:
  - `serviceJsonLd(input: { name: string; description: string; path: string })`
  - `localBusinessJsonLd()`

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan ke `src/lib/seo/json-ld.test.ts`, dan tambahkan kedua nama ke daftar impor:

```ts
describe("serviceJsonLd", () => {
  const data = serviceJsonLd({
    name: "Transportasi BBM",
    description: "Distribusi bahan bakar cair ke pelabuhan dan pulau utama Indonesia.",
    path: "/bisnis/transportasi-bbm",
  }) as Record<string, unknown>;

  it("memakai tipe Service", () => {
    expect(data["@type"]).toBe("Service");
    expect(data.name).toBe("Transportasi BBM");
  });

  it("provider menunjuk organisasi yang sama dengan JSON-LD root", () => {
    expect(data.provider).toMatchObject({
      "@type": "Organization",
      name: COMPANY.legalName,
    });
  });

  it("url absolut", () => {
    expect(String(data.url)).toBe(absoluteUrl("/bisnis/transportasi-bbm"));
  });
});

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd() as Record<string, unknown>;

  it("memakai tipe LocalBusiness", () => {
    expect(data["@type"]).toBe("LocalBusiness");
  });

  it("membawa kedua kantor dari COMPANY.offices", () => {
    expect(Array.isArray(data.address)).toBe(true);
    expect((data.address as unknown[]).length).toBe(COMPANY.offices.length);
  });

  it("membawa telepon", () => {
    expect(data.telephone).toBe(COMPANY.phone);
  });
});
```

Impor `COMPANY` dan `absoluteUrl` di kepala berkas tes kalau belum ada.

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/lib/seo/json-ld.test.ts`
Expected: FAIL, kedua builder belum diekspor.

- [ ] **Step 3: Implementasi**

Tambahkan ke `src/lib/seo/json-ld.ts`:

```ts
/**
 * Satu Service per lini bisnis. Fieldnya diambil dari business-lines.ts yang
 * sudah ada; tidak ada data perusahaan baru yang lahir di berkas ini.
 *
 * areaServed sengaja tidak diisi. Cakupan wilayah yang tepat tidak ada di
 * company profile, dan menuliskan "Indonesia" adalah klaim yang tidak
 * berdasar untuk data terstruktur yang justru dibaca mesin.
 */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@type": "Organization",
      name: COMPANY.legalName,
      url: SITE_URL,
    },
  };
}

/**
 * LocalBusiness berdampingan dengan Organization di root, sesuai master spec
 * bagian 12. Keduanya mendeskripsikan badan yang sama dari sudut berbeda:
 * Organization untuk identitas korporat dan induknya, LocalBusiness untuk
 * tempat yang bisa didatangi beserta teleponnya.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.legalName,
    url: SITE_URL,
    telephone: COMPANY.phone,
    address: COMPANY.offices.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.street,
      addressLocality: office.city,
      ...(office.postalCode ? { postalCode: office.postalCode } : {}),
      addressRegion: office.province,
      addressCountry: "ID",
    })),
  };
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/lib/seo/json-ld.test.ts`
Expected: PASS.

- [ ] **Step 5: Pasang di halaman yang memakainya**

Pelajaran dari `jobPostingJsonLd` yang dihapus Plan 8 tetap berlaku: builder yang tidak dipanggil siapa pun adalah kode mati. Keduanya dipanggil di plan yang sama dengan kelahirannya.

Di `src/app/(site)/bisnis/transportasi-bbm/page.tsx`, tambahkan impor `serviceJsonLd`, lalu di dalam komponen, di dekat `trail` yang sudah ada:

```tsx
  const service = serviceJsonLd({
    name: "Transportasi BBM",
    description: line?.summary ?? "",
    path: "/bisnis/transportasi-bbm",
  });
```

dan satu `<script>` tambahan di dekat script breadcrumb yang sudah ada:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(service) }}
      />
```

Lakukan hal yang sama di `src/app/(site)/bisnis/penumpang-roro/page.tsx`, dengan `name: "Penyeberangan Ro-Ro"` dan `path: "/bisnis/penumpang-roro"`.

Di `src/app/(site)/layout.tsx`, tambahkan impor `localBusinessJsonLd` lalu satu `<script>` tambahan di sebelah script `organizationJsonLd` yang sudah ada:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdString(localBusinessJsonLd()),
          }}
        />
```

- [ ] **Step 6: Verifikasi lewat validator, bukan lewat pembacaan kode**

```bash
bun run build && bun run start &
sleep 8
/usr/bin/curl -s http://localhost:3000/bisnis/transportasi-bbm | grep -c '"@type":"Service"'
/usr/bin/curl -s http://localhost:3000/ | grep -c '"@type":"LocalBusiness"'
kill %1
```
Expected: `1` dan `1`.

Lalu tempel HTML beranda ke https://validator.schema.org dan periksa hasilnya dengan mata.

**Kalau validator mengeluhkan duplikasi entitas** antara `Organization` dan `LocalBusiness`, cadangannya sudah ditentukan di muka oleh spec bagian 5.4 dan tidak perlu dibahas ulang: pindahkan `localBusinessJsonLd()` dari `src/app/(site)/layout.tsx` ke `src/app/(site)/kontak/page.tsx`, tempat kedua alamat kantor memang jadi isi halaman, dan biarkan root hanya membawa `Organization`. Catat pilihan itu di pesan commit.

- [ ] **Step 7: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/lib/seo/json-ld.ts dml-web/src/lib/seo/json-ld.test.ts \
        "dml-web/src/app/(site)/bisnis/transportasi-bbm/page.tsx" \
        "dml-web/src/app/(site)/bisnis/penumpang-roro/page.tsx" \
        "dml-web/src/app/(site)/layout.tsx"
git commit -m "feat: JSON-LD Service dan LocalBusiness

Dua dari lima jenis yang diminta master spec bagian 12 dan tidak pernah
dibangun sepanjang delapan plan. Keduanya dipanggil di halaman nyata
dalam commit yang sama dengan kelahirannya; pelajaran jobPostingJsonLd
yang dihapus Plan 8 sebagai kode mati masih berlaku.

areaServed sengaja kosong. Cakupan wilayah yang tepat tidak ada di
company profile, dan menebaknya di data terstruktur yang dibaca mesin
lebih buruk daripada tidak menyebutnya.

Hasilnya diperiksa lewat validator schema.org, bukan disimpulkan dari
kode yang terlihat wajar."
```

---

## Fase C — Pengerasan

### Task 17: Error boundary

Situs ini tidak punya `error.tsx` maupun `global-error.tsx` sama sekali. Error render yang tidak tertangkap hari ini memberi layar error default Next: halaman putih dengan teks generik berbahasa Inggris.

**Files:**
- Create: `src/app/(site)/error.tsx`
- Create: `src/app/(site)/error.test.tsx`
- Create: `src/app/global-error.tsx`
- Create: `src/app/(site)/uji-galat/page.tsx`
- Create: `tests/e2e/error-boundary.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Produces: dua boundary. Keduanya menampilkan `error.digest` tapi **tidak pernah** `error.message`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/app/(site)/error.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./error";

describe("error boundary halaman publik", () => {
  it("menampilkan pesan bahasa Indonesia, bukan layar default Next", () => {
    render(<ErrorBoundary error={new Error("rahasia")} reset={() => {}} />);
    expect(screen.getByRole("heading", { name: /ada yang salah/i })).toBeInTheDocument();
  });

  it("tidak pernah membocorkan pesan error ke pengunjung", () => {
    // Pesan error Next bisa memuat path berkas dan detail internal.
    render(<ErrorBoundary error={new Error("rahasia")} reset={() => {}} />);
    expect(screen.queryByText(/rahasia/)).toBeNull();
  });

  it("menampilkan digest supaya pengunjung bisa mengutipnya", () => {
    const error = Object.assign(new Error("x"), { digest: "abc123" });
    render(<ErrorBoundary error={error} reset={() => {}} />);
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it("tombol coba lagi memanggil reset", async () => {
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("x")} reset={reset} />);
    await userEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("menyediakan jalan keluar ke beranda", () => {
    render(<ErrorBoundary error={new Error("x")} reset={() => {}} />);
    expect(screen.getByRole("link", { name: /beranda/i })).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test "src/app/(site)/error.test.tsx"`
Expected: FAIL, modul `./error` belum ada.

- [ ] **Step 3: Implementasi boundary halaman publik**

Buat `src/app/(site)/error.tsx`:

```tsx
"use client";

import Link from "next/link";

/**
 * Boundary untuk seluruh halaman publik. Ia tetap berada di dalam layout
 * situs, jadi header dan footer bertahan dan pengunjung tidak terdampar di
 * halaman tanpa navigasi.
 *
 * error.message TIDAK ditampilkan. Pesan error Next bisa memuat path berkas
 * dan detail internal. digest justru dirancang untuk dikutip pengunjung ke
 * tim teknis, jadi itu yang ditampilkan.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1400px] flex-col items-center justify-center px-4 py-16 text-center md:px-8">
      <p className="font-mono text-sm text-ink-muted">Galat</p>
      <h1 className="mt-2 font-display text-pretty text-3xl font-bold text-ink md:text-4xl">
        Ada yang salah di halaman ini
      </h1>
      <p className="mt-3 max-w-[50ch] text-ink-muted">
        Kami sudah mencatatnya. Coba muat ulang halaman ini, atau kembali ke beranda.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-ink-muted">Kode: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test "src/app/(site)/error.test.tsx"`
Expected: PASS, 5 tes.

- [ ] **Step 5: Implementasi boundary root**

Buat `src/app/global-error.tsx`:

```tsx
"use client";

import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Boundary untuk error yang terjadi DI DALAM root layout itu sendiri. Ia
 * wajib merender <html> dan <body> sendiri, karena layout yang gagal tidak
 * sempat menyediakan keduanya. Bentuknya sengaja mengikuti not-found.tsx,
 * yang punya kendala yang persis sama.
 *
 * Ia tidak bisa memakai SiteHeader atau SiteFooter: keduanya hidup di dalam
 * layout yang barusan gagal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 text-center text-ink">
        <p className="font-mono text-sm text-ink-muted">Galat</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Situs sedang bermasalah
        </h1>
        <p className="mt-3 max-w-[45ch] text-ink-muted">
          Coba muat ulang beberapa saat lagi.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-ink-muted">Kode: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Route uji yang hanya hidup saat pengujian**

Boundary yang ada tapi tidak pernah terbukti menangkap sama saja dengan tidak ada. Buat `src/app/(site)/uji-galat/page.tsx`:

```tsx
import { notFound } from "next/navigation";

/**
 * Route ini ada semata-mata supaya error-boundary.spec.ts punya sesuatu yang
 * benar-benar melempar. Di luar pengujian ia 404, jadi ia tidak pernah
 * terjangkau pengunjung.
 *
 * force-dynamic disengaja: tanpa itu halaman ini diprerender saat build dan
 * nilai env dibekukan ke nilai saat build, sehingga saklarnya tidak bisa
 * dinyalakan dari konfigurasi Playwright. Ia juga sengaja TIDAK masuk
 * STATIC_PATHS di sitemap.ts.
 */
export const dynamic = "force-dynamic";

export default async function UjiGalatPage() {
  if (process.env.E2E_UJI_GALAT !== "1") notFound();
  throw new Error("Galat sengaja untuk menguji error boundary.");
}
```

Di `playwright.config.ts`, tambahkan env pada `webServer`:

```ts
  webServer: {
    command: "bun run build && bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { ...process.env, E2E_UJI_GALAT: "1" } as Record<string, string>,
  },
```

- [ ] **Step 7: Spec e2e**

Buat `tests/e2e/error-boundary.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("boundary menangkap error dan tetap menampilkan navigasi situs", async ({ page }) => {
  await page.goto("/uji-galat");
  await expect(page.getByRole("heading", { name: /Ada yang salah di halaman ini/ })).toBeVisible();
  // Boundary duduk di dalam layout (site), jadi header dan footer bertahan.
  // Pengunjung yang kena error tidak terdampar tanpa navigasi.
  await expect(page.getByRole("navigation").first()).toBeVisible();
});

test("boundary tidak membocorkan pesan error internal", async ({ page }) => {
  await page.goto("/uji-galat");
  await expect(page.locator("body")).not.toContainText("Galat sengaja untuk menguji");
});

test("tombol kembali ke beranda bekerja", async ({ page }) => {
  await page.goto("/uji-galat");
  await page.getByRole("link", { name: /Kembali ke beranda/ }).click();
  await expect(page).toHaveURL(/\/$/);
});
```

- [ ] **Step 8: Jalankan spec**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run test:e2e tests/e2e/error-boundary.spec.ts
```
Expected: 3 lolos.

- [ ] **Step 9: Buktikan route uji itu mati di luar pengujian**

```bash
bun run build && bun run start &
sleep 8
/usr/bin/curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/uji-galat
kill %1
```
Expected: `404`. `bun run start` tanpa `E2E_UJI_GALAT` adalah persis kondisi produksi.

- [ ] **Step 10: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 11: Commit**

```bash
git add "dml-web/src/app/(site)/error.tsx" "dml-web/src/app/(site)/error.test.tsx" \
        dml-web/src/app/global-error.tsx "dml-web/src/app/(site)/uji-galat/page.tsx" \
        dml-web/tests/e2e/error-boundary.spec.ts dml-web/playwright.config.ts
git commit -m "feat: error boundary untuk halaman publik dan root layout

Sebelum ini, error render yang tidak tertangkap memberi layar default
Next: halaman putih berbahasa Inggris. Boundary halaman publik duduk di
dalam layout (site) sehingga header dan footer bertahan; global-error
merender html dan body sendiri karena layout yang gagal tidak sempat
menyediakannya.

Keduanya menampilkan digest, tidak pernah error.message: pesan error
Next bisa memuat path berkas dan detail internal.

Route uji melempar hanya saat E2E_UJI_GALAT=1 dan 404 di luar itu.
Boundary yang tidak pernah terbukti menangkap sama saja dengan tidak
ada."
```

---

### Task 18: Paku lokasi upload Payload

Koleksi `media` tidak menyetel `staticDir`, dan belum pernah ada satu pun upload sehingga direktorinya belum lahir. Artinya lokasi penyimpanan hari ini adalah default Payload yang belum pernah diamati siapa pun di repo ini.

Di container, upload yang mendarat di lokasi yang tidak dipetakan ke volume hilang setiap redeploy, dan hilangnya senyap: admin melihat upload berhasil, gambar tampil, lalu dua minggu kemudian seluruh cover artikel jadi rusak.

**Files:**
- Modify: `src/payload/collections/Media.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `Media.upload.staticDir` bernilai path absolut yang diturunkan dari `PAYLOAD_UPLOAD_DIR` dengan default lokal. Task 21 dan 22 memetakan volume ke path itu.

- [ ] **Step 1: Amati dulu, jangan menebak**

Urutannya penting. Menebak path lalu memakunya menghasilkan konfigurasi yang terlihat benar dan salah.

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
find . -newer package.json -type d -name media -not -path "./node_modules/*" -not -path "./.next/*"
bun run dev
```

Di browser, buka `/admin`, login dengan kredensial seed, masuk ke koleksi Media, unggah satu gambar apa pun. Lalu di terminal lain:

```bash
find . -type f -newermt '-5 minutes' -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | head -20
```

Catat direktori tempat berkasnya benar-benar mendarat. **Itu** yang jadi acuan, bukan tebakan.

- [ ] **Step 2: Paku path**

Di `src/payload/collections/Media.ts`, tambahkan impor dan `staticDir`:

```ts
import path from "node:path";
```

```ts
  upload: {
    /**
     * Dipaku eksplisit sejak Plan 9. Sebelumnya koleksi ini memakai default
     * Payload, dan tidak ada satu pun berkas yang pernah diunggah sehingga
     * lokasinya tidak pernah diamati siapa pun.
     *
     * Di container, upload yang mendarat di luar volume hilang tiap
     * redeploy, dan hilangnya senyap: unggah berhasil, gambar tampil, lalu
     * dua minggu kemudian seluruh cover artikel rusak.
     *
     * BUKAN public/media/. Direktori itu milik pipeline aset kurasi
     * (alur-sts, bisnis, hari, lini-bisnis) yang isinya dikomit ke git.
     * Upload admin bersifat runtime dan tidak pernah dikomit; menyatukan
     * keduanya membuat `git status` kotor tiap kali klien mengunggah gambar.
     */
    staticDir: process.env.PAYLOAD_UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads"),
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 1080 },
    ],
    mimeTypes: ["image/*"],
  },
```

Tambahkan ke `.env.example`:

```bash
# Direktori tempat Payload menyimpan berkas upload. Di container, path ini
# WAJIB menunjuk volume persisten, kalau tidak seluruh gambar artikel hilang
# tiap redeploy. Kosongkan untuk memakai ./uploads saat pengembangan lokal.
PAYLOAD_UPLOAD_DIR=
```

Tambahkan ke `.gitignore`:

```
# upload runtime Payload, tidak pernah dikomit
/uploads/
```

- [ ] **Step 3: Buktikan berkas mendarat di tempat yang benar**

```bash
rm -rf uploads
bun run dev
```

Unggah satu gambar lagi lewat `/admin`, lalu:

```bash
ls uploads
git status --short
```
Expected: berkas ada di `uploads/`, dan `git status` **bersih** dari berkas itu.

- [ ] **Step 4: Buktikan gambar lama tidak hilang**

Seed sudah pernah mengunggah tiga cover ke lokasi default lama. Jalankan ulang untuk memindahkannya:

```bash
docker compose down -v
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run payload migrate
bun run seed
bun run build && bun run start &
sleep 8
/usr/bin/curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/artikel
kill %1
```
Expected: `200`, dan `uploads/` berisi tiga berkas cover.

`docker compose down -v` menghapus volume Postgres pengembangan beserta seluruh isinya. Itu aman di mesin pengembangan, dan **tidak boleh** dijalankan di mana pun selain itu.

- [ ] **Step 5: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/payload/collections/Media.ts dml-web/.env.example dml-web/.gitignore
git commit -m "fix: paku lokasi upload Payload ke direktori yang bisa dipetakan volume

Koleksi media tidak pernah menyetel staticDir, dan tidak pernah ada
upload sehingga lokasinya tidak pernah diamati siapa pun. Path-nya
diamati langsung lewat upload sungguhan lebih dulu, baru dipaku.

Bukan public/media: direktori itu milik pipeline aset kurasi yang
isinya dikomit. Upload admin bersifat runtime, dan menyatukan keduanya
membuat git status kotor tiap kali klien mengunggah gambar."
```

---

### Task 19: Tutup dua TODO yang targetnya sudah ada

**Task ini tidak ada di spec.** Ia ditemukan saat plan ini ditulis, lewat sapuan `grep -rn "TODO" src/`, dan masuk karena permintaan pemilik repo berbunyi "semua bagian yang belum selesai". Dua baris ini persis itu: pekerjaan yang menunggu sesuatu yang sekarang sudah ada.

Plan 8 membangun `/bisnis/transportasi-bbm/permintaan-informasi`, tapi dua TODO yang menunggu halaman itu tidak ikut ditutup. Keduanya masih menunjuk `/kontak`.

**Files:**
- Modify: `src/features/home/hero-copy.tsx`
- Modify: `src/features/home/cta-section.tsx`
- Modify: `src/features/home/hero.test.tsx`

- [ ] **Step 1: Periksa asersi yang ada**

```bash
grep -n "kontak\|Permintaan Informasi" src/features/home/hero.test.tsx
```

Catat baris mana yang menegaskan href CTA BBM. Baris itu ikut berubah di Step 3.

- [ ] **Step 2: Arahkan CTA hero ke halaman yang kini ada**

Di `src/features/home/hero-copy.tsx`, ganti dua baris di kepala berkas:

```tsx
// Halaman tujuan dibangun Plan 8. Label CTA-nya sudah "Permintaan Informasi
// BBM" sejak awal, jadi ini bukan perubahan desain, melainkan penutupan TODO
// yang menunggu halamannya ada.
const CTA_BBM_HREF = "/bisnis/transportasi-bbm/permintaan-informasi";
```

- [ ] **Step 3: Sesuaikan tesnya**

Perbarui asersi href di `src/features/home/hero.test.tsx` supaya menunjuk `/bisnis/transportasi-bbm/permintaan-informasi`. Kalau tidak ada asersi href untuk CTA itu, tambahkan satu:

```tsx
  it("CTA BBM menunjuk halaman permintaan informasi, bukan kontak umum", () => {
    // Ditutup di Plan 9 setelah Plan 8 membangun halamannya. Label CTA-nya
    // memang sudah "Permintaan Informasi BBM" sejak Plan 4.
    render(<Hero />);
    expect(
      screen.getByRole("link", { name: /Permintaan Informasi BBM/i }),
    ).toHaveAttribute("href", "/bisnis/transportasi-bbm/permintaan-informasi");
  });
```

- [ ] **Step 4: Selesaikan TODO di seksi CTA penutup**

Di `src/features/home/cta-section.tsx`, TODO-nya menyarankan mengarahkan tombol ke form B2B. **Jangan lakukan itu.** Judul seksinya berbunyi "Siap membahas kebutuhan pengangkutan **atau penyeberangan** Anda?", dan tombolnya berlabel "Hubungi Kami". Mengarahkan CTA umum dua lini ke form yang khusus satu lini mempersempit halaman penjualan tanpa diminta siapa pun.

Yang benar adalah menghapus TODO-nya dan mencatat kenapa tujuannya tetap `/kontak`:

```tsx
        {/*
          Tetap ke /kontak, dan TODO lamanya dicabut di Plan 9. Halaman
          permintaan informasi B2B memang sudah ada sejak Plan 8, tapi ia
          khusus lini BBM, sementara judul seksi ini menyebut pengangkutan
          DAN penyeberangan. CTA umum yang mendarat di form satu lini
          mempersempit halaman penjualan. Jalur B2B punya pintunya sendiri di
          hero dan di halaman lini.
        */}
        <CtaLink href="/kontak">Hubungi Kami</CtaLink>
```

- [ ] **Step 5: Buktikan tidak ada TODO usang yang tersisa**

```bash
grep -rn "TODO\|FIXME" src/ | grep -v node_modules
```
Expected: nol baris. Kalau masih ada, ia bukan bagian task ini kecuali targetnya sudah tersedia; laporkan, jangan diam-diam menutupnya.

- [ ] **Step 6: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 7: Commit**

```bash
git add dml-web/src/features/home/hero-copy.tsx dml-web/src/features/home/cta-section.tsx \
        dml-web/src/features/home/hero.test.tsx
git commit -m "fix: tutup dua TODO yang menunggu halaman permintaan informasi

Plan 8 membangun halamannya, tapi kedua TODO yang menantinya tidak ikut
ditutup dan keduanya masih mendarat di /kontak.

CTA hero diarahkan ke halaman itu; labelnya memang sudah 'Permintaan
Informasi BBM' sejak Plan 4, jadi ini penutupan TODO, bukan perubahan
desain.

CTA penutup beranda sengaja TETAP ke /kontak meski TODO-nya menyarankan
sebaliknya: judul seksinya menyebut pengangkutan dan penyeberangan,
sementara form itu khusus BBM. Alasannya ditulis di tempat TODO-nya
berdiri."
```

---

## Fase D — Deployment

Master spec bagian 15, seluruhnya belum ada. Situs hari ini tidak bisa dideploy ke mana pun.

### Task 20: `output: 'standalone'`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Catat ukuran dasar sebelum berubah**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run build
du -sh .next
```
Catat angkanya. Ia jadi pembanding di Step 3.

- [ ] **Step 2: Implementasi**

Ganti `next.config.ts`:

```ts
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
```

- [ ] **Step 3: Build dan periksa keluarannya**

```bash
bun run build
ls .next/standalone
du -sh .next/standalone
```
Expected: `.next/standalone` ada dan memuat `server.js` plus `node_modules`. Ukurannya jauh lebih kecil daripada `.next` penuh.

- [ ] **Step 4: Jalankan server standalone secara langsung**

Ini menjalankan persis berkas yang akan masuk container, bukan `next start`.

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
node .next/standalone/server.js &
sleep 5
for path in / /artikel /bisnis /admin; do
  printf "%s -> " "$path"
  /usr/bin/curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path"
done
kill %1
```
Expected: empat kali `200`. `/admin` adalah yang paling penting: kalau ia gagal di sini, importMap Payload tidak ikut tertelusur, dan itu harus dibereskan sekarang, bukan setelah Dockerfile menyembunyikan gejalanya di balik lapisan container.

Dua salinan manual di atas (`static` dan `public`) memang dituntut `standalone` dan bukan bug. Dockerfile di Task 21 melakukannya sebagai langkah `COPY` tersendiri.

- [ ] **Step 5: Gerbang**

Run: `bun run lint && bun run typecheck && bun run test`

- [ ] **Step 6: Commit**

```bash
git add dml-web/next.config.ts
git commit -m "build: output standalone untuk image container yang ramping

Diverifikasi dengan menjalankan .next/standalone/server.js langsung,
bukan next start, dan /admin ikut diperiksa: Payload memuat config saat
runtime sementara standalone menelusuri berkas, dan importMap admin
adalah yang paling mungkin luput dari telusur itu."
```

---

### Task 21: Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Interfaces:**
- Produces: dua target build. `builder` memuat seluruh `node_modules` dan dipakai job migrasi di Task 22. `runner` adalah image aplikasi yang ramping.

- [ ] **Step 1: `.dockerignore` lebih dulu**

Tanpa berkas ini, `node_modules` dan `.next` lokal ikut terkirim ke daemon Docker, membuat build lambat dan hasilnya bergantung pada isi mesin yang membangun.

Buat `.dockerignore` di `dml-web/`:

```
node_modules
.next
.git
.env
.env.*
!.env.example
uploads
test-results
.lighthouseci
*.tsbuildinfo
```

- [ ] **Step 2: Dockerfile**

Buat `Dockerfile` di `dml-web/`:

```dockerfile
# syntax=docker/dockerfile:1

# Versi bun dipaku ke nilai packageManager di package.json. Membiarkannya
# mengambang berarti image produksi dan mesin pengembangan bisa memakai
# resolver dependency yang berbeda.
FROM oven/bun:1.3.14-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_SITE_URL dibaca SAAT BUILD, bukan saat runtime: metadataBase
# dan absoluteUrl memakainya, dan nilai NEXT_PUBLIC_ diinlinekan ke bundle.
# Menyerahkannya sebagai environment variable runtime saja menghasilkan
# seluruh canonical dan URL gambar OG menunjuk localhost di produksi,
# sementara situsnya sendiri tetap terlihat normal.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN bun run build

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Dijalankan sebagai pengguna non-root. Direktori upload dibuat dan
# dimilikinya SEBELUM container start, kalau tidak upload pertama gagal
# dengan galat izin yang terbaca seperti bug Payload.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs \
 && mkdir -p /app/uploads \
 && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PAYLOAD_UPLOAD_DIR=/app/uploads
EXPOSE 3000

CMD ["bun", "server.js"]
```

- [ ] **Step 3: Build image**

```bash
docker build --target runner -t dml-web:uji \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 .
```
Expected: sukses.

Kalau build gagal di `bun run build` karena tidak bisa menghubungi database, itu **bukan kegagalan Dockerfile**: sejak Task 8 beranda melakukan query artikel. Build butuh Postgres yang terjangkau dari dalam container build. Jalankan build dengan `--network host` sementara, atau naikkan stack compose Task 22 lebih dulu lalu build dengan jaringan yang sama. Catat cara yang dipakai; ia masuk runbook di Task 23.

- [ ] **Step 4: Periksa ukuran dan isi image**

```bash
docker images dml-web:uji --format "{{.Size}}"
docker run --rm dml-web:uji ls -la /app
docker run --rm dml-web:uji ls /app/.next/static | head
```
Expected: `server.js`, `.next/static`, `public`, dan `uploads` semuanya ada.

- [ ] **Step 5: Periksa sharp benar-benar bisa jalan di image**

`sharp` adalah dependency native, dan Payload memakainya untuk resize tiap upload. Kalau pustaka sistemnya tidak ada, upload gagal dengan pesan yang menyesatkan.

```bash
docker run --rm dml-web:uji bun -e "const sharp = require('sharp'); console.log(sharp.versions);"
```
Expected: mencetak versi tanpa error. Kalau gagal memuat, tambahkan pustaka sistem yang dibutuhkan ke stage `runner` lewat `apt-get install`, jangan mengganti `sharp` dengan alternatif.

- [ ] **Step 6: Commit**

```bash
git add dml-web/Dockerfile dml-web/.dockerignore
git commit -m "build: Dockerfile multi-stage bun untuk Next standalone

NEXT_PUBLIC_SITE_URL jadi build arg, bukan env runtime. Nilai
NEXT_PUBLIC_ diinlinekan ke bundle saat build; menyerahkannya sebagai
env runtime saja membuat seluruh canonical dan URL gambar OG menunjuk
localhost di produksi sementara situsnya tetap terlihat normal.

Direktori upload dibuat dan dimiliki user non-root sebelum start, kalau
tidak upload pertama gagal dengan galat izin yang terbaca seperti bug
Payload. Stage builder sengaja dipertahankan sebagai target tersendiri;
job migrasi memakainya."
```

---

### Task 22: Compose produksi dan migrasi

**Penyimpangan dari spec bagian 7.4, dengan alasannya.** Spec menulis entrypoint yang menjalankan `payload migrate` lalu menyerahkan proses ke server Next. Plan ini memakai **job migrasi satu kali dari stage `builder`**, dan aplikasi menunggunya selesai. Alasannya: `output: 'standalone'` dari Task 20 sengaja **tidak** menyertakan CLI Payload beserta devDependency-nya, jadi entrypoint di image runner akan memanggil perintah yang tidak ada di sana. Menemukan itu saat deploy adalah waktu terburuk.

Kedua sifat yang dituntut spec tetap dipenuhi, dan justru lebih tegas: migrasi berjalan **non-interaktif**, dan kegagalannya **keras**. Aplikasi tidak pernah naik di atas skema yang gagal dimigrasikan, karena `depends_on` menuntut job migrasi keluar dengan status nol.

**Files:**
- Create: `docker-compose.prod.yml`

- [ ] **Step 1: Tulis compose produksi**

Buat `docker-compose.prod.yml` di `dml-web/`. Ia terpisah dari `docker-compose.yml` yang ada, yang perannya tetap menjalankan Postgres untuk pengembangan dan **tidak berubah**.

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 2s
      timeout: 5s
      retries: 30
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # Job satu kali, bukan service yang hidup terus. Ia dibangun dari stage
  # builder karena di sanalah CLI Payload beserta seluruh node_modules
  # tersedia; image runner sengaja tidak memuatnya.
  #
  # Migrasi non-interaktif dan gagal keras. push:false di payload.config.ts
  # sudah mencegah lahirnya baris batch:-1 yang membuat migrate() berhenti
  # di prompt konfirmasi dan menggantung selamanya di proses non-TTY.
  # Jangan melemahkan itu dari sini.
  migrate:
    build:
      context: .
      target: builder
      args:
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    command: ["bun", "run", "payload", "migrate"]
    environment:
      DATABASE_URI: ${DATABASE_URI}
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  app:
    build:
      context: .
      target: runner
      args:
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    restart: unless-stopped
    environment:
      DATABASE_URI: ${DATABASE_URI}
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      TRUSTED_PROXY_HOPS: ${TRUSTED_PROXY_HOPS}
      PAYLOAD_UPLOAD_DIR: /app/uploads
    volumes:
      # Inilah satu-satunya alasan Task 18 ada. Tanpa pemetaan ini, seluruh
      # gambar artikel hilang tiap redeploy, dan hilangnya senyap.
      - payload-uploads:/app/uploads
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully

volumes:
  postgres-data:
  payload-uploads:
```

- [ ] **Step 2: Berkas environment produksi**

Compose di atas membaca variabel dari `.env` di direktori yang sama. Tambahkan bagian ini ke `.env.example`:

```bash
# --- Khusus docker-compose.prod.yml ---
# Compose membaca nilai-nilai ini dari .env di dml-web/. Jangan memakai
# kredensial pengembangan di sini.
POSTGRES_USER=dml
POSTGRES_PASSWORD=ganti-dengan-sandi-panjang-yang-acak
POSTGRES_DB=dml
```

Catat di komentar bahwa `DATABASE_URI` untuk compose produksi memakai nama service, bukan `localhost`:

```bash
# Di dalam compose produksi, host-nya nama service, bukan localhost:
# DATABASE_URI=postgres://dml:SANDI@postgres:5432/dml
```

- [ ] **Step 3: Naikkan stack**

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs migrate
```
Expected: `migrate` berstatus `exited (0)`, `postgres` dan `app` berjalan.

- [ ] **Step 4: Buktikan migrasi gagal keras**

Ini menguji sifat yang paling penting dan paling mudah dianggap benar tanpa dicoba.

```bash
docker compose -f docker-compose.prod.yml down
DATABASE_URI=postgres://salah:salah@postgres:5432/dml \
  docker compose -f docker-compose.prod.yml up -d --build 2>&1 | tail -5
docker compose -f docker-compose.prod.yml ps app
```
Expected: `migrate` keluar non-nol dan `app` **tidak pernah naik**. Kalau `app` tetap naik, `depends_on` tidak bekerja dan aplikasi bisa hidup di atas skema yang salah. Betulkan sebelum lanjut.

Kembalikan `.env` ke nilai yang benar dan naikkan ulang setelah pengujian.

- [ ] **Step 5: Commit**

```bash
git add dml-web/docker-compose.prod.yml dml-web/.env.example
git commit -m "build: compose produksi dengan volume upload dan migrasi gagal-keras

Menyimpang dari spec 7.4 yang menulis entrypoint pemanggil payload
migrate. Alasannya: output standalone sengaja tidak menyertakan CLI
Payload, jadi entrypoint di image runner memanggil perintah yang tidak
ada di sana, dan itu baru ketahuan saat deploy.

Job migrasi satu kali dibangun dari stage builder, dan app menunggunya
keluar dengan status nol. Kedua sifat yang dituntut spec tetap dipenuhi
dan justru lebih tegas: non-interaktif, dan aplikasi tidak pernah naik
di atas skema yang gagal dimigrasikan.

Volume payload-uploads dipetakan ke PAYLOAD_UPLOAD_DIR dari Task 18.
Itu satu-satunya alasan task itu ada."
```

---

### Task 23: Bukti deployment, runbook, dan gerbang penuh

Fase D **tidak** dianggap selesai karena image berhasil dibuild.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Jalankan rangkaian tujuh langkah**

Dari repo bersih, dengan `.env` produksi terisi:

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
sleep 20
docker compose -f docker-compose.prod.yml ps
```

**Langkah 3, sembilan route publik:**

```bash
for path in / /tentang-kami /bisnis /bisnis/transportasi-bbm /bisnis/penumpang-roro \
            /bisnis/transportasi-bbm/permintaan-informasi /karier /kontak /artikel; do
  printf "%s -> " "$path"
  /usr/bin/curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path"
done
```
Expected: sembilan `200`.

**Langkah 4, upload dan publish lewat browser sungguhan.** Buka `http://localhost:3000/admin`. Database ini kosong karena `down -v`, jadi Payload menawarkan `create-first-user`; buat akun. Lalu unggah satu gambar ke koleksi Media, buat satu artikel dengan cover itu, dan ubah statusnya jadi published.

**Langkah 5, muncul tanpa rebuild:**

```bash
/usr/bin/curl -s http://localhost:3000/artikel | grep -c "<JUDUL ARTIKEL YANG BARU DIBUAT>"
/usr/bin/curl -s http://localhost:3000/ | grep -c "<JUDUL ARTIKEL YANG BARU DIBUAT>"
```
Expected: `1` dan `1`, tanpa build ulang apa pun di antaranya. Ini membuktikan revalidasi bekerja di produksi, bukan cuma di dev.

**Langkah 6 dan 7, gambar bertahan melewati restart:**

```bash
/usr/bin/curl -s http://localhost:3000/artikel | grep -o '/api/media/file/[^"]*' | head -1
docker compose -f docker-compose.prod.yml restart app
sleep 15
/usr/bin/curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000<PATH GAMBAR DARI PERINTAH DI ATAS>"
```
Expected: `200`. **Ini asersi yang menentukan seluruh fase D.** Kalau `404`, `staticDir` dan volume tidak bertemu, dan Task 18 beserta Task 22 harus diperiksa ulang sebelum apa pun dianggap selesai.

Catat seluruh hasil. Angka-angka ini masuk pesan commit.

- [ ] **Step 2: Runbook di README**

Tambahkan bagian baru sebelum "Menukar placeholder sertifikasi dengan logo resmi":

```markdown
## Deployment

Aplikasi dibungkus image Docker multi-stage berbasis bun, memakai keluaran
`standalone` Next. Coolify menjalankan `docker-compose.prod.yml`.

### Yang wajib diisi

Compose membaca `.env` di `dml-web/`. Yang berbeda dari pengembangan:

- `NEXT_PUBLIC_SITE_URL` adalah **build arg**, bukan sekadar env runtime.
  Nilai `NEXT_PUBLIC_` diinlinekan ke bundle saat build. Menyetelnya hanya
  sebagai env runtime menghasilkan seluruh canonical dan URL gambar OG
  menunjuk localhost, sementara situsnya sendiri tetap terlihat normal. Kalau
  domain berubah, **image harus dibangun ulang**, bukan cuma di-restart.
- `DATABASE_URI` memakai nama service `postgres`, bukan `localhost`.
- `PAYLOAD_UPLOAD_DIR` diset compose ke `/app/uploads` dan dipetakan ke volume
  `payload-uploads`. Jangan mengubahnya tanpa mengubah pemetaan volumenya.

### Urutan deploy

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Service `migrate` berjalan lebih dulu sebagai job satu kali dan harus keluar
dengan status nol sebelum `app` naik. Kalau migrasi gagal, aplikasi tidak
pernah start. Itu perilaku yang disengaja: aplikasi yang hidup di atas skema
yang salah jauh lebih berbahaya daripada container yang menolak start dengan
log yang jelas.

### Seed pertama kali

Di instalasi baru, buka `/admin` dan buat akun pertama lewat
`create-first-user`, atau jalankan `bun run seed` dari dalam image builder
dengan `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` terisi.

### Backup volume upload

Basis data punya jalur backup sendiri lewat `pg_dump`. Upload tidak, dan ia
tidak pernah ada di git:

```bash
docker run --rm -v dml-web_payload-uploads:/data -v "$PWD":/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

### Pindah ke S3 kalau klien menyediakan bucket

**Ini dokumentasi, bukan jalur yang pernah dijalankan di repo ini.** Langkahnya:
pasang `@payloadcms/storage-s3`, daftarkan plugin-nya di `payload.config.ts`
dengan `collections: { media: true }`, isi kredensial bucket lewat environment,
lalu pindahkan isi volume `payload-uploads` ke bucket sebelum mematikan
pemetaan volumenya. Selama migrasi belum tuntas, jangan mencabut volumenya:
dokumen media menyimpan nama berkas, bukan isinya.
```

- [ ] **Step 3: Gerbang penuh**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run lint && bun run typecheck && bun run test && bun run build && bun run doctor
bun run lighthouse
bun run test:e2e
```

Expected: lint bersih, typecheck bersih, seluruh tes unit lolos, build sukses, `doctor` menyisakan **tepat satu** temuan yaitu pengecualian permanen `effect-needs-cleanup` (yang juga menghentikan rantai `&&`, sehingga lighthouse dijalankan terpisah), lighthouse lolos, seluruh spec e2e lolos.

- [ ] **Step 4: Buktikan tidak ada tautan internal yang mati**

```bash
bun run start &
sleep 8
for path in / /tentang-kami /bisnis /bisnis/transportasi-bbm /bisnis/penumpang-roro \
            /bisnis/transportasi-bbm/permintaan-informasi /karier /artikel /kontak; do
  printf "%s -> " "$path"
  /usr/bin/curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path"
done
printf "/uji-galat (diharapkan 404 di luar pengujian) -> "
/usr/bin/curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/uji-galat
kill %1
```
Expected: sembilan `200`, lalu `404`.

`/artikel` yang kini `200` adalah selisih yang paling berarti dari Plan 8: **tidak ada lagi satu pun item navigasi yang menunjuk halaman yang tidak ada.**

- [ ] **Step 5: Audit design dan SEO**

Jalankan skill `design-taste-frontend` dan `web-design-guidelines` terhadap permukaan baru (`/artikel`, `/artikel/[slug]`, seksi Artikel Terbaru, kedua boundary error), lalu `seo-audit` terhadap metadata, OG image, dan JSON-LD baru.

Perbaiki temuan yang murni mekanis. Temuan mana pun yang menyentuh keputusan desain **dibawa ke pemilik repo sebagai keputusan scope, tidak dikerjakan diam-diam**. Ini gerbang yang sama yang dipakai Plan 6 dan Plan 8, dan terbukti benar di keduanya.

- [ ] **Step 6: Commit**

```bash
git add dml-web/README.md
git commit -m "docs: runbook deployment dan penutupan Plan 9

Rangkaian tujuh langkah dijalankan penuh: sembilan route 200, upload dan
publish lewat browser sungguhan, artikel muncul di dua permukaan tanpa
rebuild, lalu restart container dan gambar upload MASIH ADA. Langkah
terakhir itu yang membuktikan staticDir dan volume benar-benar bertemu;
tanpa itu seluruh fase D cuma image yang berhasil dibuild.

Runbook mencatat NEXT_PUBLIC_SITE_URL sebagai build arg, bukan env
runtime, beserta akibatnya kalau salah tempat: seluruh canonical dan URL
gambar OG menunjuk localhost sementara situsnya terlihat normal.

Bagian S3 ditandai eksplisit sebagai dokumentasi, bukan jalur yang
pernah dijalankan.

Gerbang penuh hijau, dan tidak ada lagi item navigasi yang menunjuk
halaman yang tidak ada."
```

---

## Setelah plan ini

**Selesai seluruhnya:** seluruh route yang pernah dijanjikan master spec kini ada dan mengembalikan 200. Kelima jenis JSON-LD terpasang kecuali `JobPosting` yang menunggu data. OG image ada di seluruh permukaan. Error boundary terpasang di dua tingkat. Situs bisa dibangun jadi image dan dijalankan dengan upload yang bertahan melewati redeploy.

**Yang tetap terbuka, dan tidak satu pun bisa ditutup dari dalam repo:**

1. Tujuh butir yang menunggu klien, seperti tertulis di kepala plan ini dan di bagian 3 spec: fasilitas dan jadwal ro-ro, logo sertifikasi, status HSSE, selisih 64 vs 66 kapal, `OB Sahoya 0`, dimensi kapal, copy Visi dan Misi, logo "Trusted by".
2. **Review klien atas tiga artikel seed.** Baru sejak plan ini. Faktanya terverifikasi, kalimatnya susunan agen. Cara mencabutnya ada di README.
3. `JobPosting` JSON-LD di `/karier`, menunggu lowongan pertama.
4. Adapter S3, kalau klien menyediakan bucket. Prosedurnya sudah di README sebagai dokumentasi.
5. Rate limiter lintas instance. Yang ada in-memory per instance, dan begitu Coolify menjalankan lebih dari satu replika, batasnya jadi longgar sebanyak jumlah replika. Butuh Redis atau setara.
6. Merge `denis` ke `master`. Repo dipakai lebih dari satu orang dan `master` memuat commit yang belum ada di `denis`.
7. Konfigurasi Coolify itu sendiri: domain, TLS, dan variabel environment produksi. Compose dan runbook-nya siap; yang belum ada akses servernya.
