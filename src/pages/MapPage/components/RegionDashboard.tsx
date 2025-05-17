import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GaugeCard } from "./GaugeCard";
import { ChartCard } from "./ChartCard";
import { Download, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { selectRegion } from "../../../redux/regionActions";
// Use gauges & chartData from the shared mock file (note the capital M)
import { gauges, chartData } from "./MockData";

// ---------------------------------------------------------------------------
// Region Dashboard – consumes external mock data, no local gauge definitions
// ---------------------------------------------------------------------------
function RegionDashboard() {
  const dispatch = useDispatch();

  /* ------------------------------------------------------------------ */
  /* CLICK HANDLERS                                                     */
  /* ------------------------------------------------------------------ */
  const handleBack = () => {
    // Clear the selected region; MapPage’s AnimatePresence will slide panel out
    dispatch(selectRegion(null));
  };

  return (
    <div className="absolute top-0 right-0 w-[50vw] h-full bg-gray-100 border-l shadow-lg">
      <ScrollArea className="h-full">
        <div className="px-6 py-4 space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <button
              className="text-sm font-medium text-slate-600 hover:underline"
              onClick={handleBack}
            >
              &lt; Back
            </button>
            <h2 className="text-sm font-semibold text-slate-600">
              Average Values
            </h2>
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="outline" className="flex-1 h-12 gap-2">
              <Download className="w-4 h-4" /> Download Data
            </Button>
            <Button className="flex-1 h-12 gap-2">
              <Star className="w-4 h-4" /> Generate Report
            </Button>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            {gauges.map((g) => (
              <ChartCard
                key={g.label}
                label={g.label}
                data={chartData[g.label]}
                chartType={g.chartType}
                color={g.color}
                unit={g.unit}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default RegionDashboard;
