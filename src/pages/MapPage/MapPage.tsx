import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RegionList from "./components/RegionList";
import LeafletMap from "./components/LeafletMap";

interface Region {
    name: string;
    area: number;
    color: string;
    coordinates: [number, number][];
}

const initialRegions: Region[] = [
    {
        name: "Corn Field A",
        area: 429,
        color: "#ff00ff",
        coordinates: [
            [52.515, 13.38],
            [52.52, 13.42],
            [52.5, 13.41],
            [52.505, 13.37],
        ],
    },
    {
        name: "Pasteur Field A",
        area: 239,
        color: "#00ffff",
        coordinates: [
            [52.53, 13.35],
            [52.54, 13.38],
            [52.52, 13.37],
        ],
    },
    {
        name: "Corn Field B",
        area: 120,
        color: "#ffa500",
        coordinates: [
            [52.51, 13.32],
            [52.52, 13.34],
            [52.5, 13.33],
        ],
    },
    {
        name: "Pasteur Field B",
        area: 450,
        color: "#00ff00",
        coordinates: [
            [52.5, 13.45],
            [52.51, 13.47],
            [52.49, 13.46],
        ],
    },
    {
        name: "Arable Land A",
        area: 287,
        color: "#8000ff",
        coordinates: [
            [52.49, 13.36],
            [52.5, 13.39],
            [52.48, 13.38],
        ],
    },
];

function MapPage() {
    const [regions, setRegions] = useState(initialRegions);

    return (
        <div className="relative h-screen w-full">
            <LeafletMap regions={regions} />
            <RegionList regions={regions} />
        </div>
    );
}

export default MapPage;
