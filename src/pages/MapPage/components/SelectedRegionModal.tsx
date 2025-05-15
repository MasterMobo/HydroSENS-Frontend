import { Button } from "@/components/ui/button";
import { selectRegion } from "@/redux/regionActions";
import { Region } from "@/types/region";
import React from "react";
import { useDispatch } from "react-redux";

interface SelectedRegionModalProps {
    region: Region;
}
function SelectedRegionModal({ region }: SelectedRegionModalProps) {
    const dispatch = useDispatch();

    const handleBackClick = () => {
        dispatch(selectRegion(null));
    };

    return (
        <div className="absolute flex flex-col bg-white p-3 shadow-lg rounded-md gap-2 min-w-60 m-4">
            <div className="w-full">
                <Button
                    variant="link"
                    className="p-0"
                    onClick={handleBackClick}
                >
                    {"< Back"}
                </Button>
            </div>

            <hr className="h-[1.5px] bg-gray-200 border-0 rounded-2xl" />

            <div className="flex flex-row justify-between p-2">
                <div className="flex gap-3">
                    <div
                        className="w-4 h-4 rounded-full mt-1.5"
                        style={{ backgroundColor: region.color }}
                    ></div>
                    <div className="flex flex-col items-start">
                        <div className="text-sm">{region.name}</div>
                        <div className="text-xs text-gray-500">
                            {region.area} km²
                        </div>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-red-500 ml-2 text-2xl">
                    &times;
                </button>
            </div>
        </div>
    );
}

export default SelectedRegionModal;
