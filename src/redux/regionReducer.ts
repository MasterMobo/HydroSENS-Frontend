import initialRegions from "../data/initialRegions";
import { Region } from "../types/region";
import {
    RegionActionTypes,
    SELECT_REGION,
    DELETE_REGION,
    ADD_REGION,
} from "./regionActions";

// Define the shape of the region state
export interface RegionState {
    regions: Region[];
    selectedRegionIndex: number | null;
}

const initialState: RegionState = {
    regions: initialRegions,
    selectedRegionIndex: null,
};

// Utility function to generate random colors
const generateRandomColor = () => {
    const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Utility function to calculate polygon area (simplified)
const calculatePolygonArea = (coordinates: [number, number][]) => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    const n = coordinates.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }

    // Convert to approximate km² (this is a rough approximation)
    area = Math.abs(area) / 2;
    area = area * 12391; // Rough conversion factor

    return Math.round(area * 100) / 100;
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
