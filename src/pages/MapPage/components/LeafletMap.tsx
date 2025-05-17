import React, { useRef, useState } from "react";
import { Region } from "../types";
import {
    MapContainer,
    Polygon,
    TileLayer,
    useMap,
    ZoomControl,
} from "react-leaflet";
import { LatLngBounds, LatLng, Map } from "leaflet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { selectRegion } from "../../../redux/regionActions";

const recenter = (map: Map, regions: Region[]) => {
    if (regions.length <= 0) return;

    const bounds = new LatLngBounds(
        regions.map((region) =>
            region.coordinates.map((coord) => new LatLng(coord[0], coord[1]))
        )
    );
    map.fitBounds(bounds);
};

// This component will handle map operations like fitting bounds
function MapController({
    selectedRegionIndex,
    regions,
}: {
    selectedRegionIndex: number | null;
    regions: Region[];
}) {
    const map = useMap();

    React.useEffect(() => {
        if (selectedRegionIndex === null) {
            return recenter(map, regions);
        }

        const regionCoords = regions[selectedRegionIndex].coordinates;

        // Create bounds from polygon coordinates
        const bounds = new LatLngBounds(
            regionCoords.map((coord) => new LatLng(coord[0], coord[1]))
        );

        // Calculate padding to make the region fill half the left side
        const paddingX = 0;
        const paddingY = window.innerHeight;

        // Fit the map to the bounds with padding
        map.fitBounds(bounds, {
            paddingBottomRight: [paddingY, paddingX],
        });
    }, [selectedRegionIndex, regions, map]);

    return null;
}

function LeafletMap() {
    const dispatch = useDispatch();
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );

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
            {regions.map((region, index) => (
                <Polygon
                    key={index}
                    positions={region.coordinates}
                    pathOptions={{
                        color: region.color,
                        fillOpacity: selectedRegionIndex === index ? 0.5 : 0.2,
                        weight: selectedRegionIndex === index ? 3 : 1,
                    }}
                    eventHandlers={{
                        click: () => handleRegionClick(index),
                    }}
                />
            ))}

            <MapController
                selectedRegionIndex={selectedRegionIndex}
                regions={regions}
            />
            <ZoomControl position="bottomleft" />
        </MapContainer>
    );
}

export default LeafletMap;
