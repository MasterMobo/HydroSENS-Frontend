import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { regionReducer } from "./regionReducer";
import { dateReducer } from "./dateReducers";
import { viewModeReducer } from "./viewModeReducers";
import { regionDrawingReducer } from "./regionDrawingReducer";
import { dashboardReducer } from "./dashboardReducer";

// Combine all reducers (currently just one)
const rootReducer = combineReducers({
    regionState: regionReducer,
    dateState: dateReducer,
    viewModeState: viewModeReducer,
    regionDrawingState: regionDrawingReducer,
    dashboard:   dashboardReducer,
});

// Create the store
export const store = configureStore({ reducer: rootReducer });

// Define the RootState type for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
