import React from "react";
import "leaflet/dist/leaflet.css";
import RegionList from "./components/RegionList";
import LeafletMap from "./components/LeafletMap";
import UiOverlay from "./components/UiOverlay";
import RegionDashboard from "./components/RegionDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

function MapPage() {
    const { selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    return (
        <div className="relative h-screen w-full">
            <LeafletMap />
            <RegionList />
            {selectedRegionIndex != null ? <RegionDashboard /> : null}
        </div>
    );
}

export default MapPage;
