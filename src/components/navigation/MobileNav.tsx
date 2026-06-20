"use client";

import { ScanLine, Hourglass, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/skin-age", label: "Skin Age", icon: Hourglass },
  { href: "/track", label: "Track", icon: TrendingUp },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/scan") {
      return pathname === href || pathname.startsWith("/scan/");
    }
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 px-4 py-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                ${active
                  ? "text-emerald-700"
                  : "text-stone-400 hover:text-stone-600"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
