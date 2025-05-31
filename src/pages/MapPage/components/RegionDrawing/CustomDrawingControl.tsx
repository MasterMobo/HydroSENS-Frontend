import React, {
    useRef,
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import { FeatureGroup } from "react-leaflet";
import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import {
    handleShapeCreated,
    handleShapeEdited,
    handleShapeDeleted,
} from "@/redux/regionDrawingActions";
import L from "leaflet";
import "leaflet-draw";

export type DrawingMode = "polygon" | "rectangle" | "circle" | "edit" | null;

interface CustomDrawingControlProps {
    drawingMode: DrawingMode;
    onShapeCreated?: () => void;
    onModeComplete?: () => void;
}

export interface CustomDrawingControlRef {
    clearShapes: () => void;
    finishEdit: () => void;
}

const CustomDrawingControl = forwardRef<
    CustomDrawingControlRef,
    CustomDrawingControlProps
>(({ drawingMode, onShapeCreated, onModeComplete }, ref) => {
    const dispatch = useDispatch();
    const map = useMap();
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);
    const [currentDrawHandler, setCurrentDrawHandler] = useState<any>(null);
    const [editHandler, setEditHandler] = useState<any>(null);

    // Initialize feature group
    useEffect(() => {
        if (!featureGroupRef.current) {
            featureGroupRef.current = new L.FeatureGroup();
            map.addLayer(featureGroupRef.current);
        }

        return () => {
            if (featureGroupRef.current) {
                map.removeLayer(featureGroupRef.current);
            }
        };
    }, [map]);

    // Handle drawing mode changes
    useEffect(() => {
        // Clean up previous handlers
        if (currentDrawHandler) {
            currentDrawHandler.disable();
            setCurrentDrawHandler(null);
        }
        if (editHandler) {
            editHandler.disable();
            setEditHandler(null);
        }

        if (!drawingMode || !featureGroupRef.current) return;

        let handler: any = null;

        switch (drawingMode) {
            case "polygon":
                handler = new L.Draw.Polygon(map, {
                    allowIntersection: false,
                    drawError: {
                        color: "#e1e100",
                        message:
                            "<strong>Oh snap!</strong> you can't draw that!",
                    },
                    shapeOptions: {
                        color: "#97009c",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2,
                    },
                });
                break;
            case "rectangle":
                handler = new L.Draw.Rectangle(map, {
                    shapeOptions: {
                        color: "#97009c",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2,
                    },
                });
                break;
            case "circle":
                handler = new L.Draw.Circle(map, {
                    shapeOptions: {
                        color: "#662d91",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2,
                    },
                });
                break;
            case "edit":
                if (featureGroupRef.current.getLayers().length > 0) {
                    handler = new L.EditToolbar.Edit(map, {
                        featureGroup: featureGroupRef.current,
                    });
                    setEditHandler(handler);
                }
                break;
        }

        if (handler && drawingMode !== "edit") {
            handler.enable();
            setCurrentDrawHandler(handler);
        } else if (handler && drawingMode === "edit") {
            handler.enable();
        }
    }, [drawingMode, map]);

    // Set up event listeners
    useEffect(() => {
        const handleCreated = (e: any) => {
            const layer = e.layer;

            // Clear previous shapes and add new layer
            if (featureGroupRef.current) {
                featureGroupRef.current.clearLayers();
                featureGroupRef.current.addLayer(layer);
            }

            dispatch(handleShapeCreated(layer));
            onShapeCreated?.();
            onModeComplete?.();
        };

        const handleEdited = (e: any) => {
            dispatch(handleShapeEdited(e.layers));
            onModeComplete?.();
        };

        const handleDeleted = () => {
            dispatch(handleShapeDeleted());
            onModeComplete?.();
        };

        // Add event listeners
        map.on(L.Draw.Event.CREATED, handleCreated);
        map.on(L.Draw.Event.EDITED, handleEdited);
        map.on(L.Draw.Event.DELETED, handleDeleted);

        return () => {
            // Remove event listeners
            map.off(L.Draw.Event.CREATED, handleCreated);
            map.off(L.Draw.Event.EDITED, handleEdited);
            map.off(L.Draw.Event.DELETED, handleDeleted);
        };
    }, [dispatch, map, onShapeCreated, onModeComplete]);

    // Method to clear all shapes (for external use)
    const clearShapes = React.useCallback(() => {
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
            dispatch(handleShapeDeleted());
        }
    }, [dispatch]);

    // Method to finish editing and save current state
    const finishEdit = React.useCallback(() => {
        if (featureGroupRef.current && editHandler) {
            // Get all layers in the feature group and dispatch edited event
            const layers = featureGroupRef.current;
            if (layers.getLayers().length > 0) {
                dispatch(handleShapeEdited(layers));
            }
            // Disable edit handler
            editHandler.disable();
            setEditHandler(null);
        }
    }, [dispatch, editHandler]);

    // Expose methods to parent through ref
    React.useImperativeHandle(ref, () => ({
        clearShapes,
        finishEdit,
    }));

    return <FeatureGroup ref={featureGroupRef} />;
});

CustomDrawingControl.displayName = "CustomDrawingControl";

export default CustomDrawingControl;
