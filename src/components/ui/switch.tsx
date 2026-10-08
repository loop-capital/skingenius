"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <label className={cn("inline-flex items-center cursor-pointer", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        onChange={(e) => {
          onCheckedChange?.(e.target.checked);
          onChange?.(e);
        }}
        {...props}
      />
      <span className="relative w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700" />
    </label>
  )
);
Switch.displayName = "Switch";

export { Switch };
