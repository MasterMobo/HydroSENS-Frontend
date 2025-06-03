import { ThunkAction } from "redux-thunk";
import { RootState } from "@/redux/store";
import { HydrosensOutputs } from "@/types/hydrosens";
import { AnyAction } from "@reduxjs/toolkit";
import { postHydrosens } from "@/api/hydrosens";

/* Action types */
export const FETCH_HYDROSENS_REQUEST = "FETCH_HYDROSENS_REQUEST";
export const FETCH_HYDROSENS_SUCCESS = "FETCH_HYDROSENS_SUCCESS";
export const FETCH_HYDROSENS_FAILURE = "FETCH_HYDROSENS_FAILURE";

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

/* Thunk that calls the API, sending lon/lat instead of a shapefile */
export const fetchHydrosens =
  (): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState) => {
    try {
      dispatch(fetchHydrosensRequest());

      const { regionState, dateState } = getState();
      const selectedIndex = regionState.selectedRegionIndex;
      if (selectedIndex == null) throw new Error("No region selected");

      const region = regionState.regions[selectedIndex];
      if (!region || !Array.isArray(region.coordinates) || region.coordinates.length === 0) {
        throw new Error("Selected region has no coordinates");
      }

      /* Compute centroid of lat/lng polygon */
      const coords: [number, number][] = region.coordinates as [number, number][];
      let sumLat = 0;
      let sumLng = 0;
      coords.forEach(([lat, lng]) => {
        sumLat += lat;
        sumLng += lng;
      });
      const centroidLat = sumLat / coords.length;
      const centroidLng = sumLng / coords.length;

      const fd = new FormData();
      fd.append("lon", String(centroidLng));
      fd.append("lat", String(centroidLat));

      const formatLocal = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      fd.append("start_date", formatLocal(new Date(dateState.startDate)));
      fd.append("end_date",   formatLocal(new Date(dateState.endDate)));
      fd.append(
        "statistics",
        "curve-number, ndvi, precipitation, soil-fraction, temperature, vegetation-fraction"
      );
      fd.append("amc", String(dateState.amc ?? 100));
      fd.append("p",  String(dateState.p   ?? 2));

      const res = await postHydrosens(fd);
      dispatch(fetchHydrosensSuccess(res.outputs));
    } catch (err: any) {
      dispatch(fetchHydrosensFailure(err.message || "Unknown error"));
    }
  };