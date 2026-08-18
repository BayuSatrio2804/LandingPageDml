import { test, expect } from "@playwright/test";
import { TOKENS } from "../../src/lib/tokens";
import { hexToRgbString } from "./rgb";

const ACCENT = hexToRgbString(TOKENS.accent);
const INK = hexToRgbString(TOKENS.ink);

test("tidak ada elemen dengan latar aksen yang memakai teks ink", async ({
  page,
}) => {
  for (const path of ["/", "/kontak", "/tentang-kami", "/karier"]) {
    await page.goto(path);

    const violations = await page.evaluate(
      ({ accent, ink }) => {
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

        const bad: string[] = [];
        for (const el of Array.from(document.querySelectorAll("*"))) {
          const style = getComputedStyle(el);
          if (style.color === ink && effectiveBackgroundColor(el) === accent) {
            bad.push(el.tagName + "." + String(el.className));
          }
        }
        return bad;
      },
      { accent: ACCENT, ink: INK },
    );

    // Kombinasi ini 1,80:1 dan gagal WCAG AA. Lihat spec bagian 6.2.
    expect(violations, `route ${path}`).toEqual([]);
  }
});
