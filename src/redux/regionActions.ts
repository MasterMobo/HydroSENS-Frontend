import { Region } from "@/types/region";

// Action Types
export const SELECT_REGION = "SELECT_REGION";
export const DELETE_REGION = "DELETE_REGION";
export const ADD_REGION = "ADD_REGION";

// Action Creators
export const selectRegion = (regionIndex: number | null) => ({
    type: SELECT_REGION,
    payload: regionIndex,
});

export const deleteRegion = (regionIndex: number) => ({
    type: DELETE_REGION,
    payload: regionIndex,
});

export const addRegion = (region: Region) => ({
    type: ADD_REGION,
    payload: region,
});

// Action Types Definition
export interface SelectRegionAction {
    type: typeof SELECT_REGION;
    payload: number | null;
}

export interface DeleteRegionAction {
    type: typeof DELETE_REGION;
    payload: number;
}

export interface AddRegionAction {
    type: typeof ADD_REGION;
    payload: Region;
}

export type RegionActionTypes = SelectRegionAction | DeleteRegionAction | AddRegionAction;
