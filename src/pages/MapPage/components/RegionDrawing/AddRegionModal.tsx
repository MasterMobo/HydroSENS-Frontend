import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addRegion } from "@/redux/regionActions";
import { setRegionName, resetDrawingState } from "@/redux/regionDrawingActions";
import { Region } from "@/types/region";
import { RootState } from "@/redux/store";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { generateRandomColor } from "@/utils/colors";
import { calculatePolygonArea } from "@/utils/map";
import { setViewMode } from "@/redux/viewModeActions";
import { ViewMode } from "@/types/viewMode";

function AddRegionModal() {
    const dispatch = useDispatch();

    // Get state from Redux
    const { regionName, currentCoordinates } = useSelector(
        (state: RootState) => state.regionDrawingState
    );

    // Simple event handlers that just dispatch actions
    const handleRegionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRegionName(e.target.value));
    };

    const handleSave = () => {
        if (!regionName.trim() || currentCoordinates.length === 0) return;

        const newRegion: Region = {
            name: regionName.trim(),
            coordinates: currentCoordinates,
            color: generateRandomColor(),
            area: calculatePolygonArea(currentCoordinates),
        };

        dispatch(addRegion(newRegion));
        dispatch(resetDrawingState());
        handleClose();
    };

    const handleCancel = () => {
        dispatch(resetDrawingState());
        handleClose();
    };

    const handleClose = () => {
        dispatch(setViewMode(ViewMode.MAIN_VIEW));
    };

    return (
        <div className="absolute right-0 bottom-0 w-80 p-6 border-r border-gray-200 rounded-lg bg-white flex flex-col z-100">
            <div>
                {currentCoordinates.length > 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                        Area: ~{calculatePolygonArea(currentCoordinates)} km²
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Region Name
                    </label>
                    <Input
                        value={regionName}
                        onChange={handleRegionNameChange}
                        placeholder="Enter region name..."
                        className="w-full"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={
                            !regionName.trim() ||
                            currentCoordinates.length === 0
                        }
                        className="flex-1"
                    >
                        Save Region
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AddRegionModal;
