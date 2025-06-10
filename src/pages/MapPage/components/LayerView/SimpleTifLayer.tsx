// components/LeafletMap/SimpleTifLayer.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import L from "leaflet";

interface SimpleTifLayerProps {
    opacity?: number;
}

const SimpleTifLayer: React.FC<SimpleTifLayerProps> = ({ opacity = 0.7 }) => {
    const map = useMap();
    const layerRef = useRef<L.Layer | null>(null);
    const layerState = useSelector((state: RootState) => state.layers);
    const regionState = useSelector((state: RootState) => state.regionState);

    useEffect(() => {
        // Remove previous layer if it exists
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }

        // Only proceed if we have a selected region, date, and layer
        if (
            regionState.selectedRegionIndex === null ||
            !layerState.selectedDate ||
            !layerState.selectedLayer ||
            layerState.dateLayers.length === 0
        ) {
            return;
        }

        const selectedDateData = layerState.dateLayers.find(
            (dl) => dl.date === layerState.selectedDate
        );

        if (!selectedDateData) return;

        const selectedLayerFile = selectedDateData.layers.find(
            (layer) => layer.name === layerState.selectedLayer
        );

        if (!selectedLayerFile) return;

        // For now, create a simple overlay to indicate the layer is selected
        // You can replace this with actual TIF rendering once you have the proper libraries
        createSimpleLayerOverlay(selectedLayerFile);

        // Cleanup function
        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [
        map,
        layerState.selectedDate,
        layerState.selectedLayer,
        layerState.dateLayers,
        regionState.selectedRegionIndex,
        opacity,
    ]);

    const createSimpleLayerOverlay = (layerFile: any) => {
        // Get the selected region coordinates for bounds
        const selectedRegion =
            regionState.regions[regionState.selectedRegionIndex!];

        if (!selectedRegion) return;

        // Create bounds from region coordinates
        const coordinates = selectedRegion.coordinates;
        const latLngs = coordinates.map(([lat, lng]) => L.latLng(lat, lng));
        const bounds = L.latLngBounds(latLngs);

        // Create a simple colored overlay for demonstration
        // This will be replaced with actual TIF rendering
        const layerColor = getLayerColor(layerState.selectedLayer || "");

        const overlay = L.rectangle(bounds, {
            color: layerColor,
            fillColor: layerColor,
            fillOpacity: opacity * 0.3,
            opacity: opacity,
            weight: 2,
            dashArray: "5, 5",
        });

        // Add popup with layer info
        overlay.bindPopup(`
      <div>
        <strong>${layerState.selectedLayer?.replace(".tif", "")}</strong><br/>
        Date: ${layerState.selectedDate}<br/>
        <em>TIF layer visualization placeholder</em>
      </div>
    `);

        overlay.addTo(map);
        layerRef.current = overlay;

        console.log(
            `Layer overlay created for: ${layerState.selectedLayer} on ${layerState.selectedDate}`
        );
    };

    const getLayerColor = (layerName: string): string => {
        // Return different colors based on layer type
        if (layerName.toLowerCase().includes("vegetation")) return "#4ade80";
        if (layerName.toLowerCase().includes("ndvi")) return "#8b5cf6";
        if (layerName.toLowerCase().includes("temperature")) return "#fb923c";
        if (layerName.toLowerCase().includes("precipitation")) return "#3b82f6";
        if (layerName.toLowerCase().includes("soil")) return "#a3a3a3";
        return "#6b7280"; // Default gray
    };

    return null;
};

export default SimpleTifLayer;
