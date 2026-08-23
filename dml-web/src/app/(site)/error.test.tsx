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
