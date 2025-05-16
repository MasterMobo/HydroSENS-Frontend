import { DateActionTypes, SET_START_DATE, SET_END_DATE } from "./dateActions";

// Define the shape of the date state
export interface DateState {
    startDate: Date;
    endDate: Date;
}

const getSevenDaysAgo = (): Date => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
};

const initialState: DateState = {
    startDate: getSevenDaysAgo(),
    endDate: new Date(),
};

// Reducer
export const dateReducer = (
    state = initialState,
    action: DateActionTypes
): DateState => {
    switch (action.type) {
        case SET_START_DATE:
            return {
                ...state,
                startDate: action.payload,
            };
        case SET_END_DATE:
            return {
                ...state,
                endDate: action.payload,
            };
        default:
            return state;
    }
};
