export interface PvWattsResult {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  errors: string[];
  warnings: string[];
  [key: string]: any;
}

export const ARRAY_TYPES: Record<string, string> = {
  "0": "Fixed – Open Rack",
  "1": "Fixed – Roof Mounted",
  "2": "1-Axis",
  "3": "1-Axis Backtracking",
  "4": "2-Axis",
};

export const MODULE_TYPES: Record<string, string> = {
  "0": "Standard",
  "1": "Premium",
  "2": "Thin Film",
};

/**
 * Fetches PVWatts result from the backend Cloud Function.
 * 
 * @param lat - Latitude of the location
 * @param lon - Longitude of the location
 * @param purpose - Purpose parameter for backend optimization
 * @returns Parsed PVWatts result
 * @throws Error if network or API returns failure
 */
export async function fetchPvWatts(
  lat: number,
  lon: number,
  purpose: string
): Promise<PvWattsResult> {
  const res = await fetch(
    "https://us-central1-peakshift-react.cloudfunctions.net/get_pvwatts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, purpose }),
    }
  );

  if (!res.ok) {
    let errMessage = "Failed to fetch PVWatts data";
    try {
      const errData = await res.json();
      errMessage = errData.error || errMessage;
    } catch (_) {
      // ignore JSON parse error
    }
    throw new Error(errMessage);
  }

  return res.json();
}