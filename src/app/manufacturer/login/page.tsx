"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FlaskConical, Eye, EyeOff } from "lucide-react";

export default function ManufacturerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manufacturer@skingenius.demo");
  const [password, setPassword] = useState("demo");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Mock auth: accept any email + password combination
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    router.push("/manufacturer/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#E7E5E4] bg-white shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-stone-900">
            Manufacturer Portal
          </CardTitle>
          <CardDescription className="text-stone-500">
            Sign in to manage certified providers, leads, and certification programs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manufacturer@skingenius.demo"
                className="h-11 rounded-xl border-[#E7E5E4] bg-white focus-visible:ring-emerald-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="h-11 rounded-xl border-[#E7E5E4] bg-white pr-10 focus-visible:ring-emerald-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-semibold"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-stone-50 p-4 text-center">
            <p className="text-sm text-stone-500">
              Mock credentials: any email and password will work for this MVP.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
