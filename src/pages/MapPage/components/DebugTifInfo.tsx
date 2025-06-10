// components/DebugTifInfo.tsx
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const DebugTifInfo: React.FC = () => {
    const layerState = useSelector((state: RootState) => state.layers);
    const regionState = useSelector((state: RootState) => state.regionState);

    if (regionState.selectedRegionIndex === null) return null;

    return (
        <div className="absolute top-4 left-4 bg-white/90 p-4 rounded shadow-lg text-xs max-w-sm z-[1000]">
            <h3 className="font-bold mb-2">TIF Debug Info</h3>
            <div className="space-y-1">
                <div>
                    <strong>Selected Date:</strong>{" "}
                    {layerState.selectedDate || "None"}
                </div>
                <div>
                    <strong>Selected Layer:</strong>{" "}
                    {layerState.selectedLayer || "None"}
                </div>
                <div>
                    <strong>Loading:</strong>{" "}
                    {layerState.loading ? "Yes" : "No"}
                </div>
                <div>
                    <strong>Error:</strong> {layerState.error || "None"}
                </div>
                <div>
                    <strong>Available Dates:</strong>{" "}
                    {layerState.dateLayers.length}
                </div>
                {layerState.selectedDate && (
                    <div>
                        <strong>Layers for Date:</strong>{" "}
                        {layerState.dateLayers.find(
                            (dl) => dl.date === layerState.selectedDate
                        )?.layers.length || 0}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DebugTifInfo;
