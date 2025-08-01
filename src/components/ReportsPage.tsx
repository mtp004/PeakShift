import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

import {processRatesResults, type RateItem, type RatesAPIResponse } from '../APIs/OpenEIServices';
import { ReportCard } from './ReportCard';

export function ReportsPage() {
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const address = params.get('address');
  const decodedAddress = decodeURIComponent(address || '');
  
  const [rateResponse, setRateResponse] = useState<RatesAPIResponse | null>(null);

  function onSelectReport(report: RateItem) {
    const encodedName = encodeURIComponent(report.name);

    navigate(`/ratechart?address=${decodedAddress}&rate=${encodedName}`, {state: { report }});
  };

  useEffect(() => {
    if (decodedAddress) processRatesResults(decodedAddress, (result) => setRateResponse(result));
  }, [decodedAddress]);

  return (
    <div className="card-body p-0">
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
                onSelect={() => onSelectReport(item)}
              />
            ));
          })()}
        </div>
      </div>
      <div className="text-center mt-4 text-muted small">
        Data powered by <a href="https://openei.org" target="_blank" rel="noopener noreferrer">OpenEI</a>
      </div>
    </div>
  );
};

export default ReportsPage;