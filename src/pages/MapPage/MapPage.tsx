import React from "react";
import "leaflet/dist/leaflet.css";
import RegionList from "./components/RegionList/RegionList";
import LeafletMap from "./components/LeafletMap";
import RegionDashboard from "./components/RegionDashboard";

import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import DatePickerModal from "./components/DatePickerModal/DatePickerModal";
import DateRangePicker from "./components/DatePickerModal/DateRangePicker";

import { AnimatePresence, motion } from "framer-motion";

function MapPage() {
  const { selectedRegionIndex } = useSelector(
    (state: RootState) => state.regionState
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* left-hand map / polygons */}
      <LeafletMap />

      {/* region list (left sidebar) */}
      <RegionList />

      {/* right-hand dashboard */}
      <AnimatePresence>
        {selectedRegionIndex != null && (
          <motion.div
            key="dashboard"                     /* keeps component mounted when region changes */
            initial={{ x: "100%" }}             /* start just off-screen right */
            animate={{ x: 0 }}                  /* slide in */
            exit={{ x: "100%" }}                /* slide out when Back sets index to null */
            transition={{ type: "tween", duration: 0.35 }}
            className="absolute inset-y-0 right-0 w-[50vw]" /* wrapper that slides */
          >
            <RegionDashboard />                 {/* dashboard content stays mounted */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MapPage;
