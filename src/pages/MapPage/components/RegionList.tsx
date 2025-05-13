import React from "react";
import { Region } from "../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

function RegionList() {
    const { regions } = useSelector((state: RootState) => state.regionState);

    return (
        <div className="absolute top-4 left-4 w-80 bg-white p-4 shadow-lg rounded-2xl z-1000">
            <h2 className="text-xl font-bold mb-4">Regions</h2>
            <ul>
                {regions.map((region, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-center mb-3"
                    >
                        <span className="flex items-center">
                            <span
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: region.color }}
                            ></span>
                            <span className="ml-2">{region.name}</span>
                        </span>
                        <span>{region.area} km²</span>
                        <button className="text-gray-500 hover:text-red-500 ml-2">
                            &times;
                        </button>
                    </li>
                ))}
            </ul>
            <button className="bg-blue-500 text-white py-2 px-4 rounded-xl w-full">
                + Add
            </button>
        </div>
    );
}

export default RegionList;
