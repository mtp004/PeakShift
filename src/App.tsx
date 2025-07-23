import { useState, useEffect, useRef } from 'react';
import AddressInput from './components/AddressInput';
import debounce from 'lodash.debounce';
import AddressCard from './components/AddressCard';

type geocodeResults = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  boundingbox: string[];
};

function App() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<geocodeResults | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Query function: fetch geocode info for given address
  async function QueryGeocodeOfAddress(addr: string) {
    if (!addr.trim()) {
      setGeocodeResult(null);
      return;
    }

    try {
      const params = new URLSearchParams({
        format: 'json',
        addressdetails: '1',
        limit: '1',
        q: addr,
      });

      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      console.log('Fetching:', url);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PeakShift-Electric-Usage-Optimizer/1.0 (your-email@example.com)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: geocodeResults[] = await response.json();
      if (data.length > 0) {
        setGeocodeResult(data[0]);
        console.log('Geocode result:', data[0]);
      } else {
        setGeocodeResult(null);
        console.log('No results found.');
      }
    } catch (error) {
      console.error('Query error:', error);
      setGeocodeResult(null);
    }
  }

  // Debounced version of queryGeocode, with 1 second delay
  const debouncedQuery = useRef(
    debounce((addr: string) => {
      QueryGeocodeOfAddress(addr);
    }, 1000)
  ).current;

  // Run debounced query whenever address changes
  useEffect(() => {
    if (address.trim() !== '') {
      debouncedQuery(address);
    } else {
      debouncedQuery.cancel();
      setGeocodeResult(null);
    }
  }, [address, debouncedQuery]);

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="text-center mb-4">PeakShift - Electric Usage Optimizer</h1>
        <div className="position-relative">
          <AddressInput address={address} setAddress={setAddress} />
          {geocodeResult && (
            <div
              ref={dropdownRef}
              className="dropdown-menu show p-0 border-0 shadow-sm"
              style={{
              position: 'absolute',
              top: '100%',
              zIndex: 1000,
              width: 'fit-content',
              padding: 0, // Explicitly remove padding
              lineHeight: 'normal', // Prevent line-height from adding space
            }}
            >
              <AddressCard address={geocodeResult.display_name} />
            </div>
          )}
        </div>
        <div className="text-center mt-3">
            <small className="text-muted">
                Powered by{' '}
                <a
                    href="https://nominatim.openstreetmap.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Nominatim
                </a>{' '}
                & OpenStreetMap
            </small>
          </div>
      </div>
    </div>
  );
}

export default App;