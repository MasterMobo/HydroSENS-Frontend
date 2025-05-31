import React from "react";
import "leaflet/dist/leaflet.css";

import LeafletMap from "./components/LeafletMap/LeafletMap";
import RegionList from "./components/RegionList/RegionList";
import DateRangePicker from "./components/DateRangePicker/DateRangePicker";
import RegionDashboard from "./components/RegionDashboard";

import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

import { AnimatePresence, motion } from "framer-motion";
import { ViewMode } from "@/types/viewMode";
import AddRegionModal from "./components/RegionDrawing/AddRegionModal";

function MapPage() {
    const { selectedRegionIndex } = useSelector(
        (state: RootState) => state.regionState
    );
    const { viewMode } = useSelector((state: RootState) => state.viewModeState);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* base map */}
            <LeafletMap />

            {/* region list (left sidebar) */}
            {viewMode === ViewMode.MAIN_VIEW && <RegionList />}

            {/* date-range picker — anchored at bottom-center of the map */}
            {viewMode === ViewMode.MAIN_VIEW && (
                <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
                    {/* pointer-events auto so picker is clickable but wrapper isn’t */}
                    <div className="pointer-events-auto">
                        <DateRangePicker />
                    </div>
                </div>
            )}

            {viewMode === ViewMode.DRAWING_VIEW && <AddRegionModal />}

            {/* sliding dashboard (right) */}
            <AnimatePresence>
                {selectedRegionIndex != null && (
                    <motion.div
                        key="dashboard"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.35 }}
                        className="absolute inset-y-0 right-0 w-[50vw]"
                    >
                        <RegionDashboard />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default MapPage;
