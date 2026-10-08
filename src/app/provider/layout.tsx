"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  UserCircle,
  Banknote,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/referrals", label: "Referrals", icon: Users },
  { href: "/provider/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/provider/clients", label: "Clients", icon: UserCircle },
  { href: "/provider/earnings", label: "Earnings", icon: Banknote },
];

function ProviderLogo() {
  return (
    <Link href="/provider/dashboard" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-semibold text-stone-900">SKINgenius</span>
        <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wide">
          Provider Portal
        </span>
      </div>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      )}
    >
      <Icon className="w-[18px] h-[18px]" />
      {label}
    </Link>
  );
}

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-[#E7E5E4] bg-white z-40">
        <div className="h-16 flex items-center px-5 border-b border-[#E7E5E4]">
          <ProviderLogo />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="p-4 border-t border-[#E7E5E4]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-semibold text-sm">
              PS
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-stone-900">PLEIJ Salon</p>
              <p className="text-xs text-stone-500">Licensed Esthetician</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E7E5E4]">
        <div className="h-14 px-4 flex items-center justify-between">
          <ProviderLogo />
          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14 bg-white">
          <nav className="p-4 space-y-1">
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} onClick={() => setMobileOpen(false)} />
            ))}
          </nav>
          <div className="p-4 border-t border-[#E7E5E4]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-semibold text-sm">
                PS
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-stone-900">PLEIJ Salon</p>
                <p className="text-xs text-stone-500">Licensed Esthetician</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
