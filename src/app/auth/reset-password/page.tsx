"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/auth/update-password` }
        );

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setSent(true);
      } catch {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, supabase]
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-stone-900 tracking-tight">
          SKINgenius
        </span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
              Reset password
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              Enter your email and we’ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-stone-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-stone-200 focus-visible:ring-emerald-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              We sent a password reset link to {email}.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link
            href="/login"
            className="inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
