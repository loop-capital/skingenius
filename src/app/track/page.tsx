"use client";

import { TrendingUp } from "lucide-react";

export default function TrackPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-stone-900 tracking-tight">SKINgenius</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Track Progress</h1>
        <p className="text-stone-600 leading-relaxed">Monitor your skin health over time and see how your routine is working.</p>
      </header>

      <main className="flex-1 px-6 pb-8 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <TrendingUp className="w-10 h-10 text-emerald-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-stone-900">Coming Soon</h2>
            <p className="text-stone-500 leading-relaxed">
              Progress tracking is under development. Soon you'll be able to:
            </p>
            <ul className="text-left text-sm text-stone-600 space-y-2 mt-4 bg-stone-50 rounded-2xl p-5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Log daily skin condition ratings
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Track product usage and effectiveness
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Compare before/after photos over time
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                Get personalized routine adjustments
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <a
              href="/scan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition-colors"
            >
              Start a Scan
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
