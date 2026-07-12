"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Phone } from "lucide-react";

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
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brand-gray bg-white shadow-lg">
        <div className="bg-brand-navy px-8 py-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-white">
            Sign in to HealthCapsule
          </h1>
          <p className="mt-2 text-sm text-brand-navy-muted">
            Enter your phone number and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8">
          <div>
            <label
              htmlFor="phone"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              Phone
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wider text-brand-muted"
            >
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-brand-gray bg-white py-2.5 pl-10 pr-4 text-brand-slate outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-status-emergency-light/40 px-4 py-2 text-sm text-status-emergency">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-navy py-2.5 font-semibold text-white transition hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
