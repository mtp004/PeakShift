import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useState, type ChangeEvent } from 'react';

type LocationState = {
  addressQuery?: string;
  searchMode?: string;
  purpose?: PurposeOption;
};

export type PurposeOption = 'A' | 'B' | '';

const PURPOSE_OPTIONS: { value: PurposeOption; label: string }[] = [
  { value: 'A', label: 'Residential / Common Commercial' },
  { value: 'B', label: 'Large-scale / High-performance / Industrial' },
];

export function QuestionairePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const addressQuery = state?.addressQuery || '';
  const searchMode = state?.searchMode || 'solar';

  const [params] = useSearchParams();
  const encodedAddress = params.get('address');
  const decodedAddress = decodeURIComponent(encodedAddress || '');

  const [purpose, setPurpose] = useState<PurposeOption>(state?.purpose || '');

  const handlePurposeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPurpose(e.target.value as PurposeOption);
  };

  const handleNext = () => {
    if (!purpose) {
      alert('Please select your installation purpose.');
      return;
    }

    const encodedPurpose = encodeURIComponent(purpose);
    navigate(`/search/solarinfo?address=${encodedAddress}&purpose=${encodedPurpose}`, {
      state: {
        addressQuery,
        searchMode,
        purpose
      },
    });
  };

  return (
    <div className="card-body p-0 d-flex flex-column h-100 position-relative">
      {/* Top bar */}
      <div className="p-2 border-bottom">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={() => {
            if (addressQuery) {
              navigate('/', { state: { addressQuery, searchMode } });
            } else {
              window.history.back();
            }
          }}
          aria-label="Navigate back to address search page"
        >
          Back
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow-1">
        <h5 className="fw-semibold mb-3">
          Which best describes your solar installation purpose?
        </h5>

        {PURPOSE_OPTIONS.map((option) => (
          <div className="form-check mb-2" key={option.value}>
            <input
            className="form-check-input"
            type="radio"
            name="purpose"
            id={`purpose-${option.value}`}
            value={option.value}
            checked={purpose === option.value}
            onChange={handlePurposeChange}
            />
            <label
              className="form-check-label"
              htmlFor={`purpose-${option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-primary fw-semibold mt-3"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
