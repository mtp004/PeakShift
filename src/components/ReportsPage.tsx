import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GeocodeResult } from '../APIs/GeocodeService';
import { fetchAddressElectricRates, processRatesResults, type RatesAPIResponse } from '../APIs/OpenEIServices';
import { ReportCard } from './ReportCard';

type LocationState = {
  geocodeResult: GeocodeResult;
};

export function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const geocodeResult = state.geocodeResult;
  const [rateResponse, setRateResponse] = useState<RatesAPIResponse | null>(null);

  useEffect(() => {
    if (geocodeResult) processRatesResults(geocodeResult.display_name, (result) => setRateResponse(result));
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
          {(() => {
            if (!rateResponse) {
              return (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status"></div>
                </div>
              );
            }
            
            if (rateResponse.items.length === 0) {
              // No data found
              return (
                <div className="alert alert-info">
                  No residential electric rates found for this address.
                </div>
              );
            }
            
            // Has data - render ReportCards
            return rateResponse.items.map((item, index) => (
              <ReportCard 
                key={`${index}`}
                rateItem={item}
                onSelect={() => console.log("hello world")}
              />
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;