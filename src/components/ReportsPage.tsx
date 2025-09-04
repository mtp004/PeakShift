import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import UploadPage from './UploadPage';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Tooltip } from './Tooltip';

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
    navigate(`/search/ratechart?address=${decodedAddress}&rate=${encodedName}`, {state: { report }});
  }

  useEffect(() => {
    if (decodedAddress) processRatesResults(decodedAddress, (result) => setRateResponse(result));
  }, [decodedAddress]);

  const helpTooltip = (
    <>
      <div className="fw-bold mb-2">About Rate Reports</div>
      <div className="mb-3 small">
        These reports show available residential electricity rate schedules from your local utility company. 
        Each rate has different pricing structures, peak hours, and seasonal variations that affect your bill.
      </div>
      
      <div className="fw-bold mb-2">How to use this page:</div>
      <ol className="mb-2 ps-3 small">
        <li className="mb-1">
          <strong>Review available rates</strong> - Browse the rate schedules available for your address
        </li>
        <li className="mb-1">
          <strong>Select a rate to explore</strong> - Click "Select" on any report to view detailed charts and analysis
        </li>
        <li className="mb-1">
          <strong>Upload your bill (optional)</strong> - If unsure which rate applies to you, use the Upload button to identify your current rate
        </li>
        <li className="mb-1">
          <strong>Analyze peak periods</strong> - Use the detailed charts to find the best times to run high-energy appliances
        </li>
      </ol>
    </>
  );

  return (
    <div className="card-body p-0 d-flex flex-column h-100 position-relative">
      <div className="p-2" style={{ borderBottom: '1px solid #ccc' }}>
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
              Not sure which rate schedule? Try this →
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
              <div className="dropdown-menu p-0">
                <UploadPage enableTooltip={false} backgroundClass="bg-body-secondary" />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <h4 className="fw-bold">Here's what we have found</h4>
          <Tooltip tooltip={helpTooltip} />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto p-1">
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