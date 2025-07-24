import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import AddressInput from './components/AddressInput';
import AddressCard from './components/AddressCard';
import { fetchGeocode } from './APIs/GeocodeService';
import type { GeocodeResult } from './APIs/GeocodeService';

function App() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);

  // Debounced geocode query
  const debouncedQuery = useRef(
    debounce(async (addr: string) => {
      const result = await fetchGeocode(addr);
      setGeocodeResult(result);
    }, 1000)
  ).current;

  // Run debounced query when address changes
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
              className="dropdown-menu show p-0 border-0 shadow-sm"
              style={{
                position: 'absolute',
                top: '100%',
                zIndex: 1000,
                width: 'fit-content',
                padding: 0,
                lineHeight: 'normal',
              }}
            >
              <AddressCard geocodeResult={geocodeResult} />
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
