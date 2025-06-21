// components/LeafletMap/FixedTifLayer.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface FixedTifLayerProps {
    opacity?: number;
}

const FixedTifLayer: React.FC<FixedTifLayerProps> = ({ opacity = 0.8 }) => {
    const map = useMap();
    const layerRef = useRef<any>(null);
    const layerState = useSelector((state: RootState) => state.layers);
    const regionState = useSelector((state: RootState) => state.regionState);

    useEffect(() => {
        // Create a custom pane for TIF layers with higher z-index
        if (!map.getPane("tifLayer")) {
            const tifPane = map.createPane("tifLayer");
            tifPane.style.zIndex = "650"; // Higher than overlay pane (600) but lower than popup (700)
        }
    }, [map]);

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

        // Only proceed if we have all required data and not selecting "none"
        if (
            regionState.selectedRegionIndex === null ||
            !layerState.selectedDate ||
            !layerState.selectedLayer ||
            layerState.selectedLayer === "none" ||
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

            // Fetch the blob from the URL
            const response = await fetch(layerFile.url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            if (!isMounted) return;

            // Dynamic imports
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

            // Check if the georaster bounds are within reasonable distance of current map view
            const georasterBounds = {
                south: georaster.ymin,
                north: georaster.ymax,
                west: georaster.xmin,
                east: georaster.xmax,
            };

            const mapBounds = map.getBounds();
            console.log("Map bounds:", {
                south: mapBounds.getSouth(),
                north: mapBounds.getNorth(),
                west: mapBounds.getWest(),
                east: mapBounds.getEast(),
            });

            // Create layer with custom pane to ensure it renders above polygons
            const geoRasterLayer = new GeoRasterLayer({
                georaster: georaster,
                opacity: opacity,
                pane: "tifLayer", // Use custom pane with higher z-index
                pixelValuesToColorFn: (pixelValues: number[]) => {
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

                    // Use the actual data range from the georaster
                    const min = georaster.mins[0];
                    const max = georaster.maxs[0];
                    const normalized = (pixelValue - min) / (max - min);

                    const intensity = Math.floor(normalized * 255);
                    return `rgba(${intensity}, ${intensity}, ${intensity}, ${opacity})`;
                },
                resolution: 256,
                debugLevel: 1,
            });

            if (!isMounted) return;

            console.log("Adding georaster layer to map...");
            geoRasterLayer.addTo(map);
            layerRef.current = geoRasterLayer;

            // Log success
            geoRasterLayer.on("load", () => {
                console.log(
                    `✅ TIF layer ${layerFile.name} loaded and displayed successfully`
                );
            });

            geoRasterLayer.on("error", (error: any) => {
                console.error(
                    `❌ Error with TIF layer ${layerFile.name}:`,
                    error
                );
            });
        } catch (error) {
            console.error(
                `❌ Failed to load TIF layer ${layerFile.name}:`,
                error
            );
        }
    };

    return null;
};

export default FixedTifLayer;
