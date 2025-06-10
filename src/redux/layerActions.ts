import { ThunkAction } from "redux-thunk";
import { RootState } from "@/redux/store";
import { AnyAction } from "@reduxjs/toolkit";
import { fetchLayerTifs, DateLayers } from "@/api/layers";

/* Action types */
export const FETCH_LAYERS_REQUEST = "FETCH_LAYERS_REQUEST";
export const FETCH_LAYERS_SUCCESS = "FETCH_LAYERS_SUCCESS";
export const FETCH_LAYERS_FAILURE = "FETCH_LAYERS_FAILURE";
export const SET_SELECTED_DATE = "SET_SELECTED_DATE";
export const SET_SELECTED_LAYER = "SET_SELECTED_LAYER";
export const CLEAR_LAYERS = "CLEAR_LAYERS";

/* Action creators */
export const fetchLayersRequest = () => ({ type: FETCH_LAYERS_REQUEST });
export const fetchLayersSuccess = (data: DateLayers[]) => ({
    type: FETCH_LAYERS_SUCCESS,
    payload: data,
});
export const fetchLayersFailure = (error: string) => ({
    type: FETCH_LAYERS_FAILURE,
    payload: error,
});
export const setSelectedDate = (date: string | null) => ({
    type: SET_SELECTED_DATE,
    payload: date,
});
export const setSelectedLayer = (layerName: string | null) => ({
    type: SET_SELECTED_LAYER,
    payload: layerName,
});
export const clearLayers = () => ({ type: CLEAR_LAYERS });

/* Thunk that calls the API */
export const fetchLayers =
    (): ThunkAction<void, RootState, unknown, AnyAction> =>
    async (dispatch) => {
        try {
            dispatch(fetchLayersRequest());
            const layers = await fetchLayerTifs();
            dispatch(fetchLayersSuccess(layers));
        } catch (err: any) {
            dispatch(
                fetchLayersFailure(err.message || "Failed to fetch layers")
            );
        }
    };
