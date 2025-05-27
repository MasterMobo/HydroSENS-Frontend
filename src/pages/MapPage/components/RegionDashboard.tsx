import { useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GaugeCard } from "./GaugeCard";
import { ChartCard } from "./ChartCard";
import { Download, Star } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { selectRegion } from "@/redux/regionActions";
import { fetchHydrosens } from "@/redux/dashboardActions";
import { HydrosensOutputs } from "@/types/hydrosens";

/* ------------------------------------------------------------------ */
/*  Colour / unit meta per metric key                                 */
/* ------------------------------------------------------------------ */
const metricMeta = {
  ndvi:                  { label: "NDVI",                  color:"#8b5cf6", min:0,   max:1,   unit: undefined, chartType:"line" },
  "vegetation-fraction": { label: "Vegetation Fraction",   color:"#4ade80", min:0,   max:1,   unit: undefined, chartType:"line" },
  "soil-fraction":       { label: "Soil Fraction",         color:"#60a5fa", min:0,   max:1,   unit: undefined, chartType:"line" },
  precipitation:         { label: "Precipitation",         color:"#facc15", min:0,   max:100,unit:"mm",        chartType:"bar"  },
  temperature:           { label: "Temperature",           color:"#fb923c", min:-35, max:80, unit:"°C",       chartType:"line" },
  "curve-number":        { label: "Curve Number",          color:"#f472b6", min:0,   max:100,unit: undefined, chartType:"line" },
} as const;

type MetricKey = keyof typeof metricMeta;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
function RegionDashboard() {
  const dispatch = useDispatch<AppDispatch>(); 
  const regionState  = useSelector((s: RootState) => s.regionState);
  const dateState    = useSelector((s: RootState) => s.dateState);
  const dashboard    = useSelector((s: RootState) => s.dashboard);

  /* push fetch whenever deps change */
  useEffect(() => {
    if (
      regionState.selectedRegionIndex != null &&
      dateState.startDate &&
      dateState.endDate
    ) {
      dispatch(fetchHydrosens());
    }
  }, [dispatch, regionState.selectedRegionIndex, dateState.startDate, dateState.endDate]);

  /* ---------- transform API outputs -> gauges + chart series -------- */
  const { gauges, charts } = useMemo(() => {
    const outputs: HydrosensOutputs = dashboard.outputs;
    if (!outputs || !Object.keys(outputs).length) {
      return { gauges: [], charts: {} as Record<string, { date: string; value: number }[]> };
    }

    // Build chart arrays
    const chartSeries: Record<string, { date: string; value: number }[]> = {};
    (Object.keys(metricMeta) as MetricKey[]).forEach((k) => (chartSeries[k] = []));

    Object.entries(outputs).forEach(([date, metrics]) => {
      (Object.keys(metricMeta) as MetricKey[]).forEach((k) => {
        chartSeries[k].push({ date, value: (metrics as any)[k] });
      });
    });

    // Latest date for gauges (or average could be used)
    const latestDate = Object.keys(outputs).sort().pop()!;
    const latest = outputs[latestDate];

    const gaugeArr = (Object.keys(metricMeta) as MetricKey[]).map((k) => ({
      key: k,
      value: (latest as any)[k],
      ...metricMeta[k],
      chartType: metricMeta[k].chartType ?? "line",
    }));

    return { gauges: gaugeArr, charts: chartSeries };
  }, [dashboard.outputs]);

  /* ----------------- click handlers -------------------------------- */
  const handleBack = () => dispatch(selectRegion(null));

  /* ------------------------------------------------------------------ */
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
            <h2 className="text-sm font-semibold text-slate-600">Average Values</h2>
          </header>

          {/* Loading / error */}
          {dashboard.loading && <p className="text-center">Loading…</p>}
          {dashboard.error   && <p className="text-center text-red-600">{dashboard.error}</p>}

          {/* Gauge grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gauges.map((g) => (
              <GaugeCard
                key={g.key}
                label={g.label}
                value={g.value}
                min={g.min}
                max={g.max}
                description={""}      /* add qualitative strings if needed */
                icon={undefined}
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
                key={g.key}
                label={g.label}
                data={charts[g.key]}
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