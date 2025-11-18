export type GeocodeResult = {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      bounds?: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
      viewport: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
    };
    place_id: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    types: string[];
    navigation_points?: Array<{
      location: {
        latitude: number;
        longitude: number;
      };
    }>;
  }>;
  status: string;
  error_message?: string;
};

// Async function to query Google Maps Geocoding via your backend
export async function fetchGeocode(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;

  const params = new URLSearchParams({ address });
  // Update to your new Cloud Run URL
  const url = `https://geocode-s43aur27va-uc.a.run.app?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: GeocodeResult = await res.json();
    console.log('Raw Geocode Response:', JSON.stringify(data, null, 2));
    // Check if geocoding was successful
    if (data.status !== 'OK') {
      console.error('Geocoding failed:', data.status, data.error_message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Geocode fetch error:", error);
    return null;
  }
}