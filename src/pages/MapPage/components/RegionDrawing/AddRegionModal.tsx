import React, { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useDispatch } from "react-redux";
import { addRegion } from "@/redux/regionActions";
import { Region } from "@/types/region";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { drawOptions } from "./drawOptions";
import { generateRandomColor } from "@/utils/colors";
import { calculatePolygonArea } from "@/utils/map";

interface AddRegionModalProps {
    onClose: () => void;
}

function AddRegionModal({ onClose }: AddRegionModalProps) {
    const dispatch = useDispatch();
    const [regionName, setRegionName] = useState("");
    const [currentCoordinates, setCurrentCoordinates] = useState<
        [number, number][]
    >([]);
    const featureGroupRef = useRef<any>(null);

    // Handle shape creation
    const handleCreated = (e: any) => {
        const layer = e.layer;
        const coordinates: [number, number][] = [];

        if (layer.getLatLngs) {
            // For polygons and rectangles
            const latLngs = Array.isArray(layer.getLatLngs()[0])
                ? layer.getLatLngs()[0]
                : layer.getLatLngs();
            coordinates.push(
                ...latLngs.map((latLng: any) => [latLng.lat, latLng.lng])
            );
        } else if (layer.getLatLng && layer.getRadius) {
            // For circles, create polygon approximation
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            const points = 20;

            for (let i = 0; i < points; i++) {
                const angle = (i * 2 * Math.PI) / points;
                const lat = center.lat + (radius / 111000) * Math.cos(angle);
                const lng =
                    center.lng +
                    (radius /
                        (111000 * Math.cos((center.lat * Math.PI) / 180))) *
                        Math.sin(angle);
                coordinates.push([lat, lng]);
            }
        }

        setCurrentCoordinates(coordinates);

        // Clear previous shapes
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
            featureGroupRef.current.addLayer(layer);
        }
    };

    // Handle shape editing
    const handleEdited = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
            const coordinates: [number, number][] = [];

            if (layer.getLatLngs) {
                const latLngs = Array.isArray(layer.getLatLngs()[0])
                    ? layer.getLatLngs()[0]
                    : layer.getLatLngs();
                coordinates.push(
                    ...latLngs.map((latLng: any) => [latLng.lat, latLng.lng])
                );
            }

            setCurrentCoordinates(coordinates);
        });
    };

    // Handle shape deletion
    const handleDeleted = () => {
        setCurrentCoordinates([]);
    };

    // Save the region
    const handleSave = () => {
        if (!regionName.trim() || currentCoordinates.length === 0) return;

        const newRegion: Region = {
            name: regionName.trim(),
            coordinates: currentCoordinates,
            color: generateRandomColor(),
            area: calculatePolygonArea(currentCoordinates),
        };

        dispatch(addRegion(newRegion));
        onClose();
    };

    // Get draw options based on selected mode

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg w-full h-full overflow-hidden flex">
                {/* Controls */}
                <div className="absolute right-0 bottom-0 w-80 p-6 border-r border-gray-200 rounded-lg bg-white flex flex-col z-100">
                    <div>
                        {currentCoordinates.length > 0 && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                                Area: ~
                                {calculatePolygonArea(currentCoordinates)} km²
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Region Name
                            </label>
                            <Input
                                value={regionName}
                                onChange={(e) => setRegionName(e.target.value)}
                                placeholder="Enter region name..."
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={
                                    !regionName.trim() ||
                                    currentCoordinates.length === 0
                                }
                                className="flex-1"
                            >
                                Save Region
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="absolute z-50 w-full h-full">
                    <MapContainer
                        center={[52.52, 13.405]}
                        zoom={12}
                        className="h-full w-full"
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <FeatureGroup ref={featureGroupRef}>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                onEdited={handleEdited}
                                onDeleted={handleDeleted}
                                draw={drawOptions}
                                edit={{
                                    remove: true,
                                    edit: {},
                                }}
                            />
                        </FeatureGroup>
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default AddRegionModal;
