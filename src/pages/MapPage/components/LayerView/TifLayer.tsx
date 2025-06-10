// components/LeafletMap/TifLayer.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import L from "leaflet";

interface TifLayerProps {
    // Optional props for customization
    opacity?: number;
}

const TifLayer: React.FC<TifLayerProps> = ({ opacity = 0.7 }) => {
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
            !regionState.selectedRegionIndex ||
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

        // Load and display the TIF file
        loadTifLayer(selectedLayerFile.blob);

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

    const loadTifLayer = async (blob: Blob) => {
        try {
            // Convert blob to array buffer
            const arrayBuffer = await blob.arrayBuffer();

            // Dynamic import to avoid build issues if packages aren't installed yet
            const parseGeoraster = (await import("georaster")).default;
            const GeoRasterLayer = (await import("georaster-layer-for-leaflet"))
                .default;

            // Parse the GeoTIFF
            const georaster = await parseGeoraster(arrayBuffer);

            // Create the layer
            const geoRasterLayer = new GeoRasterLayer({
                georaster: georaster,
                opacity: opacity,
                pixelValuesToColorFn: (pixelValues: number[]) => {
                    // Custom color mapping - you can customize this based on your data
                    const pixelValue = pixelValues[0];

                    if (
                        pixelValue === null ||
                        pixelValue === undefined ||
                        isNaN(pixelValue)
                    ) {
                        return null; // Transparent for no-data values
                    }

                    // Simple color mapping - customize based on your layer type
                    const normalized = Math.max(0, Math.min(1, pixelValue));
                    const intensity = Math.floor(normalized * 255);

                    // Different color schemes for different layer types
                    if (layerState.selectedLayer?.includes("vegetation")) {
                        return `rgba(${255 - intensity}, ${intensity}, 0, 0.7)`;
                    } else if (
                        layerState.selectedLayer?.includes("NDVI") ||
                        layerState.selectedLayer?.includes("ndvi")
                    ) {
                        return `rgba(${255 - intensity}, ${intensity}, 0, 0.7)`;
                    } else if (
                        layerState.selectedLayer?.includes("temperature")
                    ) {
                        return `rgba(${intensity}, 0, ${255 - intensity}, 0.7)`;
                    } else if (
                        layerState.selectedLayer?.includes("precipitation")
                    ) {
                        return `rgba(0, 0, ${intensity}, 0.7)`;
                    } else {
                        // Default gradient
                        return `rgba(${intensity}, ${intensity}, ${intensity}, 0.7)`;
                    }
                },
                resolution: 256, // Adjust resolution as needed
            });

            // Add layer to map
            geoRasterLayer.addTo(map);
            layerRef.current = geoRasterLayer;

            // Optionally fit bounds to the layer
            if (
                georaster.xmin &&
                georaster.ymin &&
                georaster.xmax &&
                georaster.ymax
            ) {
                const bounds = L.latLngBounds(
                    [georaster.ymin, georaster.xmin],
                    [georaster.ymax, georaster.xmax]
                );
                // Only fit bounds if it's reasonable (not too different from current view)
                const currentBounds = map.getBounds();
                if (bounds.intersects(currentBounds)) {
                    // map.fitBounds(bounds, { padding: [20, 20] });
                }
            }
        } catch (error) {
            console.error("Error loading TIF layer:", error);
        }
    };

    // This component doesn't render anything directly
    return null;
};

export default TifLayer;
