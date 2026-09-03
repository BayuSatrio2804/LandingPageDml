"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { ArticleCard } from "./article-card";
import type { ArticleCard as ArticleCardData, CategoryOption } from "./types";

/**
 * Penyaring, pencarian, dan tombol muat-lebih-banyak.
 *
 * Seluruh artikel terbit dikirim sekali dari server lalu disaring di klien.
 * Untuk jumlah artikel perusahaan (puluhan, bukan puluhan ribu) ini jauh lebih
 * enak dipakai daripada satu permintaan jaringan per ketikan — dan yang dikirim
 * hanya ringkasan kartu, bukan badan tulisan (lihat catatan di types.ts).
 *
 * Kalau jumlah artikel nanti tumbuh sampai ratusan, ganti bagian ini dengan
 * pencarian sisi server, bukan menambah halaman di klien.
 */
export function ArticleBrowser({
  articles,
  categories,
  pageSize,
}: {
  articles: ArticleCardData[];
  categories: CategoryOption[];
  pageSize: number;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("semua");
  const [shown, setShown] = useState(pageSize);

  // Menyaring saat mengetik cepat membuat kisi berkedip; useDeferredValue
  // menahan hasilnya satu bingkai tanpa menambah state debounce sendiri.
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return articles.filter((article) => {
      if (category !== "semua" && article.categorySlug !== category) return false;
      if (!needle) return true;
      return `${article.title} ${article.excerpt} ${article.categoryName}`
        .toLowerCase()
        .includes(needle);
    });
  }, [articles, category, deferredQuery]);

  const visible = filtered.slice(0, shown);

  const root = useSectionMotion<HTMLElement>(() => {
    // Kartu yang BARU muncul dianimasikan, yang sudah ada tidak: tanpa
    // penandaan ini setiap penekanan "Muat lebih banyak" menganimasikan ulang
    // seluruh kisi dan halaman terlihat berkedip.
    const fresh = Array.from(
      document.querySelectorAll<HTMLElement>("[data-article-grid] > *:not([data-shown])"),
    );
    if (!fresh.length) return;
    fresh.forEach((node) => {
      node.dataset.shown = "1";
    });
    gsap.fromTo(
      fresh,
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.055,
        clearProps: "transform,opacity,visibility",
      },
    );
  });

  const reset = () => {
    setQuery("");
    setCategory("semua");
    setShown(pageSize);
  };

  return (
    <section
      ref={root}
      aria-labelledby="browser-title"
      className="relative overflow-hidden bg-surface pt-4 pb-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(58%_62%_at_92%_6%,var(--color-surface-2)_0%,transparent_58%)]"
      />
      <div className="relative mx-auto max-w-350 px-8">
        <div className="flex items-end justify-between gap-6 border-b border-surface-3 pb-5.5 max-md:flex-col max-md:items-stretch">
          <div>
            <h2
              id="browser-title"
              className="m-0 font-display text-[clamp(1.35rem,2vw,1.75rem)] font-bold tracking-[-0.015em] text-ink"
            >
              Semua artikel
            </h2>
            <p aria-live="polite" className="mt-2 mb-0 font-mono text-xs text-ink-muted">
              {filtered.length === articles.length
                ? `${filtered.length} artikel`
                : `${filtered.length} dari ${articles.length} artikel`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <label htmlFor="cari-artikel" className="sr-only">
                Cari artikel
              </label>
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-4 -translate-y-1/2 text-[13px] text-line"
              >
                ⌕
              </span>
              <input
                id="cari-artikel"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShown(pageSize);
                }}
                placeholder="Cari judul atau ringkasan"
                className="w-67.5 rounded-full border border-surface-3 bg-surface-2 py-3 pr-4.5 pl-9 text-sm text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_rgb(24_49_99/0.12)] max-md:w-full"
              />
            </div>

            <div>
              <label htmlFor="saring-kategori" className="sr-only">
                Saring per kategori
              </label>
              <select
                id="saring-kategori"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setShown(pageSize);
                }}
                className="appearance-none rounded-full border border-surface-3 bg-surface-2 py-3 pr-9.5 pl-4.5 text-sm text-ink outline-none transition-colors focus:border-accent"
              >
                <option value="semua">Semua kategori</option>
                {categories.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <div
              data-article-grid=""
              className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6.5"
            >
              {visible.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {visible.length < filtered.length ? (
              <div className="mt-11 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShown((current) => current + pageSize)}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-accent bg-transparent px-7 py-3.25 text-sm font-medium text-accent transition-all hover:gap-4 hover:bg-accent hover:text-on-accent"
                >
                  Muat lebih banyak <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-9 rounded-[14px] border border-dashed border-surface-3 bg-surface-2 px-8 py-14 text-center">
            <p className="m-0 font-display text-[1.1rem] font-bold text-ink">
              Tidak ada artikel yang cocok
            </p>
            <p className="mt-3 mb-0 text-sm leading-[1.66] text-ink-muted">
              Coba kata kunci lain, atau kembalikan penyaring ke semua kategori.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 cursor-pointer rounded-full border border-accent bg-transparent px-6 py-2.75 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-on-accent"
            >
              Kembalikan penyaring
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
