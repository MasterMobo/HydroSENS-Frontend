import React, { useCallback, useMemo } from "react";
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
import LineBreak from "../LineBreak";
import { useRegionSizeLimit } from "./AddRegionModal.hooks";

function AddRegionModal() {
    const dispatch = useDispatch();

    const { regionName, currentCoordinates } = useSelector(
        (state: RootState) => state.regionDrawingState
    );

    const currentArea = useMemo(
        () => calculatePolygonArea(currentCoordinates),
        [currentCoordinates]
    );

    const { areaSizePercent, areaSizeText, isOverAreaSizeLimit } =
        useRegionSizeLimit(currentArea);

    const handleRegionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRegionName(e.target.value));
    };

    const handleSave = useCallback(() => {
        if (!regionName.trim() || currentCoordinates.length === 0) return;

        const newRegion: Region = {
            name: regionName.trim(),
            coordinates: currentCoordinates,
            color: generateRandomColor(),
            area: currentArea,
        };

        dispatch(addRegion(newRegion));
        handleClose();
    }, [currentArea, currentCoordinates, regionName]);

    const handleClose = () => {
        dispatch(resetDrawingState());
        dispatch(setViewMode(ViewMode.MAIN_VIEW));
    };

    return (
        <div className="absolute m-4 w-80 p-4 border-r border-gray-200 rounded-lg bg-white flex flex-col z-100">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Button
                        variant="link"
                        className="text-black p-0"
                        onClick={handleClose}
                    >
                        {"< Back"}
                    </Button>

                    <LineBreak />

                    <label className="block text-sm font-medium mb-2">
                        Area Size Limit
                    </label>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className=" h-2.5 rounded-full max-w-full"
                            style={{
                                width: areaSizePercent,
                                background: isOverAreaSizeLimit
                                    ? "red"
                                    : "rgb(65 109 251)",
                            }}
                        ></div>
                    </div>

                    <div
                        className="text-sm text-right "
                        style={{
                            color: isOverAreaSizeLimit ? "red" : "gray",
                        }}
                    >
                        {areaSizeText}
                    </div>

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
                        onClick={handleClose}
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
