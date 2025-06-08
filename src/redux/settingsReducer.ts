import {
  type SettingsActionTypes,
  SET_SELECTED_METRICS,
  SET_ENDMEMBER_TYPE,
  TOGGLE_SETTINGS_MODAL,
  RESET_SETTINGS,
  type MetricKey,
  type EndmemberType,
  AVAILABLE_METRICS,
} from "./settingsActions"

// Define the shape of the settings state
export interface SettingsState {
  selectedMetrics: MetricKey[]
  endmemberType: EndmemberType
  isSettingsModalOpen: boolean
}

// Default state - all metrics selected, agricultural endmember type
const initialState: SettingsState = {
  selectedMetrics: AVAILABLE_METRICS.map((metric) => metric.key),
  endmemberType: "3",
  isSettingsModalOpen: false,
}

// Reducer
export const settingsReducer = (state = initialState, action: SettingsActionTypes): SettingsState => {
  switch (action.type) {
    case SET_SELECTED_METRICS:
      return {
        ...state,
        selectedMetrics: action.payload,
      }
    case SET_ENDMEMBER_TYPE:
      return {
        ...state,
        endmemberType: action.payload,
      }
    case TOGGLE_SETTINGS_MODAL:
      return {
        ...state,
        isSettingsModalOpen: action.payload,
      }
    case RESET_SETTINGS:
      return initialState
    default:
      return state
  }
}
