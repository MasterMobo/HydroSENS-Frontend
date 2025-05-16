import { Button } from "@/components/ui/button";
import React from "react";

function EmptyRegionList() {
    return (
        <div className="absolute flex flex-col bg-white p-3 shadow-lg rounded-md gap-2 min-w-60 m-4">
            <div className="flex flex-row justify-between content-center gap-5 p-2">
                <h2 className="text-md font-bold align-middle">Regions</h2>
                <Button className="m-0">+ Add</Button>
            </div>

            <hr className="h-[1.5px] bg-gray-200 border-0 rounded-2xl" />

            <div className="flex flex-col justify-center content-center text-center gap-2 p-2">
                <div className="flex justify-center content-center">
                    <div className="w-7 h-7 rounded-sm outline-2 outline-dashed outline-gray-400"></div>
                </div>
                <h3 className="font-bold">You have no regions</h3>
                <p className="text-sm">Add a new region to view analytics</p>
            </div>
        </div>
    );
}

export default EmptyRegionList;
