"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessInquirySchema, type BusinessInquiryInput } from "./schema";
import { submitInquiry } from "./actions";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const SERVICE_OPTIONS = [
  { value: "transportasi-bbm", label: "Transportasi BBM" },
  { value: "penumpang-roro", label: "Penyeberangan Ro-Ro" },
] as const;

export function BusinessInquiryForm({
  whatsappNumber,
  defaultService,
}: {
  whatsappNumber: string;
  defaultService: BusinessInquiryInput["service"];
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInquiryInput>({
    resolver: zodResolver(businessInquirySchema),
    defaultValues: { service: defaultService },
  });

  const onSubmit = async (data: BusinessInquiryInput) => {
    setFormError(null);
    // Jaring pengaman kedua, sama alasannya dengan ContactForm: actions.ts
    // sudah menangkap kegagalan Payload, tapi server action juga bisa gagal
    // sebelum kodenya sempat jalan.
    let result: Awaited<ReturnType<typeof submitInquiry>>;
    try {
      result = await submitInquiry(data, "permintaan-informasi-bbm");
    } catch (error) {
      console.error("submitInquiry gagal", error);
      setFormError("Permintaan gagal terkirim. Periksa koneksi lalu coba lagi.");
      return;
    }
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    const lines = [
      `Halo, saya ${data.name} dari ${data.company}.`,
      `Lini layanan: ${SERVICE_OPTIONS.find((option) => option.value === data.service)?.label}`,
      data.cargoType ? `Jenis muatan: ${data.cargoType}` : null,
      data.route ? `Rute: ${data.route}` : null,
      data.volume ? `Perkiraan volume: ${data.volume}` : null,
      data.message,
    ].filter(Boolean);
    window.location.assign(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`,
    );
  };

  if (sent) {
    return (
      <p role="status" className="text-ink">
        Permintaan tersimpan. Mengalihkan ke WhatsApp...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        id="business-name"
        label="Nama"
        autoComplete="name"
        register={register("name")}
        error={errors.name?.message}
      />
      <TextField
        id="business-company"
        label="Nama perusahaan"
        autoComplete="organization"
        register={register("company")}
        error={errors.company?.message}
      />
      <TextField
        id="business-phone"
        label="Nomor telepon"
        type="tel"
        autoComplete="tel"
        register={register("phone")}
        error={errors.phone?.message}
      />
      <TextField
        id="business-email"
        label="Email"
        type="email"
        autoComplete="email"
        register={register("email")}
        error={errors.email?.message}
      />

      <div>
        <label htmlFor="business-service" className="text-sm font-medium text-ink">
          Lini layanan
        </label>
        <select
          id="business-service"
          className="mt-2 w-full rounded-input border border-line bg-surface-2 px-4 py-2.5 text-ink transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          {...register("service")}
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.service?.message ? (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {errors.service.message}
          </p>
        ) : null}
      </div>

      <TextField
        id="business-cargo"
        label="Jenis muatan (opsional)"
        register={register("cargoType")}
        error={errors.cargoType?.message}
      />
      <TextField
        id="business-route"
        label="Rute (opsional)"
        register={register("route")}
        error={errors.route?.message}
      />
      <TextField
        id="business-volume"
        label="Perkiraan volume (opsional)"
        register={register("volume")}
        error={errors.volume?.message}
      />
      <TextField
        id="business-message"
        label="Kebutuhan"
        multiline
        register={register("message")}
        error={errors.message?.message}
      />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="business-website">Situs web</label>
        <input
          id="business-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <SubmitButton pending={isSubmitting} label="Kirim permintaan" pendingLabel="Mengirim..." />
    </form>
  );
}
