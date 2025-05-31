import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { regionReducer } from "./regionReducer";
import { dateReducer } from "./dateReducers";
import { viewModeReducer } from "./viewModeReducers";
import { regionDrawingReducer } from "./regionDrawingReducer";

// Combine all reducers (currently just one)
const rootReducer = combineReducers({
    regionState: regionReducer,
    dateState: dateReducer,
    viewModeState: viewModeReducer,
    regionDrawingState: regionDrawingReducer,
});

// Create the store
export const store = configureStore({ reducer: rootReducer });

// Define the RootState type for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
