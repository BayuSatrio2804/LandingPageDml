"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

export function TextField({
  id,
  label,
  type = "text",
  multiline = false,
  register,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  multiline?: boolean;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  const fieldClassName =
    "w-full rounded-input border border-surface-3 bg-surface-2 px-4 py-2.5 text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={4} className={`mt-2 ${fieldClassName}`} {...register} />
      ) : (
        <input id={id} type={type} className={`mt-2 ${fieldClassName}`} {...register} />
      )}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
