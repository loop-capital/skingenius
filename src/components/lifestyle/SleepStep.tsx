"use client";

import { SleepData } from "@/types/lifestyle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Clock } from "lucide-react";

interface SleepStepProps {
  data: SleepData;
  onChange: (data: SleepData) => void;
}

export function SleepStep({ data, onChange }: SleepStepProps) {
  const update = <K extends keyof SleepData>(key: K, value: SleepData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Moon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Sleep</h2>
        <p className="text-stone-500 mt-1">
          Your skin repairs itself while you sleep. Let’s understand your rest.
        </p>
      </div>

      {/* Hours per night */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            How many hours do you sleep per night?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={data.hoursPerNight}
              onChange={(e) => update("hoursPerNight", parseFloat(e.target.value))}
              className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-lg font-semibold text-indigo-700 w-16 text-right">
              {data.hoursPerNight}h
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>4h</span>
            <span>7h</span>
            <span>10h</span>
          </div>
        </CardContent>
      </Card>

      {/* Sleep quality */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            How would you rate your sleep quality?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={data.sleepQuality}
              onChange={(e) => update("sleepQuality", parseInt(e.target.value))}
              className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-lg font-semibold text-indigo-700 w-16 text-right">
              {data.sleepQuality}/10
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>Poor</span>
            <span>Average</span>
            <span>Excellent</span>
          </div>
        </CardContent>
      </Card>

      {/* Sleep consistency */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Do you go to bed and wake up at the same time most days?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: true, label: "Yes, consistent" },
              { value: false, label: "No, varies" },
            ].map((option) => (
              <button
                key={String(option.value)}
                onClick={() => update("sleepConsistent", option.value)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  data.sleepConsistent === option.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:border-indigo-300"
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
