import React from "react";
import { Region } from "../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

function RegionList() {
    const { regions } = useSelector((state: RootState) => state.regionState);

    return (
        <div className="absolute flex flex-col bg-white p-3 shadow-lg rounded-lg gap-2 min-w-60 m-3">
            <div className="flex flex-row justify-between content-center gap-5 p-2">
                <h2 className="text-md font-bold">Regions</h2>
                <button className="bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:poi">
                    + Add
                </button>
            </div>

            <hr className="h-0.5 bg-gray-200 border-0 rounded-2xl" />

            <ul>
                {regions.map((region, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-start mb-3  hover:bg-gray-200 hover:cursor-pointer p-2 rounded-sm"
                    >
                        <div className="flex flex-row gap-3 ">
                            <div
                                className="w-4 h-4 rounded-full mt-1.5"
                                style={{ backgroundColor: region.color }}
                            ></div>
                            <div className="flex flex-col items-start">
                                <div className="text-sm">{region.name}</div>
                                <div className="text-gray-500 text-xs">
                                    {region.area} km²
                                </div>
                            </div>
                        </div>

                        <button className="text-gray-500 hover:text-red-500 hover:cursor-pointer text-xl">
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RegionList;
