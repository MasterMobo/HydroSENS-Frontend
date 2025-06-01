/**
 * Metrics reported for a single date-key in `outputs`
 * (Add/remove properties if the backend changes.)
 */
export interface HydrosensMetrics {
  "curve-number":        number;
  ndvi:                  number;
  precipitation:         number;
  "soil-fraction":       number;
  temperature:           number;
  "vegetation-fraction": number;
}

/**
 * outputs: indexed by ISO-date string → metrics object
 */
export type HydrosensOutputs = Record<string, HydrosensMetrics>;

export interface HydrosensResponse {
  message: string;          // "Hydrosens run completed successfully"
  outputs: HydrosensOutputs;
}
