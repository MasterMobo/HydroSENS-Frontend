// Action Types
export const SELECT_REGION = "SELECT_REGION";

// Action Creators
export const selectRegion = (regionIndex: number | null) => ({
    type: SELECT_REGION,
    payload: regionIndex,
});

// Action Types Definition
export interface SelectRegionAction {
    type: typeof SELECT_REGION;
    payload: number | null;
}

export type RegionActionTypes = SelectRegionAction;
