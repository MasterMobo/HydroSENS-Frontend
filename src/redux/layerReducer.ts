// redux/layerReducer.ts
import {
    FETCH_LAYERS_REQUEST,
    FETCH_LAYERS_SUCCESS,
    FETCH_LAYERS_FAILURE,
    SET_SELECTED_DATE,
    SET_SELECTED_LAYER,
    CLEAR_LAYERS,
} from "./layerActions";
import { DateLayers } from "@/api/layers";

export interface LayerState {
    loading: boolean;
    error?: string;
    dateLayers: DateLayers[];
    selectedDate: string | null;
    selectedLayer: string | null;
}

const initialState: LayerState = {
    loading: false,
    dateLayers: [],
    selectedDate: null,
    selectedLayer: null,
};

export const layerReducer = (state = initialState, action: any): LayerState => {
    switch (action.type) {
        case FETCH_LAYERS_REQUEST:
            return { ...state, loading: true, error: undefined };
        case FETCH_LAYERS_SUCCESS:
            return {
                ...state,
                loading: false,
                dateLayers: action.payload,
                // Auto-select first date and layer if available
                selectedDate:
                    action.payload.length > 0 ? action.payload[0].date : null,
                selectedLayer:
                    action.payload.length > 0 &&
                    action.payload[0].layers.length > 0
                        ? action.payload[0].layers[0].name
                        : null,
            };
        case FETCH_LAYERS_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case SET_SELECTED_DATE:
            return {
                ...state,
                selectedDate: action.payload,
                // Reset selected layer when date changes
                selectedLayer: null,
            };
        case SET_SELECTED_LAYER:
            return { ...state, selectedLayer: action.payload };
        case CLEAR_LAYERS:
            return initialState;
        default:
            return state;
    }
};
