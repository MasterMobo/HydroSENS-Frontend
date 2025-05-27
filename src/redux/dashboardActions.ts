export const FETCH_HYDROSENS_REQUEST = "FETCH_HYDROSENS_REQUEST";
export const FETCH_HYDROSENS_SUCCESS = "FETCH_HYDROSENS_SUCCESS";
export const FETCH_HYDROSENS_FAILURE = "FETCH_HYDROSENS_FAILURE";

import axios from "axios";
import { ThunkAction } from "redux-thunk";
import { RootState } from "@/redux/store";
import { HydrosensResponse, HydrosensOutputs } from "@/types/hydrosens";
import { regionToGeoJSON } from "@/utils/regionToGeoJSON";
import { AnyAction } from "@reduxjs/toolkit";
import { postHydrosens } from "@/api/hydrosens";

/* Action creators */
export const fetchHydrosensRequest = () => ({ type: FETCH_HYDROSENS_REQUEST });
export const fetchHydrosensSuccess = (data: HydrosensOutputs) => ({
  type: FETCH_HYDROSENS_SUCCESS,
  payload: data,
});
export const fetchHydrosensFailure = (msg: string) => ({
  type: FETCH_HYDROSENS_FAILURE,
  payload: msg,
});

/* Thunk that calls the API */
export const fetchHydrosens =
  (): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState) => {
    try {
      dispatch(fetchHydrosensRequest());

      const { regionState, dateState } = getState();

      const region = regionState.regions[regionState.selectedRegionIndex!];
      const geojson = regionToGeoJSON(region.coordinates);
      console.log("Base URL:", import.meta.env.VITE_BACKEND_API_URL);
      const fd = new FormData();
      fd.append("start_date", new Date(dateState.startDate).toISOString());
      fd.append("end_date", new Date(dateState.endDate).toISOString());
      fd.append("geojson", JSON.stringify(geojson));
      fd.append(
        "statistics",
        "curve-number, ndvi, precipitation, soil-fraction, temperature, vegetation-fraction"
      );

      const res = await postHydrosens(fd);
      dispatch(fetchHydrosensSuccess(res.outputs));
    } catch (err: any) {
      dispatch(fetchHydrosensFailure(err.message || "Unknown error"));
    }
  };
