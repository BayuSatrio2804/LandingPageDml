import Link from "next/link";
import { TIMELINE } from "@/content/timeline";
import { LineagePan } from "@/features/timeline/lineage-pan";

export function Lineage() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">Silsilah</h2>
      </div>
      <div className="mt-12">
        <LineagePan entries={TIMELINE} />
      </div>
      <div className="mx-auto mt-8 max-w-[1400px] px-4 md:px-8">
        <Link href="/tentang-kami#silsilah" className="text-sm font-medium text-accent hover:text-accent-hover">
          Lihat silsilah lengkap
        </Link>
      </div>
    </section>
  );
}
