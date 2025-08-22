import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import AddressInput from './AddressInput';
import AddressCard from './AddressCard';
import { fetchGeocode } from '../APIs/GeocodeService';
import { useNavigate } from 'react-router-dom';
import type { GeocodeResult } from '../APIs/GeocodeService';

function SearchPage() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult[] | null | undefined>(null);
  const navigate = useNavigate();

  const debouncedQuery = useRef(
    debounce(async (addr: string) => {
      const result = await fetchGeocode(addr);
      setGeocodeResult(result);
    }, 1000)
  ).current;

  useEffect(() => {
    if (address.trim() !== '') {
      setGeocodeResult(undefined);
      debouncedQuery(address);
    } else {
      debouncedQuery.cancel();
      setGeocodeResult(null);
    }
  }, [address]);

  function onSelectAddress(address: string) {
    const encodedAddress = encodeURIComponent(address);
    navigate(`/search/report?address=${encodedAddress}`);
  }

  return (
    <div className="h-100 d-flex justify-content-center align-items-center bg-light">
      {/* Main content */}
      <div className="container" style={{ maxWidth: '600px'}}>
        <h1 className="text-center mb-4">PeakShift - Electric Usage Optimizer</h1>
        <div className="position-relative">
          <AddressInput address={address} setAddress={setAddress} />
          {geocodeResult !== null && (
            <div
              className="dropdown-menu show p-0 border-0 shadow-sm w-100"
              style={{
                zIndex: 100,
              }}
            >
              {geocodeResult === undefined ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border" role="status"></div>
                </div>
              ) : (
                geocodeResult.map(result => (
                  <AddressCard
                    key={result.place_id}
                    geocodeResult={result}
                    onSelect={() => onSelectAddress(result.display_name)}
                  />
                ))
              )}
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