"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

export function TextField({
  id,
  label,
  type = "text",
  autoComplete,
  multiline = false,
  register,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  const fieldClassName =
    [
      "w-full rounded-input bg-surface-2 px-4 py-2.5 text-ink transition-colors",
      "placeholder:text-ink-muted",
      // border-line, bukan border-surface-3: tepi input adalah batas kontrol dan
      // wajib 3:1 terhadap latarnya. surface-3 dipakai untuk garis pembatas
      // dekoratif, yang tidak terikat aturan itu.
      error ? "border border-danger" : "border border-line hover:border-accent",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    ].join(" ");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          autoComplete={autoComplete}
          className={`mt-2 ${fieldClassName}`}
          {...register}
        />
      ) : (
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          className={`mt-2 ${fieldClassName}`}
          {...register}
        />
      )}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
