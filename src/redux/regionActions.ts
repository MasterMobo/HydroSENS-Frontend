// Action Types
export const SELECT_REGION = "SELECT_REGION";
export const DELETE_REGION = "DELETE_REGION";

// Action Creators
export const selectRegion = (regionIndex: number | null) => ({
    type: SELECT_REGION,
    payload: regionIndex,
});

export const deleteRegion = (regionIndex: number) => ({
    type: DELETE_REGION,
    payload: regionIndex,
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

export type RegionActionTypes = SelectRegionAction | DeleteRegionAction;
