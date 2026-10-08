"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  FileCheck,
  FlaskConical,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/manufacturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manufacturer/providers", label: "Providers", icon: Stethoscope },
  { href: "/manufacturer/leads", label: "Leads", icon: Users },
  { href: "/manufacturer/certifications", label: "Certifications", icon: FileCheck },
];

export function ManufacturerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-[#E7E5E4] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-base font-semibold text-stone-900">SKINgenius</span>
          <span className="block text-xs text-stone-500">Manufacturer Portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#E7E5E4] p-3">
        <Link
          href="/manufacturer/login"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#E7E5E4] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
            <FlaskConical className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900">Manufacturer Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always on desktop, slide-over on mobile */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 w-64 transform border-r border-[#E7E5E4] bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}

export function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FFFBF5]">
      <ManufacturerSidebar />
      <main className="flex-1 pt-16 lg:ml-64 lg:pt-0">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
