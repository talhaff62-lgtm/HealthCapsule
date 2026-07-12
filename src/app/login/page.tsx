"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid phone number or password.");
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <main className="flex min-h-[calc(100vh-64px-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-brand-gray bg-white p-8 shadow-sm">
        <h1
          className="text-center text-2xl font-semibold text-brand-navy"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Sign in to HealthCapsule
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Enter your phone number and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-brand-navy"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="mt-1 block w-full rounded-lg border border-brand-gray px-4 py-2 text-brand-navy outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-navy"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-lg border border-brand-gray px-4 py-2 text-brand-navy outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-status-error/10 px-4 py-2 text-sm text-status-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-teal px-4 py-2 font-medium text-white hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
