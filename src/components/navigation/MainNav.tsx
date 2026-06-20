"use client";

import { ScanLine, Hourglass, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/skin-age", label: "Skin Age", icon: Hourglass },
  { href: "/track", label: "Track", icon: TrendingUp },
];

export default function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/scan") {
      return pathname === href || pathname.startsWith("/scan/");
    }
    return pathname === href;
  };

  return (
    <div className="flex items-center gap-1 bg-stone-100/80 rounded-full p-1">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${active
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
