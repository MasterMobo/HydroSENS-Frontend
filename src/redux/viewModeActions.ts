import { ViewMode } from "@/types/viewMode";

// Action Types
export const SET_VIEW_MODE = "SET_VIEW_MODE";

// Action Creators - modified to handle timestamps
export const setViewMode = (mode: ViewMode) => ({
    type: SET_VIEW_MODE,
    payload: mode,
});

// Action Types Definition - updated to use number (timestamp) instead of Date
export interface SetViewModeAction {
    type: typeof SET_VIEW_MODE;
    payload: ViewMode;
}

export type ViewModeActionTypes = SetViewModeAction;
