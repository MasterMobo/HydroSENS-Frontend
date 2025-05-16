import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Leaf } from "lucide-react";

/**
 * GaugeCard
 * ---------------------------------
 * A reusable gauge‑style KPI card that matches the Pillar dashboard design.
 *
 * Props:
 *  - label        (string)  : The metric name, e.g. "NDVI".
 *  - value        (number)  : Current reading.
 *  - min          (number)  : Minimum value for the gauge (default: 0).
 *  - max          (number)  : Maximum value for the gauge (default: 1).
 *  - description  (string)  : A qualitative description based on the value.
 *  - icon         (ReactNode): Metric icon (defaults to <Leaf />).
 *  - color        (string)  : Primary HEX color for the gauge path & accent.
 */
export interface GaugeCardProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  description: string;
  icon?: React.ReactNode;
  color?: string; // e.g. "#6b21a8" (Purple‑700)
  className?: string;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  description,
  icon,
  color = "#6b21a8", // violet‑700
  className
}) => {
  // Normalise the reading to a percentage for the gauge library.
  const percent = ((value - min) / (max - min)) * 100;

  // A very light background tint for the card, based on the primary colour.
  const backgroundTint = `${color}15`; // ~8% opacity
  const trailTint = `${color}30`; // ~18% opacity for the gauge track

  return (
    <Card
      className={
        "rounded-2xl shadow-sm " +
        (className ?? "")
      }
      style={{ background: backgroundTint }}
    >
      <CardHeader className="p-4 pb-0 flex-row items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: trailTint }}>
          {icon ?? <Leaf className="w-4 h-4" style={{ color }} />}
        </div>
        <CardTitle className="text-sm font-semibold" style={{ color }}>
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-2 p-4 pt-2">
        {/* Gauge */}
        <div className="w-28 -mb-2">
          <CircularProgressbarWithChildren
            value={percent}
            minValue={0}
            maxValue={100}
            circleRatio={0.5} // half‑circle
            styles={buildStyles({
              rotation: 0.75, // 0.75 turns so that 0 is at left, 1 at right
              strokeLinecap: "round",
              pathColor: color,
              trailColor: trailTint,
              textColor: "#0f172a", // slate‑900
              pathTransitionDuration: 0.3
            })}
          >
            <span className="text-sm font-medium text-slate-900">
              {value}
            </span>
          </CircularProgressbarWithChildren>
        </div>

        {/* Min / Max labels */}
        <div className="w-full flex justify-between text-xs leading-none text-slate-700">
          <span>{min}</span>
          <span>{max}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-center font-medium text-slate-800 pt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

// Example usage (static data). Remove or replace with your own implementation.
export const ExampleGaugeCard = () => (
  <GaugeCard
    label="NDVI"
    value={0.5}
    description="Moderately Healthy Vegetation"
  />
);
