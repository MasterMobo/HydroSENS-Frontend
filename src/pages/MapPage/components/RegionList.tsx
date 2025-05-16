import React from "react";
import { Region } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Button } from "@/components/ui/button";
import { deleteRegion, selectRegion } from "@/redux/regionActions";
import SelectedRegionModal from "./SelectedRegionModal";
import DeleteRegionButton from "./RegionListItem/DeleteRegionButton";

function RegionList() {
    const dispatch = useDispatch();
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    const handleRegionClick = (index: number) => {
        dispatch(selectRegion(index));
    };

    if (selectedRegionIndex != null)
        return <SelectedRegionModal region={regions[selectedRegionIndex]} />;

    return (
        <div className="absolute flex flex-col bg-white p-3 shadow-lg rounded-md gap-2 min-w-60 m-4">
            <div className="flex flex-row justify-between content-center gap-5 p-2">
                <h2 className="text-md font-bold align-middle">Regions</h2>
                <Button className="bg-blue-600 m-0">+ Add</Button>
            </div>

            <hr className="h-[1.5px] bg-gray-200 border-0 rounded-2xl" />

            <ul>
                {regions.map((region, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-start mb-3 p-2 rounded-sm hover:bg-gray-200 hover:cursor-pointer"
                    >
                        <div
                            className="flex gap-3"
                            onClick={() => handleRegionClick(index)}
                        >
                            <div
                                className="w-4 h-4 rounded-full mt-1.5"
                                style={{ backgroundColor: region.color }}
                            ></div>
                            <div className="flex flex-col items-start min-w-40">
                                <div className="text-sm">{region.name}</div>
                                <div className="text-xs text-gray-500">
                                    {region.area} km²
                                </div>
                            </div>
                        </div>
                        <DeleteRegionButton index={index} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RegionList;
