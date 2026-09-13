"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-fetch";
import { Card, TextField, Button } from "@/components/panel/ui";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await api<{ user: { role: string } }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.user.role === "ADMIN") {
        router.replace("/admin");
      } else if (response.user.role === "STAFF") {
        router.replace("/staff");
      } else {
        setError("This account does not have panel access.");
        setSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-cloud flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto">
        <Card className="p-8 sm:p-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-navy text-white grid place-items-center font-serif text-xl mb-4">
              H
            </div>
            <h1 className="text-2xl font-serif font-semibold text-brand-navy">
              Staff &amp; Admin Sign in
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="rounded-xl bg-status-emergency-light px-4 py-3 text-sm font-medium text-status-emergency">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
            >
              Sign in
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-xs text-brand-muted">
          Staff/admin accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}
