export type GeocodeResult = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  class: string;
  type: string;
  importance: number;
  addresstype: string;
  place_rank: number;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  boundingbox: [string, string, string, string];
};

// Reusable async function to query Nominatim
export async function fetchGeocode(address: string): Promise<GeocodeResult[]> {
  if (!address.trim()) return [];

  const params = new URLSearchParams({
    format: 'json',
    addressdetails: '1',
    limit: '2',
    q: address,
    countrycodes: 'us'
  });

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PeakShift-Electric-Usage-Optimizer/1.0 (your-email@example.com)',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: GeocodeResult[] = await res.json();
    return data; // Always return the array, even if empty
  } catch (error) {
    console.error('Geocode fetch error:', error);
    return []; // Return empty array on error
  }
}