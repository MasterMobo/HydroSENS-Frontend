import React from "react";
import "leaflet/dist/leaflet.css";
import RegionList from "./components/RegionList/RegionList";
import LeafletMap from "./components/LeafletMap";
import RegionDashboard from "./components/RegionDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import DatePickerModal from "./components/DatePickerModal/DatePickerModal";
import DateRangePicker from "./components/DateRangePicker";

function MapPage() {
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

    return (
        <div className="relative h-screen w-full">
            <LeafletMap />
            <RegionList />
            <DateRangePicker />
            {selectedRegionIndex != null ? <RegionDashboard /> : null}
        </div>
    );
}

export default MapPage;
