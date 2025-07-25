import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GeocodeResult } from '../APIs/GeocodeService';
import { fetchAddressElectricRates, type RatesAPIResponse } from '../APIs/OpenEIServices';

type LocationState = {
  geocodeResult: GeocodeResult;
};

export function Reports() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const geocodeResult = state.geocodeResult;
  const [rateResponse, setRateResponse] = useState<RatesAPIResponse | null>(null);

  async function fetchRates(){
      const result = await fetchAddressElectricRates(geocodeResult.display_name);
      setRateResponse(result);
    };

  useEffect(() => {
    if (!geocodeResult) return;

    fetchRates();
  }, [geocodeResult]);

  return (
    <div className="card shadow-sm p-0">
      <div className="card-body p-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={() => window.history.back()}
          aria-label="Navigate back to address search page"
        >
          Back
        </button>
        
        <h5 className="mt-2 mb-3 fw-bold">Here's what we have found</h5>

        <div>
          <pre>{JSON.stringify(rateResponse, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default Reports;