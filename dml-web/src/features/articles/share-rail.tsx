"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Channel = "whatsapp" | "linkedin" | "x" | "email" | "copy";

/**
 * Sinkron dari lokasi browser lewat useSyncExternalStore, bukan
 * useState+useEffect: menulis setState langsung di badan efek memicu render
 * berantai (react-hooks/set-state-in-effect), dan itu bukan sekadar aturan
 * linter kosong — pola sama dipakai usePrefersReducedMotion.ts untuk alasan
 * yang sama. Snapshot server sengaja string kosong, disamakan dengan markup
 * SSR, lalu URL asli menyusul begitu hidrasi selesai.
 */
function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function useCurrentUrl(): string {
  return useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => "",
  );
}

const MARKS: Record<Channel, { mark: string; label: string }> = {
  whatsapp: { mark: "WA", label: "Bagikan lewat WhatsApp" },
  linkedin: { mark: "in", label: "Bagikan ke LinkedIn" },
  x: { mark: "X", label: "Bagikan ke X" },
  email: { mark: "@", label: "Bagikan lewat surel" },
  copy: { mark: "⧉", label: "Salin tautan artikel" },
};

/**
 * Rel tombol bagikan yang menempel di samping tulisan.
 *
 * URL dibaca dari window setelah mount, bukan disusun dari env: berkas ini
 * dipakai di pratinjau Payload, di domain sementara, dan di domain produksi,
 * dan tautan bagikan yang menunjuk domain salah tidak akan pernah diperiksa
 * siapa pun sampai ada yang mengeluh.
 */
export function ShareRail({ title, channels }: { title: string; channels: Channel[] }) {
  const url = useCurrentUrl();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const enc = encodeURIComponent;
  const href = (channel: Channel) => {
    switch (channel) {
      case "whatsapp":
        return `https://wa.me/?text=${enc(`${title} ${url}`)}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
      case "x":
        return `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
      case "email":
        return `mailto:?subject=${enc(title)}&body=${enc(url)}`;
      default:
        return "#";
    }
  };

  const copy = async () => {
    // Clipboard API butuh konteks aman dan bisa ditolak pengguna. Tanpa
    // cadangan, tombolnya diam saja dan tidak ada cara tahu apakah berhasil.
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url || window.location.href);
      }
    } finally {
      setCopied(true);
    }
  };

  const button =
    "grid size-10 place-items-center rounded-full border border-accent-soft bg-surface-2 font-mono text-xs font-medium text-accent transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface";

  return (
    <div className="sticky top-26 flex h-max flex-col gap-2.5 max-lg:static max-lg:mb-7 max-lg:flex-row max-lg:items-center">
      <p className="mb-1 font-mono text-[9px] tracking-[0.18em] text-line uppercase max-lg:mb-0">
        Bagikan
      </p>
      {channels
        .filter((channel) => channel !== "copy")
        .map((channel) => (
          <a
            key={channel}
            href={href(channel)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={MARKS[channel].label}
            className={button}
          >
            {MARKS[channel].mark}
          </a>
        ))}
      {channels.includes("copy") ? (
        <>
          <button type="button" onClick={copy} aria-label={MARKS.copy.label} className={`${button} cursor-pointer`}>
            {MARKS.copy.mark}
          </button>
          <p aria-live="polite" className="m-0 font-mono text-[9px] leading-tight text-line">
            {copied ? "Tersalin" : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}
