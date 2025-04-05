import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showPercentage?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showPercentage = false, value, ...props }, ref) => {
  const percentage = Array.isArray(value) ? value[0] : value;
  const displayValue =
    percentage !== undefined ? `${Math.round(percentage * 100)}%` : "";

  return (
    <div className="relative flex w-full items-center gap-2">
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {showPercentage && (
        <span className="min-w-[36px] text-sm text-muted-foreground">
          {displayValue}
        </span>
      )}
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
