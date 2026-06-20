"use client";

import { StressData, STRESS_TRIGGERS, STRESS_MANAGEMENT } from "@/types/lifestyle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Briefcase, Heart, Activity, DollarSign, Dumbbell, MessageCircle, X } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  MessageCircle: <MessageCircle className="w-5 h-5" />,
  X: <X className="w-5 h-5" />,
};

interface StressStepProps {
  data: StressData;
  onChange: (data: StressData) => void;
}

export function StressStep({ data, onChange }: StressStepProps) {
  const update = <K extends keyof StressData>(key: K, value: StressData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const toggleArray = (current: string[], value: string) => {
    if (current.includes(value)) {
      return current.filter((v) => v !== value);
    }
    return [...current, value];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Stress</h2>
        <p className="text-stone-500 mt-1">
          Stress affects cortisol, which impacts breakouts and skin aging.
        </p>
      </div>

      {/* Stress level */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-600" />
            How stressed do you feel on a typical day?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={data.stressLevel}
              onChange={(e) => update("stressLevel", parseInt(e.target.value))}
              className="flex-1 h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <span className="text-lg font-semibold text-rose-700 w-16 text-right">
              {data.stressLevel}/10
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>Calm</span>
            <span>Moderate</span>
            <span>Overwhelmed</span>
          </div>
        </CardContent>
      </Card>

      {/* Stress triggers */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            What are your main stress triggers? (Select all)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {STRESS_TRIGGERS.map((trigger) => {
              const selected = data.triggers.includes(trigger.id);
              return (
                <button
                  key={trigger.id}
                  onClick={() =>
                    update("triggers", toggleArray(data.triggers, trigger.id))
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selected
                      ? "bg-rose-50 border-rose-300 text-rose-800"
                      : "bg-white border-stone-200 text-stone-600 hover:border-rose-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selected ? "bg-rose-200 text-rose-700" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {iconMap[trigger.icon]}
                  </div>
                  <span className="text-sm font-medium">{trigger.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stress management */}
      <Card className="border-stone-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            How do you manage stress? (Select all)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {STRESS_MANAGEMENT.map((method) => {
              const selected = data.management.includes(method.id);
              return (
                <button
                  key={method.id}
                  onClick={() =>
                    update("management", toggleArray(data.management, method.id))
                  }
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selected
                      ? "bg-rose-50 border-rose-300 text-rose-800"
                      : "bg-white border-stone-200 text-stone-600 hover:border-rose-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selected ? "bg-rose-200 text-rose-700" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {iconMap[method.icon]}
                  </div>
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
