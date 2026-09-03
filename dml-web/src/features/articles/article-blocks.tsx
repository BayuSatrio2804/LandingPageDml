import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Media, Post } from "@/payload/payload-types";

type Block = Post["content"][number];

/**
 * Merender blok isi artikel. Server component: tidak ada gerak, jadi tidak ada
 * alasan mengirimkannya ke klien.
 *
 * Setiap blok yang belum dikenal DIABAIKAN, bukan dilempar sebagai galat: kalau
 * suatu saat ada blok baru ditambahkan di Payload tetapi komponennya belum
 * dibuat, halaman tetap tampil dengan blok yang sudah didukung ketimbang mati
 * seluruhnya.
 */
export function ArticleBlocks({ blocks }: { blocks: Post["content"] }) {
  return (
    <>
      {(blocks ?? []).map((block, index) => (
        <ArticleBlock key={block.id ?? `${block.blockType}-${index}`} block={block} first={index === 0} />
      ))}
    </>
  );
}

function ArticleBlock({ block, first }: { block: Block; first: boolean }) {
  switch (block.blockType) {
    case "paragraph":
      return (
        <div
          className={`text-lg leading-[1.82] text-ink [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_p+p]:mt-6.5 [&_strong]:font-semibold ${
            first ? "" : "mt-6.5"
          }`}
        >
          <RichText data={block.text} />
        </div>
      );

    case "heading":
      return (
        <h2 className="mt-13 mb-0 font-display text-[clamp(1.4rem,2.2vw,1.85rem)] leading-[1.2] font-bold tracking-[-0.02em] text-ink text-pretty">
          {block.text}
        </h2>
      );

    case "quote":
      return (
        <blockquote className="mt-13 mb-0 border-l-3 border-accent py-1.5 pl-7">
          <p className="m-0 font-display text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.34] font-bold tracking-[-0.015em] text-accent text-pretty">
            {block.text}
          </p>
          {block.attribution ? (
            <cite className="mt-4 block font-mono text-[11px] tracking-[0.14em] text-line uppercase not-italic">
              {block.attribution}
            </cite>
          ) : null}
        </blockquote>
      );

    case "image": {
      // Relasi Payload mengembalikan angka saat depth 0 dan objek saat
      // depth lebih tinggi, sama seperti resolveMedia di article-list.tsx.
      const media =
        typeof block.image === "object" && block.image !== null ? (block.image as Media) : null;
      if (!media?.url) return null;
      return (
        <figure className="mt-11 mb-0">
          <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-hero-ground">
            <Image
              src={media.url}
              alt={media.alt ?? ""}
              fill
              sizes="(max-width: 1080px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3.5 font-mono text-[11px] leading-[1.6] text-line">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    default:
      return null;
  }
}
