import React from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { selectRegion } from "../../../../redux/regionActions";
import RegionPolygons from "./RegionPolygons";
import { ViewMode } from "@/types/viewMode";
import RegionDrawingEditControl from "../RegionDrawing/RegionDrawingEditControl";
import LeafletMapController from "./LeafletMapController";

function LeafletMap() {
    const dispatch = useDispatch();
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );
    const { viewMode } = useSelector((state: RootState) => state.viewModeState);

    // Handler for polygon click
    const handleRegionClick = (index: number) => {
        dispatch(selectRegion(index));
    };

    return (
        <MapContainer
            center={[52.52, 13.405]}
            zoom={12}
            className="absolute h-full w-full z-0"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RegionPolygons
                regions={regions}
                onRegionClicked={
                    viewMode === ViewMode.MAIN_VIEW
                        ? handleRegionClick
                        : () => {}
                }
            />

            <LeafletMapController
                selectedRegionIndex={selectedRegionIndex}
                regions={regions}
            />

            {viewMode === ViewMode.DRAWING_VIEW && <RegionDrawingEditControl />}

            <ZoomControl position="bottomleft" />
        </MapContainer>
    );
}

export default LeafletMap;
