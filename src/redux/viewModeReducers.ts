import { ViewMode } from "@/types/viewMode";
import { SET_VIEW_MODE, ViewModeActionTypes } from "./viewModeActions";

// Define the shape of the date state
export interface ViewModeState {
    mode: ViewMode;
}

const initialState: ViewModeState = {
    mode: ViewMode.MAIN_VIEW,
};

// Reducer
export const viewModeReducer = (
    state = initialState,
    action: ViewModeActionTypes
): ViewModeState => {
    switch (action.type) {
        case SET_VIEW_MODE:
            return {
                ...state,
                mode: action.payload,
            };
        default:
            return state;
    }
};
