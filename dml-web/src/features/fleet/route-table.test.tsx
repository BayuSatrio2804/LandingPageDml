import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RouteTable } from "./route-table";
import { ROUTE_LEGS } from "@/features/route-map/ports";

describe("RouteTable", () => {
  it("menampilkan kelima lintasan", () => {
    render(<RouteTable />);
    for (const leg of ROUTE_LEGS) {
      expect(screen.getByText(leg.label)).toBeInTheDocument();
    }
  });

  it("menyebut PT Tri Sumaja Lines sebagai operator Merak-Bakauheni", () => {
    render(<RouteTable />);
    const row = screen.getByText("Merak - Bakauheni").closest("tr");
    expect(row).not.toBeNull();
    // Kolom operator, bukan kolom lintasan: catatan di kolom pertama juga
    // menyebut "Tri Sumaja Lines", jadi query mesti menunjuk sel ketiga saja.
    const cells = within(row as HTMLElement).getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("PT Tri Sumaja Lines");
  });

  it("menyebut DML sebagai operator Ketapang-Gilimanuk", () => {
    render(<RouteTable />);
    const row = screen.getByText("Ketapang - Gilimanuk").closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement).getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("Dutabahari Menara Line");
  });

  it("menampilkan kapal yang melayani tiap lintasan", () => {
    render(<RouteTable />);
    const row = screen.getByText("Ketapang - Gilimanuk").closest("tr");
    // String persis, bukan regex: "KMP Jambo VI" adalah substring dari
    // "KMP Jambo VIII", jadi regex tanpa jangkar mencocokkan keduanya.
    expect(within(row as HTMLElement).getByText("KMP Jambo VI")).toBeInTheDocument();
  });

  it("pembungkusnya bisa digulir dengan keyboard", () => {
    render(<RouteTable />);
    const region = screen.getByRole("region", { name: /lintasan/i });
    expect(region).toHaveAttribute("tabindex", "0");
  });
});
