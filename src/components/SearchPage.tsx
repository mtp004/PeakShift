import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import AddressInput from './AddressInput';
import AddressCard from './AddressCard';
import { fetchGeocode } from '../APIs/GeocodeService';
import { useNavigate } from 'react-router-dom';

import type { GeocodeResult } from '../APIs/GeocodeService';

function SearchPage() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult[] | null>(null);
  const navigate = useNavigate();

  const debouncedQuery = useRef(
    debounce(async (addr: string) => {
      const result = await fetchGeocode(addr);
      setGeocodeResult(result);
    }, 1000)
  ).current;

  useEffect(() => {
    if (address.trim() !== '') {
      debouncedQuery(address);
    } else {
      debouncedQuery.cancel();
      setGeocodeResult(null);
    }
  }, [address]);

  function onSelectReport(result: GeocodeResult){
    navigate('/report', {state: {geocodeResult: result}});
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      {/* Main content */}
      <div className="container" style={{ maxWidth: '600px'}}>
        <h1 className="text-center mb-4">PeakShift - Electric Usage Optimizer</h1>
        <div className="position-relative">
          <AddressInput address={address} setAddress={setAddress} />
          {geocodeResult && (
            <div
              className="dropdown-menu show p-0 border-0 shadow-sm"
              style={{
                zIndex: 100,
              }}
            >
              {geocodeResult.map(result => (
              <AddressCard
                key={result.place_id}
                geocodeResult={result}
                onSelect={() => onSelectReport(result)}
              />
            ))}
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <small className="text-muted">
            Powered by{' '}
            <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
              Nominatim
            </a>{' '}
            & OpenStreetMap
          </small>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;