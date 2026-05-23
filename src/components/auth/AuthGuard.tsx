"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth/callback", "/terms", "/privacy"];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  const isPublic = PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname?.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublic) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname ?? "/")}`);
    }
  }, [isLoading, isAuthenticated, isPublic, router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm text-stone-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // On public routes, always render children
  if (isPublic) {
    return <>{children}</>;
  }

  // On protected routes, only render if authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return <>{children}</>;
}
