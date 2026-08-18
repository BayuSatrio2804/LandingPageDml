"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "./schema";
import { submitInquiry } from "./actions";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ContactForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({ resolver: zodResolver(inquirySchema) });

  const onSubmit = async (data: InquiryInput) => {
    setFormError(null);
    const result = await submitInquiry(data, "kontak");
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    const message = `Halo, saya ${data.name}. ${data.message}`;
    window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
  };

  if (sent) {
    return (
      <p role="status" className="text-ink">
        Pesan tersimpan. Mengalihkan ke WhatsApp...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField id="name" label="Nama" register={register("name")} error={errors.name?.message} />
      <TextField
        id="phone"
        label="Nomor telepon"
        type="tel"
        register={register("phone")}
        error={errors.phone?.message}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        register={register("email")}
        error={errors.email?.message}
      />
      <TextField
        id="message"
        label="Pesan"
        multiline
        register={register("message")}
        error={errors.message?.message}
      />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Situs web</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <SubmitButton pending={isSubmitting} label="Kirim pesan" pendingLabel="Mengirim..." />
    </form>
  );
}
