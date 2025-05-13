import React from "react";
import { Region } from "../types";
import { MapContainer, Polygon, TileLayer } from "react-leaflet";

type LeafletMapProps = {
    regions: Region[];
};
function LeafletMap(props: LeafletMapProps) {
    const { regions } = props;

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
                    pathOptions={{ color: region.color, fillOpacity: 0.2 }}
                />
            ))}
        </MapContainer>
    );
}

export default LeafletMap;
