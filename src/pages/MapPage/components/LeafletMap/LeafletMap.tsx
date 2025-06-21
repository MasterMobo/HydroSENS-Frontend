import React from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { selectRegion } from "../../../../redux/regionActions";
import RegionPolygons from "./RegionPolygons";
import { ViewMode } from "@/types/viewMode";
import CustomDrawingControl from "../RegionDrawing/CustomDrawingControl";
import AddRegionModal from "../RegionDrawing/AddRegionModal";
import LeafletMapController from "./LeafletMapController";
import { useDrawingControl } from "../RegionDrawing/useDrawingControl";
import FixedTifLayer from "./FixedTifLayer";

function LeafletMap() {
    const dispatch = useDispatch();
    const { regions, selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );
    const { viewMode } = useSelector((state: RootState) => state.viewModeState);

    const {
        currentDrawingMode,
        hasActiveShape,
        drawingControlRef,
        handleDrawingModeChange,
        handleShapeCreated,
        handleModeComplete,
        handleEditMode,
        handleDeleteShape,
        handleFinishEdit,
    } = useDrawingControl();

    // Handler for polygon click
    const handleRegionClick = (index: number) => {
        dispatch(selectRegion(index));
    };

    return (
        <>
            <MapContainer
                center={[52.52, 13.405]}
                zoom={12}
                className="absolute h-full w-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RegionPolygons
                    regions={regions}
                    onRegionClicked={
                        viewMode === ViewMode.MAIN_VIEW
                            ? handleRegionClick
                            : () => {}
                    }
                />

                {/* TIF layer overlay - only when region is selected */}
                {selectedRegionIndex !== null && <FixedTifLayer />}

                <LeafletMapController
                    selectedRegionIndex={selectedRegionIndex}
                    regions={regions}
                />

                {viewMode === ViewMode.DRAWING_VIEW && (
                    <CustomDrawingControl
                        ref={drawingControlRef}
                        drawingMode={currentDrawingMode}
                        onShapeCreated={handleShapeCreated}
                        onModeComplete={handleModeComplete}
                    />
                )}

                <ZoomControl position="bottomleft" />
            </MapContainer>

            {viewMode === ViewMode.DRAWING_VIEW && (
                <AddRegionModal
                    onDrawingModeChange={handleDrawingModeChange}
                    currentDrawingMode={currentDrawingMode}
                    hasActiveShape={hasActiveShape}
                    onEditMode={handleEditMode}
                    onDeleteShape={handleDeleteShape}
                    onFinishEdit={handleFinishEdit}
                />
            )}
        </>
    );
}

export default LeafletMap;
