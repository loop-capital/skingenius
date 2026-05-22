"use client";

import { ScanProvider } from "@/lib/scan/ScanContext";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScanProvider>
      <div className="min-h-[100dvh] bg-[#FFFBF5] flex flex-col">
        {children}
      </div>
    </ScanProvider>
  );
}
