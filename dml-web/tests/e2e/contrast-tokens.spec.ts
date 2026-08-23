import { test, expect } from "@playwright/test";
import { TOKENS } from "../../src/lib/tokens";
import { hexToRgbString } from "./rgb";

const ACCENT = hexToRgbString(TOKENS.accent);
const INK = hexToRgbString(TOKENS.ink);

// Dua warna ini, dan cuma dua ini, yang boleh jadi teks di atas bidang navy.
// on-accent 9,5:1 dan surface-3 6,6:1; keduanya lolos AA. Putih beropasitas
// tidak masuk daftar karena computed color-nya jadi rgba(...) dengan alpha,
// bukan salah satu dari dua nilai ini.
const ALLOWED_ON_ACCENT = [hexToRgbString(TOKENS.onAccent), hexToRgbString(TOKENS.surface3)];

const ROUTES = ["/", "/kontak", "/tentang-kami", "/karier"];

function collectOnAccent() {
  return ({ accent: accentColor }: { accent: string }) => {
    // background-color tidak diwariskan di CSS. Elemen berlatar transparan
    // di dalam kontainer beraksen tetap tampil di atas aksen secara visual,
    // jadi latar "efektif" ditelusuri lewat rantai leluhur, bukan cuma
    // dibaca dari elemen itu sendiri.
    function effectiveBackgroundColor(start: Element): string {
      let node: Element | null = start;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
        node = node.parentElement;
      }
      return "rgba(0, 0, 0, 0)";
    }

    // Hanya elemen yang benar-benar mencetak teks. Pembungkus tanpa teks
    // mewariskan warnanya ke bawah dan tidak pernah terlihat sendiri, jadi
    // memeriksanya cuma menghasilkan temuan palsu.
    function printsText(el: Element): boolean {
      return Array.from(el.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
      );
    }

    const found: { selector: string; color: string }[] = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      if (!printsText(el)) continue;
      if (effectiveBackgroundColor(el) !== accentColor) continue;
      found.push({
        selector: `${el.tagName}.${String(el.className)}`,
        color: getComputedStyle(el).color,
      });
    }
    return found;
  };
}

test("tidak ada teks ink di atas latar aksen", async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    const onAccent = await page.evaluate(collectOnAccent(), { accent: ACCENT });
    const violations = onAccent.filter((entry) => entry.color === INK).map((entry) => entry.selector);
    // Kombinasi ini 1,80:1 dan gagal WCAG AA. Lihat spec bagian 6.2.
    expect(violations, `route ${path}`).toEqual([]);
  }
});

// Sejak kaki halaman jadi bidang navy penuh, bahaya di atas aksen bukan lagi
// teks ink melainkan putih yang diredupkan. Pemeriksaan di atas tidak akan
// pernah menangkap itu: rgba putih 60 persen bukan warna ink. Yang di bawah
// ini membalik arah pemeriksaannya jadi daftar putih.
test("teks di atas latar aksen memakai warna yang lolos AA, bukan putih beropasitas", async ({
  page,
}) => {
  let checked = 0;
  for (const path of ROUTES) {
    await page.goto(path);
    const onAccent = await page.evaluate(collectOnAccent(), { accent: ACCENT });
    checked += onAccent.length;
    const violations = onAccent
      .filter((entry) => !ALLOWED_ON_ACCENT.includes(entry.color))
      .map((entry) => `${entry.selector} -> ${entry.color}`);
    expect(violations, `route ${path}`).toEqual([]);
  }

  // Tanpa ini, kedua pengujian di berkas ini akan tetap hijau seandainya
  // penelusuran latar rusak dan tidak pernah menemukan satu pun elemen.
  expect(checked, "tidak ada satu pun teks di atas latar aksen yang terperiksa").toBeGreaterThan(0);
});
