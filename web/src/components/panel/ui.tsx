"use client";

import React from "react";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "outlineDanger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2";

    const variants = {
      primary: "bg-brand-navy text-white hover:bg-brand-navy-light",
      outline:
        "border border-brand-gray bg-white text-brand-navy hover:border-brand-sky hover:text-brand-sky-deep",
      danger: "bg-status-emergency text-white hover:bg-red-700",
      outlineDanger:
        "border border-status-emergency/60 bg-white text-status-emergency hover:bg-status-emergency-light",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-5 text-base",
    };

    const width = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, required, error, hint, className = "", id, ...inputProps }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-semibold text-brand-slate">
            {label}
            {required && <span className="text-status-emergency"> *</span>}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-brand-slate placeholder:text-brand-navy-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25 ${
            error ? "border-status-emergency" : "border-brand-gray"
          } ${className}`}
          {...inputProps}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-status-emergency">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-brand-muted">{hint}</p>
        ) : null}
      </label>
    );
  }
);
TextField.displayName = "TextField";

export interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(({ label, required, error, hint, className = "", id, ...textareaProps }, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-brand-slate">
          {label}
          {required && <span className="text-status-emergency"> *</span>}
        </span>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={`min-h-[96px] w-full rounded-xl border bg-white px-4 py-3 text-base text-brand-slate placeholder:text-brand-navy-muted/70 transition-colors focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/25 ${
          error ? "border-status-emergency" : "border-brand-gray"
        } ${className}`}
        {...textareaProps}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-status-emergency">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-brand-muted">{hint}</p>
      ) : null}
    </label>
  );
});
TextAreaField.displayName = "TextAreaField";

export function Card({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-brand-gray bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`font-serif text-xl font-semibold text-brand-navy ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  sub?: string;
  className?: string;
}

export function StatCard({ label, value, href, sub, className = "" }: StatCardProps) {
  const content = (
    <Card className={`group p-5 transition-colors hover:border-brand-sky ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{label}</Eyebrow>
        {href && (
          <ChevronRight className="h-4 w-4 text-brand-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand-navy" />
        )}
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold text-brand-navy tabular-nums xl:text-4xl">
        {value}
      </div>
      {sub && <p className="mt-1 text-xs text-brand-muted">{sub}</p>}
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
