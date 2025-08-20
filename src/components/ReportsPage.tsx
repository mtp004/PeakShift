import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import UploadPage from './UploadPage';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import {processRatesResults, type RateItem, type RatesAPIResponse } from '../APIs/OpenEIServices';
import { ReportCard } from './ReportCard';

export function ReportsPage() {
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const address = params.get('address');
  const decodedAddress = decodeURIComponent(address || '');

  const [rateResponse, setRateResponse] = useState<RatesAPIResponse | null | undefined>(undefined);

  function onSelectReport(report: RateItem) {
    const encodedName = encodeURIComponent(report.name);

    navigate(`/ratechart?address=${decodedAddress}&rate=${encodedName}`, {state: { report }});
  };

  useEffect(() => {
    if (decodedAddress) processRatesResults(decodedAddress, (result) => setRateResponse(result));
  }, [decodedAddress]);

  return (
    <div className="card-body p-0 d-flex flex-column h-100">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm fw-semibold"
            onClick={() => window.history.back()}
            aria-label="Navigate back to address search page"
          >
            Back
          </button>
          <div className="d-flex align-items-center gap-1">
            <span className="text-muted">
              Not sure which rate schedule you have? Try uploading your electric bill here →
            </span>
            <div className="dropdown position-relative">
              <button
                className="btn btn-outline-primary btn-sm fw-semibold dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
              >
                Upload
              </button>
              <div className="dropdown-menu p-2">
                <UploadPage />
              </div>
            </div>
          </div>
        </div>
        <h5 className="mt-2 mb-3 fw-bold">Here's what we have found</h5>
      </div>

      <div className="flex-grow-1 overflow-auto border p-1">
        {(() => {
          if (!rateResponse) {
            return (
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status"></div>
              </div>
            );
          }

          if (rateResponse.items.length === 0) {
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
        <div className="text-center mt-4 text-muted small p-2 flex-shrink-0">
          Data powered by <a href="https://openei.org" target="_blank" rel="noopener noreferrer">OpenEI</a>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;