// components/LeafletMap/TifLayer.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface TifLayerProps {
    opacity?: number;
}

const TifLayer: React.FC<TifLayerProps> = ({ opacity = 0.8 }) => {
    const map = useMap();
    const layerRef = useRef<any>(null);
    const layerState = useSelector((state: RootState) => state.layers);
    const regionState = useSelector((state: RootState) => state.regionState);

    useEffect(() => {
        let isMounted = true;

        // Cleanup previous layer
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

        // Load the TIF file
        loadTifLayer(selectedLayerFile, isMounted);

        // Cleanup function
        return () => {
            isMounted = false;
            if (layerRef.current) {
                try {
                    map.removeLayer(layerRef.current);
                } catch (error) {
                    console.warn("Error removing layer:", error);
                }
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

    const loadTifLayer = async (layerFile: any, isMounted: boolean) => {
        try {
            console.log("Loading TIF layer:", layerFile.name);

            // Convert blob to array buffer
            const arrayBuffer = await layerFile.blob.arrayBuffer();

            if (!isMounted) return;

            // Import the required libraries
            const parseGeoraster = (await import("georaster")).default;
            const GeoRasterLayer = (await import("georaster-layer-for-leaflet"))
                .default;

            if (!isMounted) return;

            console.log("Parsing georaster...");

            // Parse the GeoTIFF
            const georaster = await parseGeoraster(arrayBuffer);

            if (!isMounted) return;

            console.log("Georaster parsed:", {
                width: georaster.width,
                height: georaster.height,
                bounds: [
                    georaster.xmin,
                    georaster.ymin,
                    georaster.xmax,
                    georaster.ymax,
                ],
                noDataValue: georaster.noDataValue,
                projection: georaster.projection,
            });

            // Create the layer with minimal configuration
            const geoRasterLayer = new GeoRasterLayer({
                georaster: georaster,
                opacity: opacity,
                // Simple pixel value to color function - just use grayscale
                pixelValuesToColorFn: (pixelValues: number[]) => {
                    const pixelValue = pixelValues[0];

                    // Handle no-data values
                    if (
                        pixelValue === georaster.noDataValue ||
                        pixelValue === null ||
                        pixelValue === undefined ||
                        isNaN(pixelValue)
                    ) {
                        return null; // Transparent
                    }

                    // Simple grayscale mapping
                    // You might need to adjust this based on your data range
                    let normalized;
                    if (georaster.mins && georaster.maxs) {
                        const min = georaster.mins[0];
                        const max = georaster.maxs[0];
                        normalized = (pixelValue - min) / (max - min);
                    } else {
                        // Fallback normalization (adjust range as needed)
                        normalized = Math.max(0, Math.min(1, pixelValue));
                    }

                    const intensity = Math.floor(normalized * 255);
                    return `rgba(${intensity}, ${intensity}, ${intensity}, ${opacity})`;
                },
                resolution: 256, // Adjust for performance vs quality
            });

            if (!isMounted) return;

            console.log("Adding layer to map...");

            // Add to map
            geoRasterLayer.addTo(map);
            layerRef.current = geoRasterLayer;

            console.log("TIF layer added successfully");
        } catch (error) {
            console.error("Error loading TIF layer:", error);

            // If there's an error, you might want to show a simple message
            // or fallback to a basic overlay
            if (error instanceof Error) {
                console.error("Error details:", error.message);
            }
        }
    };

    return null;
};

export default TifLayer;
