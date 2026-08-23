import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusinessInquiryForm } from "./business-inquiry-form";

vi.mock("./actions", () => ({
  submitInquiry: vi.fn(async () => ({ ok: true }) as const),
}));

describe("BusinessInquiryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan seluruh field wajib dengan label di atas input", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama perusahaan")).toBeInTheDocument();
    expect(screen.getByLabelText("Nomor telepon")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kebutuhan")).toBeInTheDocument();
  });

  it("memilih layanan sesuai defaultService", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="penumpang-roro" />);
    expect(screen.getByLabelText("Lini layanan")).toHaveValue("penumpang-roro");
  });

  it("input membawa autocomplete yang benar", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    expect(screen.getByLabelText("Nama")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Nama perusahaan")).toHaveAttribute("autocomplete", "organization");
    expect(screen.getByLabelText("Nomor telepon")).toHaveAttribute("autocomplete", "tel");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
  });

  it("menampilkan galat validasi di bawah input saat isian kosong", async () => {
    const user = userEvent.setup();
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    await user.click(screen.getByRole("button", { name: "Kirim permintaan" }));
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(await screen.findByText("Nama perusahaan wajib diisi")).toBeInTheDocument();
  });

  it("punya honeypot yang tersembunyi dari pembaca layar", () => {
    const { container } = render(
      <BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />,
    );
    const honeypot = container.querySelector("#business-website");
    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
