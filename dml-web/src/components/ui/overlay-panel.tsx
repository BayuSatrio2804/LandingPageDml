/**
 * Panel scrim untuk teks yang duduk di atas foto. Latar surface-2 90 persen
 * adalah bagian yang menjamin kontras; backdrop-blur cuma kosmetik dan tidak
 * boleh jadi satu-satunya lapisan, karena browser yang menolak backdrop-filter
 * akan menyisakan teks di atas foto telanjang.
 *
 * Props sisanya diteruskan apa adanya supaya pemanggil bisa menempelkan
 * data-testid dan atribut ARIA tanpa membungkusnya lagi dengan div tambahan.
 */
export function OverlayPanel({
  children,
  align = "start",
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & {
  align?: "start" | "center";
}) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div
      {...rest}
      className={`rounded-card border border-surface-3 bg-surface-2/90 p-6 backdrop-blur-sm md:p-8 ${alignment} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
