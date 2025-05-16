// Action Types
export const SET_START_DATE = "SET_START_DATE";
export const SET_END_DATE = "SET_END_DATE";

// Action Creators
export const setStartDate = (date: Date) => ({
    type: SET_START_DATE,
    payload: date,
});

export const setEndDate = (date: Date) => ({
    type: SET_END_DATE,
    payload: date,
});

// Action Types Definition
export interface SetStartDateAction {
    type: typeof SET_START_DATE;
    payload: Date;
}

export interface SetEndDateAction {
    type: typeof SET_END_DATE;
    payload: Date;
}

export type DateActionTypes = SetStartDateAction | SetEndDateAction;
