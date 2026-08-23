import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/*
 * submitInquiry di-mock supaya tes ini menguji satu hal saja: apa yang
 * dilihat pengguna ketika server action gagal. Sebelum Plan 6 jawabannya
 * "tidak ada apa-apa" — action melempar saat Postgres mati, promise onSubmit
 * menolak, react-hook-form tidak menangkapnya, dan tombol yang ditekan tidak
 * menghasilkan pesan apa pun. kontak.spec.ts menggagalkan itu lewat timeout,
 * yang terbaca seperti masalah lingkungan padahal cacat perilaku.
 */
const submitInquiry = vi.hoisted(() => vi.fn());
vi.mock("./actions", () => ({ submitInquiry }));

import { ContactForm } from "./contact-form";

async function isiFormYangSah(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nama"), "Budi Santoso");
  await user.type(screen.getByLabelText("Nomor telepon"), "+6281234567890");
  await user.type(screen.getByLabelText("Email"), "budi@example.com");
  await user.type(screen.getByLabelText("Pesan"), "Saya ingin bertanya soal pengangkutan BBM.");
  await user.click(screen.getByRole("button", { name: /kirim pesan/i }));
}

describe("ContactForm saat server action gagal", () => {
  it("menampilkan pesan galat ketika action melempar", async () => {
    submitInquiry.mockRejectedValueOnce(new Error("cannot connect to Postgres"));
    const user = userEvent.setup();
    render(<ContactForm whatsappNumber="625116773845" />);

    await isiFormYangSah(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(/gagal|coba lagi/i);
  });

  it("menampilkan pesan galat ketika action mengembalikan ok:false", async () => {
    submitInquiry.mockResolvedValueOnce({ ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." });
    const user = userEvent.setup();
    render(<ContactForm whatsappNumber="625116773845" />);

    await isiFormYangSah(user);

    expect(await screen.findByRole("alert")).toHaveTextContent("Terlalu banyak percobaan");
  });
});
