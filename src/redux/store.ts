import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { regionReducer } from "./regionReducer";
import { dateReducer } from "./dateReducers";

// Combine all reducers (currently just one)
const rootReducer = combineReducers({
    regionState: regionReducer,
    dateState: dateReducer,
});

// Create the store
export const store = configureStore({ reducer: rootReducer });

// Define the RootState type for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
