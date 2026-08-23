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
  // Bukan /\/admin(\/|$)/: pola itu juga cocok /admin/login sendiri, jadi
  // asersinya lolos seketika tanpa pernah menunggu redirect sungguhan.
  // Navigasi berikutnya berlomba melawan sesi yang belum tuntas terbentuk
  // dan terlempar balik ke halaman login.
  await expect(page).toHaveURL(/\/admin\/?$/);

  await page.goto("/admin/collections/posts/create");

  await page.getByRole("textbox", { name: "Title *" }).fill(JUDUL);
  await page.getByLabel("Slug").fill(SLUG);
  await page.getByLabel("Excerpt").fill("Artikel uji yang dibuat spec Playwright.");

  // Cover image memakai media yang sudah dibuat seed, bukan mengunggah
  // berkas baru: yang diuji di sini alur publikasi dan revalidasi, bukan
  // alur upload.
  // Drawer daftar Media di Payload 3.88 tidak punya tombol "Select" per
  // baris; memilih dilakukan dengan mengklik nama berkasnya langsung. Baris
  // itu sendiri dirender sebagai <button>, bukan <a>.
  await page.getByRole("button", { name: /choose from existing/i }).first().click();
  await page.getByRole("button", { name: /\.webp$/ }).first().click();

  await page.locator("#field-category .rs__control").click();
  await page.getByRole("option", { name: "Operasi", exact: true }).click();
  // DatePicker Payload memakai react-datepicker tanpa <label htmlFor>;
  // getByLabel tidak menjangkaunya. Formatnya MM/dd/yyyy (pickerAppearance
  // "default" bawaan field ini), bukan ISO.
  await page.locator("#field-publishedAt input").fill("08/23/2026");

  // Author juga wajib diisi (relationship->users, required:true). Field ini
  // memakai ReactSelect yang sama dengan Category, tapi opsinya dimuat async
  // dari API begitu combobox dibuka.
  await page.locator("#field-author .rs__control").click();
  await page.getByRole("option").first().click();

  await page.locator(".rich-text-lexical [contenteditable='true']").first()
    .fill("Isi artikel uji.");

  // Payload 3.88 dengan versions.drafts:true tidak punya field "Status"
  // bertipe <select>; publikasi dilakukan lewat tombol "Publish changes"
  // yang terlihat di panel Creating new Post.
  await page.getByRole("button", { name: /publish changes/i }).click();
  // Payload memakai "Post successfully created." (label lalu "successfully",
  // bukan urutan sebaliknya) untuk penyimpanan pertama sebuah dokumen baru,
  // baik lewat Publish maupun Save Draft.
  await expect(page.getByText(/successfully created/i)).toBeVisible();

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
  await expect(page).toHaveURL(/\/admin\/?$/);

  await page.goto("/admin/collections/posts/create");
  await page.getByRole("textbox", { name: "Title *" }).fill(`Draft ${STAMP}`);
  await page.getByLabel("Slug").fill(slugDraft);
  await page.getByLabel("Excerpt").fill("Draft yang tidak boleh tayang.");
  await page.getByRole("button", { name: /choose from existing/i }).first().click();
  await page.getByRole("button", { name: /\.webp$/ }).first().click();
  await page.locator("#field-category .rs__control").click();
  await page.getByRole("option", { name: "Operasi", exact: true }).click();
  // DatePicker Payload memakai react-datepicker tanpa <label htmlFor>;
  // getByLabel tidak menjangkaunya. Formatnya MM/dd/yyyy (pickerAppearance
  // "default" bawaan field ini), bukan ISO.
  await page.locator("#field-publishedAt input").fill("08/23/2026");
  await page.locator("#field-author .rs__control").click();
  await page.getByRole("option").first().click();
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
