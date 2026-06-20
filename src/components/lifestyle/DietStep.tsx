"use client";

import { DietData, SUGAR_OPTIONS, DAIRY_OPTIONS, PROCESSED_OPTIONS } from "@/types/lifestyle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Cookie, Milk, Package } from "lucide-react";

interface DietStepProps {
  data: DietData;
  onChange: (data: DietData) => void;
}

export function DietStep({ data, onChange }: DietStepProps) {
  const update = <K extends keyof DietData>(key: K, value: DietData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Cookie className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Diet</h2>
        <p className="text-stone-500 mt-1">
          What you eat directly impacts your skin's clarity and aging.
        </p>
      </div>

      {/* Water intake */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-600" />
            How many glasses of water do you drink per day?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={data.waterIntake}
              onChange={(e) => update("waterIntake", parseInt(e.target.value))}
              className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-lg font-semibold text-emerald-700 w-16 text-right">
              {data.waterIntake}
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>0</span>
            <span>6</span>
            <span>12</span>
          </div>
        </CardContent>
      </Card>

      {/* Sugar consumption */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Cookie className="w-4 h-4 text-emerald-600" />
            How would you describe your sugar intake?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SUGAR_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => update("sugarConsumption", option.value as DietData["sugarConsumption"])}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  data.sugarConsumption === option.value
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-stone-200 text-stone-600 hover:border-emerald-200"
                }`}
              >
                <div>
                  <span className="text-sm font-medium block">{option.label}</span>
                  <span className="text-xs text-stone-400">{option.desc}</span>
                </div>
                {data.sugarConsumption === option.value && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
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

      {/* Dairy consumption */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Milk className="w-4 h-4 text-emerald-600" />
            How much dairy do you consume?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DAIRY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => update("dairyConsumption", option.value as DietData["dairyConsumption"])}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  data.dairyConsumption === option.value
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-stone-200 text-stone-600 hover:border-emerald-200"
                }`}
              >
                <div>
                  <span className="text-sm font-medium block">{option.label}</span>
                  <span className="text-xs text-stone-400">{option.desc}</span>
                </div>
                {data.dairyConsumption === option.value && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
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

      {/* Processed food */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            How often do you eat processed or fast food?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PROCESSED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => update("processedFood", option.value as DietData["processedFood"])}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  data.processedFood === option.value
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-stone-200 text-stone-600 hover:border-emerald-200"
                }`}
              >
                <div>
                  <span className="text-sm font-medium block">{option.label}</span>
                  <span className="text-xs text-stone-400">{option.desc}</span>
                </div>
                {data.processedFood === option.value && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
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
    </div>
  );
}
