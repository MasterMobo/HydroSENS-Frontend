import React, { useRef, useState } from "react";
import { Region } from "../types";
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import { LatLngBounds, LatLng } from "leaflet";

// This component will handle map operations like fitting bounds
function MapController({
    selectedRegion,
    coordinates,
}: {
    selectedRegion: number | null;
    coordinates: [number, number][][];
}) {
    const map = useMap();

    React.useEffect(() => {
        if (selectedRegion !== null) {
            const regionCoords = coordinates[selectedRegion];

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
        }
    }, [selectedRegion, coordinates, map]);

    return null;
}

type LeafletMapProps = {
    regions: Region[];
};

function LeafletMap(props: LeafletMapProps) {
    const { regions } = props;
    const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

    // Handler for polygon click
    const handleRegionClick = (index: number) => {
        setSelectedRegion(index);
    };

    return (
        <MapContainer
            center={[52.52, 13.405]}
            zoom={12}
            className="h-full w-full z-0"
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
                        fillOpacity: selectedRegion === index ? 0.5 : 0.2,
                        weight: selectedRegion === index ? 3 : 1,
                    }}
                    eventHandlers={{
                        click: () => handleRegionClick(index),
                    }}
                />
            ))}

            {/* Controller to manage map operations */}
            <MapController
                selectedRegion={selectedRegion}
                coordinates={regions.map((r) => r.coordinates)}
            />
        </MapContainer>
    );
}

export default LeafletMap;
