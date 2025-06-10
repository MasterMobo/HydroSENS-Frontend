// components/LeafletMap/EnhancedTifLayer.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface EnhancedTifLayerProps {
    opacity?: number;
}

const EnhancedTifLayer: React.FC<EnhancedTifLayerProps> = ({
    opacity = 0.8,
}) => {
    const map = useMap();
    const layerRef = useRef<any>(null);
    const layerState = useSelector((state: RootState) => state.layers);
    const regionState = useSelector((state: RootState) => state.regionState);

    useEffect(() => {
        let isMounted = true;

        // Cleanup previous layer
        if (layerRef.current) {
            try {
                map.removeLayer(layerRef.current);
            } catch (error) {
                console.warn("Error removing previous layer:", error);
            }
            layerRef.current = null;
        }

        // Only proceed if we have all required data
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

        loadTifLayer(selectedLayerFile, isMounted);

        return () => {
            isMounted = false;
            if (layerRef.current) {
                try {
                    map.removeLayer(layerRef.current);
                } catch (error) {
                    console.warn("Error removing layer on cleanup:", error);
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
            console.log(`Loading TIF layer: ${layerFile.name}`);

            const arrayBuffer = await layerFile.blob.arrayBuffer();
            if (!isMounted) return;

            // Dynamic imports to avoid build issues
            const [parseGeoraster, GeoRasterLayer] = await Promise.all([
                import("georaster").then((module) => module.default),
                import("georaster-layer-for-leaflet").then(
                    (module) => module.default
                ),
            ]);

            if (!isMounted) return;

            console.log("Parsing georaster data...");
            const georaster = await parseGeoraster(arrayBuffer);

            if (!isMounted) return;

            console.log("Georaster info:", {
                width: georaster.width,
                height: georaster.height,
                numberOfRasters: georaster.numberOfRasters,
                projection: georaster.projection,
                pixelWidth: georaster.pixelWidth,
                pixelHeight: georaster.pixelHeight,
                bounds: `${georaster.xmin}, ${georaster.ymin}, ${georaster.xmax}, ${georaster.ymax}`,
                noDataValue: georaster.noDataValue,
                mins: georaster.mins,
                maxs: georaster.maxs,
            });

            // Create layer with auto color mapping
            const geoRasterLayer = new GeoRasterLayer({
                georaster: georaster,
                opacity: opacity,
                pixelValuesToColorFn: createColorFunction(
                    georaster,
                    layerFile.name
                ),
                resolution: 256,
                debugLevel: 1, // Enable some debug info
            });

            if (!isMounted) return;

            console.log("Adding georaster layer to map...");
            geoRasterLayer.addTo(map);
            layerRef.current = geoRasterLayer;

            // Optional: Log when layer is ready
            geoRasterLayer.on("load", () => {
                console.log(`TIF layer ${layerFile.name} loaded successfully`);
            });

            geoRasterLayer.on("error", (error: any) => {
                console.error(`Error with TIF layer ${layerFile.name}:`, error);
            });
        } catch (error) {
            console.error(`Failed to load TIF layer ${layerFile.name}:`, error);
        }
    };

    const createColorFunction = (georaster: any, layerName: string) => {
        return (pixelValues: number[]) => {
            const pixelValue = pixelValues[0];

            // Handle no-data values
            if (
                pixelValue === georaster.noDataValue ||
                pixelValue === null ||
                pixelValue === undefined ||
                isNaN(pixelValue)
            ) {
                return null;
            }

            // Get data range
            let min, max;
            if (georaster.mins && georaster.maxs && georaster.mins.length > 0) {
                min = georaster.mins[0];
                max = georaster.maxs[0];
            } else {
                // Fallback ranges based on common data types
                if (layerName.toLowerCase().includes("ndvi")) {
                    min = -1;
                    max = 1;
                } else if (layerName.toLowerCase().includes("temperature")) {
                    min = -50;
                    max = 50;
                } else if (layerName.toLowerCase().includes("precipitation")) {
                    min = 0;
                    max = 100;
                } else {
                    // Auto-range
                    min = Math.min(pixelValue - Math.abs(pixelValue), 0);
                    max = Math.max(pixelValue + Math.abs(pixelValue), 1);
                }
            }

            // Normalize the value
            const normalized = Math.max(
                0,
                Math.min(1, (pixelValue - min) / (max - min))
            );

            // Simple intensity mapping - you can customize this
            const intensity = Math.floor(normalized * 255);

            // Return RGBA color
            return `rgba(${intensity}, ${intensity}, ${intensity}, ${opacity})`;
        };
    };

    return null;
};

export default EnhancedTifLayer;
