import initialRegions from "../data/initialRegions";
import { Region } from "../types/region";
import { RegionActionTypes, SELECT_REGION } from "./regionActions";

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
        default:
            return state;
    }
};
