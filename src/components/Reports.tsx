import React from 'react';

type ReportsProps = {
  geocodeResult: {
    place_id: number;
    display_name: string;
    addresstype: string;
    address: {
      house_number?: string;
      road?: string;
      city?: string;
      county?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
  };
  onBack: () => void; // Callback to return to the main view
};

const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  return (
    <div className="card shadow-sm p-0">
      <div className="card-body p-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={onBack}
          aria-label="Close reports modal"
        >
          Close
        </button>
        Hello World
      </div>
    </div>
  );
};

export default Reports;