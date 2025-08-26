import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import AddressInput from './AddressInput';
import AddressCard from './AddressCard';
import { Tooltip } from './Tooltip';
import { fetchGeocode } from '../APIs/GeocodeService';
import { useNavigate } from 'react-router-dom';
import type { GeocodeResult } from '../APIs/GeocodeService';

function SearchPage() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const debouncedQuery = useRef(
    debounce(async (addr: string) => {
      setIsLoading(true);
      const result = await fetchGeocode(addr);
      setGeocodeResult(result);
      setIsLoading(false);
    }, 1000)
  ).current;

  useEffect(() => {
    if (address.trim() !== '') {
      setGeocodeResult(null);
      setIsLoading(false);
      debouncedQuery(address);
    } else {
      debouncedQuery.cancel();
      setGeocodeResult(null);
      setIsLoading(false);
    }
  }, [address]);

  function onSelectAddress(address: string) {
    const encodedAddress = encodeURIComponent(address);
    navigate(`/search/report?address=${encodedAddress}`);
  }

  const helpTooltip = (
    <>
      <div className="fw-bold mb-2">How to use PeakShift:</div>
      <ul className="mb-2 ps-3">
        <li>Enter your complete address in the search box</li>
        <li>Select your address from the dropdown suggestions</li>
        <li>View your personalized electric usage optimization report</li>
        <li>Find the best times to use high-energy appliances</li>
      </ul>
    </>
  );

  return (
    <div className="h-100 d-flex justify-content-center align-items-center bg-light position-relative">
      {/* Tooltip Component */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Tooltip tooltip={helpTooltip} />
      </div>
      
      {/* Main content */}
      <div className="container" style={{ maxWidth: '600px'}}>
        <h1 className="text-center mb-4">PeakShift - Electric Usage Optimizer</h1>
        <div className="position-relative">
          <AddressInput address={address} setAddress={setAddress} />
          {(geocodeResult !== null || isLoading) && address.trim() !== '' && (
            <div
              className="dropdown-menu show p-0 border-0 shadow-sm w-100"
              style={{
                zIndex: 100,
              }}
            >
              {isLoading ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border" role="status"></div>
                </div>
              ) : geocodeResult && geocodeResult.length === 0 ? (
                <div className="px-3 py-2 text-muted text-center">
                  No address match in{' '}
                  <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
                    OpenStreetMap
                  </a>
                  's database
                </div>
              ) : geocodeResult ? (
                geocodeResult.map(result => (
                  <AddressCard
                    key={result.place_id}
                    geocodeResult={result}
                    onSelect={() => onSelectAddress(result.display_name)}
                  />
                ))
              ) : null}
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