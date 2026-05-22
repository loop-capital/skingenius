"use client";

import { useState } from "react";
import {
  Camera,
  Shield,
  Sparkles,
  ChevronRight,
  Star,
  FlaskConical,
  Leaf,
  Award,
  ArrowRight,
  Play,
  Lock,
} from "lucide-react";

export default function Page() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFBF5]/85 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-stone-900 tracking-tight">
              SKINgenius
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              How It Works
            </a>
            <a href="#science" className="hover:text-emerald-700 transition-colors">
              The Science
            </a>
            <a href="#ingredients" className="hover:text-emerald-700 transition-colors">
              Ingredients
            </a>
            <a href="#pricing" className="hover:text-emerald-700 transition-colors">
              Pricing
            </a>
          </div>
          <button className="px-5 py-2.5 bg-emerald-700 text-white text-sm font-medium rounded-xl hover:bg-emerald-800 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold tracking-wide uppercase mb-8">
              <Award className="w-4 h-4" />
              Medical-Grade AI
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.05] tracking-tight mb-6">
              Your skin,{" "}
              <span className="text-emerald-700">understood.</span>
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              AI-powered skin analysis that actually works on{" "}
              <strong className="text-stone-900">every skin tone</strong>.
              Dermatologist-grade insights. Personalized product recommendations
              backed by clinical research.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={() => window.location.href = '/scan'} className="px-8 py-4 bg-emerald-700 text-white text-base font-semibold rounded-2xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer">
                <Camera className="w-5 h-5" />
                Scan Your Skin
              </button>
              <button className="px-8 py-4 bg-white text-stone-900 text-base font-medium rounded-2xl border border-stone-200 hover:border-stone-300 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 text-emerald-700" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  "bg-amber-100",
                  "bg-stone-200",
                  "bg-amber-200",
                  "bg-stone-300",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${bg} border-2 border-white`}
                  />
                ))}
              </div>
              <div className="text-sm text-stone-600">
                <span className="font-semibold text-stone-900">2,400+</span>{" "}
                scans completed
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-stone-500 ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Brand Consultant + Scan Preview */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/10">
              <img
                src="/assets/brand-consultant.jpg"
                alt="SKINgenius AI Consultant"
                className="w-full aspect-[3/4] object-cover"
              />
              {/* Emerald overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent" />

              {/* Scan UI overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-64 rounded-full border-2 border-white/40 animate-pulse" />
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">
                  Your AI Consultant
                </p>
                <p className="text-white text-xl font-semibold">
                  Professional-grade analysis,
                  <br />
                  personalized for your skin.
                </p>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -right-4 top-12 bg-white rounded-2xl shadow-lg p-4 border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Fitzpatrick Type</p>
                  <p className="text-sm font-semibold text-stone-900">
                    IV — Detected
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-32 bg-white rounded-2xl shadow-lg p-4 border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Confidence</p>
                  <p className="text-sm font-semibold text-stone-900">
                    94% — T-Zone Analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm text-stone-500">
          {[
            { icon: Shield, text: "Works on all skin tones (Fitzpatrick I–VI)" },
            { icon: FlaskConical, text: "Clinically validated ingredients" },
            { icon: Leaf, text: "No brand affiliations" },
            { icon: Lock, text: "Privacy-first — photos never stored" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-emerald-700" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-4">
              How It Works
            </p>
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-4">
              Three steps to understanding your skin
            </h2>
            <p className="text-stone-600 text-lg">
              Our AI analyzes 7 dimensions of your skin in under 60 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Scan your face",
                desc: "Our AI maps your face from 7 angles, detecting Fitzpatrick type, pore density, dark spots, and more — works on every skin tone.",
              },
              {
                step: "02",
                icon: FlaskConical,
                title: "Get clinical insights",
                desc: "Every finding includes severity rating, confidence score, and ingredient recommendations backed by peer-reviewed research.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Shop your routine",
                desc: "Products matched to your exact skin profile. No brand bias — only what your skin actually needs.",
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-stone-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold text-emerald-700 tracking-wider">
                    {step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">
                  {title}
                </h3>
                <p className="text-stone-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredient Safety Spectrum */}
      <section id="ingredients" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-4">
                Ingredient Safety
              </p>
              <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-6">
                Every ingredient rated. Every recommendation explained.
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-8">
                Our proprietary Safety Spectrum classifies every ingredient on a
                4-point scale — so you know exactly what you're putting on your
                skin and why.
              </p>

              {/* Safety Spectrum Visual */}
              <div className="space-y-3">
                {[
                  {
                    color: "bg-green-200",
                    label: "Gentle",
                    desc: "Suitable for all skin types",
                  },
                  {
                    color: "bg-blue-200",
                    label: "Moderate",
                    desc: "Generally safe, patch test recommended",
                  },
                  {
                    color: "bg-amber-200",
                    label: "Active",
                    desc: "Potent — start slowly",
                  },
                  {
                    color: "bg-red-200",
                    label: "Clinical",
                    desc: "Professional-grade, guidance recommended",
                  },
                ].map(({ color, label, desc }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className={`w-16 h-8 rounded-full ${color}`}
                    />
                    <div>
                      <span className="text-sm font-semibold text-stone-900">
                        {label}
                      </span>
                      <span className="text-sm text-stone-500 ml-2">
                        — {desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredient Card Examples */}
            <div className="space-y-4">
              {[
                {
                  name: "Niacinamide",
                  pct: "5%",
                  safety: "Gentle",
                  color: "bg-green-100 text-green-800",
                  benefit: "Reduces pores, evens tone",
                },
                {
                  name: "Retinol",
                  pct: "0.3%",
                  safety: "Active",
                  color: "bg-amber-100 text-amber-800",
                  benefit: "Accelerates cell turnover",
                },
                {
                  name: "Salicylic Acid",
                  pct: "2%",
                  safety: "Moderate",
                  color: "bg-blue-100 text-blue-800",
                  benefit: "Clears congested pores",
                },
              ].map(({ name, pct, safety, color, benefit }, i) => (
                <div
                  key={i}
                  className="bg-[#FFFBF5] rounded-2xl p-6 border border-stone-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-stone-900">
                        {name}
                      </h4>
                      <p className="text-sm text-stone-500">{benefit}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-semibold text-emerald-700">
                        {pct}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}
                  >
                    {safety}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scan Preview Section */}
      <section id="science" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-4">
            AI Skin Analysis
          </p>
          <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-6">
            See what the scanner sees
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto mb-12">
            Our AI maps 847+ data points across 7 facial zones, detecting
            Fitzpatrick type, pore density, dark spots, texture, oil production,
            fine lines, and pigmentation.
          </p>

          {/* Scan Mockup */}
          <div className="max-w-md mx-auto bg-[#0C0F0A] rounded-3xl p-8 shadow-2xl">
            <div className="aspect-square rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 flex items-center justify-center relative overflow-hidden">
              {/* Face outline */}
              <div className="w-40 h-56 rounded-full border border-white/30 relative">
                {/* Wireframe dots */}
                {[
                  "top-8 left-1/2 -translate-x-1/2",
                  "top-16 left-8",
                  "top-16 right-8",
                  "top-24 left-1/2 -translate-x-1/2",
                  "top-32 left-12",
                  "top-32 right-12",
                  "top-40 left-1/2 -translate-x-1/2",
                ].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full bg-emerald-400 ${pos}`}
                  />
                ))}
              </div>

              {/* Status text */}
              <div className="absolute bottom-6 left-0 right-0">
                <p className="text-white/60 text-sm mb-1">
                  ● Scanning...
                </p>
                <p className="text-emerald-400 text-xs">
                  Fitzpatrick IV detected — 82% confidence
                </p>
              </div>

              {/* Progress ring */}
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs font-mono">
                    67%
                  </span>
                </div>
              </div>
            </div>

            {/* Scan stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Data Points", value: "847" },
                { label: "Zones", value: "7" },
                { label: "Angles", value: "7" },
              ].map(({ label, value }, i) => (
                <div key={i} className="text-center">
                  <p className="text-emerald-400 font-mono text-lg font-semibold">
                    {value}
                  </p>
                  <p className="text-stone-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
            Ready to understand your skin?
          </h2>
          <p className="text-emerald-100 text-lg mb-10">
            Free scan. No commitment. No brand bias.
            <br />
            Just your skin, understood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.location.href = '/scan'} className="px-8 py-4 bg-white text-emerald-700 text-base font-semibold rounded-2xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Camera className="w-5 h-5" />
              Start Free Scan
            </button>
            <button className="px-8 py-4 bg-emerald-600 text-white text-base font-medium rounded-2xl border border-emerald-500 hover:bg-emerald-500 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">
                  SKINgenius
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Medical-grade AI skin analysis. Works on every skin tone.
                No brand affiliations.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Skin Scan", "Ingredient Database", "Routines", "Shop"],
              },
              {
                title: "Science",
                links: [
                  "Fitzpatrick Scale",
                  "Safety Spectrum",
                  "Research",
                  "Clinical Studies",
                ],
              },
              {
                title: "Company",
                links: ["About", "Privacy", "Terms", "Contact"],
              },
            ].map(({ title, links }, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm hover:text-emerald-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-stone-800 text-sm text-stone-500">
            © 2026 SKINgenius. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}


