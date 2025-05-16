import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GaugeCard } from "./GaugeCard"; // adjust the path if GaugeCard lives elsewhere
import {
  Leaf,
  Sprout,
  Droplet,
  CloudRain,
  Thermometer,
  Gauge
} from "lucide-react";

const gauges = [
  {
    label: "NDVI",
    value: 0.5,
    min: 0,
    max: 1,
    description: "Moderately Healthy Vegetation",
    icon: <Leaf className="w-4 h-4" />,
    color: "#8b5cf6" // violet‑500
  },
  {
    label: "Vegetation Fraction",
    value: 0.1,
    min: 0,
    max: 1,
    description: "Very Sparse Vegetation",
    icon: <Sprout className="w-4 h-4" />,
    color: "#4ade80" // green‑400
  },
  {
    label: "Soil Fraction",
    value: 0.4,
    min: 0,
    max: 1,
    description: "Very Sparse Vegetation",
    icon: <Droplet className="w-4 h-4" />,
    color: "#60a5fa" // blue‑400
  },
  {
    label: "Precipitation",
    value: 44,
    min: 0,
    max: 100,
    description: "Moderate Precipitation",
    icon: <CloudRain className="w-4 h-4" />,
    color: "#facc15" // yellow‑400
  },
  {
    label: "Temperature",
    value: 26.5,
    min: -35,
    max: 80,
    description: "Mild Temperature",
    icon: <Thermometer className="w-4 h-4" />,
    color: "#fb923c" // orange‑400
  },
  {
    label: "Curve Number",
    value: 55,
    min: 0,
    max: 100,
    description: "Low Runoff Curve Number",
    icon: <Gauge className="w-4 h-4" />,
    color: "#f472b6" // pink‑400
  }
];

function RegionDashboard() {
  return (
    <div className="absolute top-0 right-0 w-[50vw] h-full bg-gray-100 border-l shadow-lg">
      <ScrollArea className="h-full"> {/* makes the dashboard body scrollable */}
        <div className="px-6 py-4 space-y-6">
          <header className="flex items-center justify-between">
            <button className="text-sm font-medium text-slate-600 hover:underline">&lt; Back</button>
            <h2 className="text-sm font-semibold text-slate-600">Average Values</h2>
          </header>

          {/* Gauge grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gauges.map((g) => (
              <GaugeCard
                key={g.label}
                label={g.label}
                value={g.value}
                min={g.min}
                max={g.max}
                description={g.description}
                icon={g.icon}
                color={g.color}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default RegionDashboard;
