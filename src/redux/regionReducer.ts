import { calculatePolygonArea } from "@/utils/map";
import initialRegions from "../data/initialRegions";
import { Region } from "../types/region";
import {
    RegionActionTypes,
    SELECT_REGION,
    DELETE_REGION,
    ADD_REGION,
} from "./regionActions";
import { generateRandomColor } from "@/utils/colors";

// Define the shape of the region state
export interface RegionState {
    regions: Region[];
    selectedRegionIndex: number | null;
}

const initialState: RegionState = {
    regions: initialRegions,
    selectedRegionIndex: null,
};

// Reducer
export const regionReducer = (
    state = initialState,
    action: RegionActionTypes
): RegionState => {
    switch (action.type) {
        case SELECT_REGION:
            return {
                ...state,
                selectedRegionIndex: action.payload,
            };
        case DELETE_REGION: {
            // Create a new array without the region at the specified index
            const updatedRegions = state.regions.filter(
                (_, index) => index !== action.payload
            );

            // Reset the selected region if we deleted the selected one
            let newSelectedIndex = state.selectedRegionIndex;
            if (state.selectedRegionIndex === action.payload) {
                newSelectedIndex = null;
            } else if (
                state.selectedRegionIndex !== null &&
                state.selectedRegionIndex > action.payload
            ) {
                // Adjust selected index if it's after the deleted item
                newSelectedIndex = state.selectedRegionIndex - 1;
            }

            return {
                ...state,
                regions: updatedRegions,
                selectedRegionIndex: newSelectedIndex,
            };
        }
        case ADD_REGION: {
            const newRegion = {
                ...action.payload,
                color: action.payload.color || generateRandomColor(),
                area:
                    action.payload.area ||
                    calculatePolygonArea(action.payload.coordinates),
            };

            return {
                ...state,
                regions: [...state.regions, newRegion],
            };
        }
        default:
            return state;
    }
};
