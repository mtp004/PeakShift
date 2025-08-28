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
      <div className="fw-bold mb-2">About PeakShift</div>
      <div className="mb-3 small">
        PeakShift helps you optimize your electricity usage by identifying the best times to run high-energy appliances. 
        Get personalized insights based on your location's utility rates and demand patterns to reduce your energy costs.
      </div>
      
      <div className="fw-bold mb-2">How to get started:</div>
      <ol className="mb-2 ps-3 small">
        <li className="mb-1">
          <strong>Enter your complete address</strong> in the search box (include street, city, and state)
        </li>
        <li className="mb-1">
          <strong>Select your address</strong> from the dropdown suggestions that appear
        </li>
        <li className="mb-1">
          <strong>View your personalized report</strong> showing peak hours, rates, and optimization opportunities
        </li>
        <li className="mb-1">
          <strong>Schedule high-energy activities</strong> during recommended off-peak times to save money
        </li>
      </ol>
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