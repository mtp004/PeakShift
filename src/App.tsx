import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import AddressInput from './components/AddressInput';
import AddressCard from './components/AddressCard';
import Reports from './components/Reports';
import { fetchGeocode } from './APIs/GeocodeService';
import type { GeocodeResult } from './APIs/GeocodeService';

function App() {
  const [address, setAddress] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<GeocodeResult | null>(null);

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
  }, [address, debouncedQuery]);

  function handleSelectReport(result: GeocodeResult){
    setSelectedResult(result);
  };

  function handleClose(){
    setSelectedResult(null);
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
                onSelect={() => handleSelectReport(result)}
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
      {/* Reports overlay as a Bootstrap modal */}
      {selectedResult && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 105 }}
          >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <Reports geocodeResult={selectedResult} onBack={handleClose} />
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 104 }} />
        </>
      )}
    </div>
  );
}

export default App;