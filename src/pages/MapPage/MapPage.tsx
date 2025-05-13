import React from "react";
import "leaflet/dist/leaflet.css";
import RegionList from "./components/RegionList";
import LeafletMap from "./components/LeafletMap";

function MapPage() {
    return (
        <div className="relative h-screen w-full">
            <LeafletMap />
            <RegionList />
        </div>
    );
}

export default MapPage;
