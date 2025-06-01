import { ThunkAction } from "redux-thunk";
import { RootState } from "@/redux/store";
import { HydrosensOutputs } from "@/types/hydrosens";
import { regionToShapefileZip } from "@/utils/regionToShapefile";
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

/* Thunk that calls the API */
export const fetchHydrosens =
  (): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState) => {
    try {
      dispatch(fetchHydrosensRequest());

      const { regionState, dateState } = getState();
      const selectedIndex = regionState.selectedRegionIndex;
      const region = regionState.regions[selectedIndex!];

      // Generate zipped shapefile
      const zipBlob = await regionToShapefileZip(region.coordinates);

      const fd = new FormData();
      fd.append("shapefile", zipBlob, "region.zip");
      const formatLocal = (d: Date) => {
        const year  = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day   = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      
      fd.append("start_date", formatLocal(new Date(dateState.startDate)));
      fd.append("end_date",   formatLocal(new Date(dateState.endDate)));
      fd.append(
        "statistics",
        "curve-number, ndvi, precipitation, soil-fraction, temperature, vegetation-fraction"
      );
      fd.append("amc", "100");
      fd.append("p", "2");
      console.log(formatLocal(new Date(dateState.startDate)), formatLocal(new Date(dateState.endDate)));

      const res = await postHydrosens(fd);
      dispatch(fetchHydrosensSuccess(res.outputs));
    } catch (err: any) {
      dispatch(fetchHydrosensFailure(err.message || "Unknown error"));
    }
  };
