"use client";

import { UVData, SUNSCREEN_OPTIONS } from "@/types/lifestyle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Shield, AlertTriangle } from "lucide-react";

interface UVStepProps {
  data: UVData;
  onChange: (data: UVData) => void;
}

export function UVStep({ data, onChange }: UVStepProps) {
  const update = <K extends keyof UVData>(key: K, value: UVData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Sun className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">UV Exposure</h2>
        <p className="text-stone-500 mt-1">
          Sun exposure is the #1 cause of premature skin aging.
        </p>
      </div>

      {/* Daily sun exposure */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-600" />
            How many minutes are you in direct sunlight on a typical day?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={300}
              step={15}
              value={data.dailySunExposure}
              onChange={(e) => update("dailySunExposure", parseInt(e.target.value))}
              className="flex-1 h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <span className="text-lg font-semibold text-amber-700 w-20 text-right">
              {data.dailySunExposure}m
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>0m</span>
            <span>2h</span>
            <span>5h</span>
          </div>
        </CardContent>
      </Card>

      {/* Sunscreen usage */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            How often do you wear sunscreen?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SUNSCREEN_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => update("sunscreenUsage", option.value as UVData["sunscreenUsage"])}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  data.sunscreenUsage === option.value
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-stone-200 text-stone-600 hover:border-amber-200"
                }`}
              >
                <div>
                  <span className="text-sm font-medium block">{option.label}</span>
                  <span className="text-xs text-stone-400">{option.desc}</span>
                </div>
                {data.sunscreenUsage === option.value && (
                  <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SPF level */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            What SPF do you typically use?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={data.spfLevel}
              onChange={(e) => update("spfLevel", parseInt(e.target.value))}
              className="flex-1 h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <span className="text-lg font-semibold text-amber-700 w-20 text-right">
              SPF {data.spfLevel}
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>None</span>
            <span>SPF 50</span>
            <span>SPF 100</span>
          </div>
        </CardContent>
      </Card>

      {/* Tanning bed */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Do you use tanning beds?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => update("tanningBed", option.value)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  data.tanningBed === option.value
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
