"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
