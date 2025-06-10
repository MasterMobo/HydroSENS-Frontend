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
import { fetchLayers, clearLayers } from "@/redux/layerActions";
import { HydrosensOutputs } from "@/types/hydrosens";
import DownloadCSVButton from "./DownloadCSVButton";
import { MetricKey } from "@/redux/settingsActions";

/* ------------------------------------------------------------------ */
/*  Colour / unit meta per metric key                                 */
/* ------------------------------------------------------------------ */
const metricMeta = {
    ndvi: {
        label: "NDVI",
        color: "#8b5cf6",
        min: 0,
        max: 1,
        unit: undefined,
        chartType: "line",
    },
    "vegetation-fraction": {
        label: "Vegetation Fraction",
        color: "#4ade80",
        min: 0,
        max: 1,
        unit: undefined,
        chartType: "line",
    },
    "soil-fraction": {
        label: "Soil Fraction",
        color: "#60a5fa",
        min: 0,
        max: 1,
        unit: undefined,
        chartType: "line",
    },
    precipitation: {
        label: "Precipitation",
        color: "#facc15",
        min: 0,
        max: 100,
        unit: "mm",
        chartType: "bar",
    },
    temperature: {
        label: "Temperature",
        color: "#fb923c",
        min: -35,
        max: 80,
        unit: "°C",
        chartType: "line",
    },
    "curve-number": {
        label: "Curve Number",
        color: "#f472b6",
        min: 0,
        max: 100,
        unit: undefined,
        chartType: "line",
    },
} as const;

function RegionDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const regionState = useSelector((s: RootState) => s.regionState);
    const dateState = useSelector((s: RootState) => s.dateState);
    const dashboard = useSelector((s: RootState) => s.dashboard);
    const settings = useSelector((s: RootState) => s.settings);

    /* Trigger fetch whenever region or date changes */
    useEffect(() => {
        if (
            regionState.selectedRegionIndex != null &&
            dateState.startDate &&
            dateState.endDate
        ) {
            dispatch(fetchHydrosens());
        }
    }, [
        dispatch,
        regionState.selectedRegionIndex,
        dateState.startDate,
        dateState.endDate,
    ]);

    /* Fetch layers after dashboard data is loaded successfully */
    useEffect(() => {
        if (
            !dashboard.loading &&
            !dashboard.error &&
            Object.keys(dashboard.outputs).length > 0
        ) {
            dispatch(fetchLayers());
        }
    }, [dispatch, dashboard.loading, dashboard.error, dashboard.outputs]);

    /* Clear layers when region is deselected */
    useEffect(() => {
        if (regionState.selectedRegionIndex === null) {
            dispatch(clearLayers());
        }
    }, [dispatch, regionState.selectedRegionIndex]);

    /* Transform API outputs → gauges + chart series, filtered by selected metrics */
    const { gauges, charts } = useMemo(() => {
        const outputs: HydrosensOutputs = dashboard.outputs;
        if (!outputs || !Object.keys(outputs).length) {
            return {
                gauges: [],
                charts: {} as Record<string, { date: string; value: number }[]>,
            };
        }

        // Get only the selected metrics from settings
        const selectedMetrics = settings.selectedMetrics;

        // 1) Build time‐series arrays (only for selected metrics)
        const chartSeries: Record<string, { date: string; value: number }[]> =
            {};
        selectedMetrics.forEach((k) => {
            chartSeries[k] = [];
        });

        Object.entries(outputs).forEach(([date, metrics]) => {
            selectedMetrics.forEach((k) => {
                chartSeries[k].push({ date, value: (metrics as any)[k] });
            });
        });

        // 2) Compute average over all returned dates (for gauges, only selected metrics)
        const dateKeys = Object.keys(outputs);
        const nDates = dateKeys.length;
        const gaugeArr = selectedMetrics.map((k) => {
            let sum = 0;
            for (const d of dateKeys) {
                sum += (outputs[d] as any)[k];
            }
            const avg = sum / nDates;

            // Round to two decimals, small values become 0.00
            const rounded = Number(Math.abs(avg) < 0.01 ? 0 : avg.toFixed(2));

            // Determine qualitative description
            const { min, max, label, unit } = metricMeta[k];
            const ratio = (avg - min) / (max - min);
            let desc = "";
            if (ratio < 0.25) desc = `Very Low ${label}`;
            else if (ratio < 0.5) desc = `Low ${label}`;
            else if (ratio < 0.75) desc = `Moderate ${label}`;
            else desc = `High ${label}`;

            return {
                key: k,
                value: rounded,
                min: min,
                max: max,
                label: label,
                unit: unit, // include unit in gauge object
                color: metricMeta[k].color,
                chartType: metricMeta[k].chartType ?? "line",
                description: desc, // description has no unit
            };
        });
        console.log(gaugeArr);

        return { gauges: gaugeArr, charts: chartSeries };
    }, [dashboard.outputs, settings.selectedMetrics]);

    /* Handler for the "Back" button */
    const handleBack = () => {
        dispatch(selectRegion(null));
    };

    const hasData = gauges.length > 0 && !dashboard.loading && !dashboard.error;

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

                    {/* Loading */}
                    {dashboard.loading && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <span className="text-lg font-medium text-slate-700">
                                Loading
                            </span>
                            <div className="flex items-center space-x-1 mt-2">
                                <span
                                    className="w-2 h-2 bg-slate-600 rounded-full animate-ping"
                                    style={{ animationDelay: "0s" }}
                                />
                                <span
                                    className="w-2 h-2 bg-slate-600 rounded-full animate-ping"
                                    style={{ animationDelay: "0.2s" }}
                                />
                                <span
                                    className="w-2 h-2 bg-slate-600 rounded-full animate-ping"
                                    style={{ animationDelay: "0.4s" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* No Data */}
                    {!dashboard.loading &&
                        !dashboard.error &&
                        gauges.length === 0 &&
                        settings.selectedMetrics.length === 0 && (
                            <div className="flex items-center justify-center h-64">
                                <span className="text-lg text-slate-600">
                                    No metrics selected. Please open settings to
                                    select metrics to display.
                                </span>
                            </div>
                        )}

                    {/* Error */}
                    {dashboard.error && (
                        <p className="text-center text-red-600">
                            {dashboard.error}
                        </p>
                    )}

                    {/* Gauges */}
                    {hasData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gauges.map((g) => (
                                <GaugeCard
                                    key={g.key}
                                    // append unit only in title:
                                    label={
                                        g.unit
                                            ? `${g.label} (${g.unit})`
                                            : g.label
                                    }
                                    value={g.value}
                                    min={g.min}
                                    max={g.max}
                                    description={g.description} // no unit in description
                                    icon={undefined}
                                    color={g.color}
                                />
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {hasData && (
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <DownloadCSVButton />
                            <Button className="flex-1 h-12 gap-2">
                                <Star className="w-4 h-4" /> Generate Report
                            </Button>
                        </div>
                    )}

                    {/* Time‐series Charts */}
                    {hasData && (
                        <div className="space-y-6">
                            {gauges.map((g) => (
                                <ChartCard
                                    key={g.key}
                                    // also append unit in chart title
                                    label={
                                        g.unit
                                            ? `${g.label} (${g.unit})`
                                            : g.label
                                    }
                                    data={charts[g.key]}
                                    chartType={g.chartType}
                                    color={g.color}
                                    unit={g.unit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

export default RegionDashboard;
