import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, type ChangeEvent } from 'react';

type LocationState = {
  addressQuery?: string;
  searchMode?: string;
  answers?: string;
};

export type AnswerOption = 'A' | 'B' | '';

const QUESTION1_OPTIONS = [
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
  const lat = params.get('lat');
  const lon = params.get('lon');

  const [answ1, setAnsw1] = useState<AnswerOption>((state?.answers?.[0] as AnswerOption));
  const [answ2, setAnsw2] = useState<AnswerOption>((state?.answers?.[1] as AnswerOption));

  const handleAnsw1Change = (e: ChangeEvent<HTMLInputElement>) => {
    setAnsw1(e.target.value as AnswerOption);
    setAnsw2('');
  };

  const handleAnsw2Change = (e: ChangeEvent<HTMLInputElement>) => {
    setAnsw2(e.target.value as AnswerOption);
  };

  const handleNext = () => {
    navigate(`/search/solarinfo?address=${encodedAddress}&lat=${lat}&lon=${lon}&answers=${answ1}${answ2}`, {
      state: {
        addressQuery,
        searchMode,
        answ1,
        answ2,
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
        >
          Back
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow-1">
        {/* Question 1 */}
        <h5 className="fw-semibold mb-2">
          Which best describes your solar installation purpose?
        </h5>

        {QUESTION1_OPTIONS.map((option) => (
          <div className="form-check mb-2" key={option.value}>
            <input
              className="form-check-input"
              type="radio"
              name="answ1"
              id={`answ1-${option.value}`}
              value={option.value}
              checked={answ1 === option.value}
              onChange={handleAnsw1Change}
            />
            <label className="form-check-label" htmlFor={`answ1-${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}

        {/* Question 2 — conditional and 2-choice (Yes/No) */}
        {answ1 === 'A' && (
          <div className="mt-4">
            <h5 className="fw-semibold mb-2">
              Are you looking for a <strong>roof-mounted</strong> solution?
            </h5>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="answ2"
                id="roof-yes"
                value="A"
                checked={answ2 === 'A'}
                onChange={handleAnsw2Change}
              />
              <label className="form-check-label" htmlFor="roof-yes">Yes</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="answ2"
                id="roof-no"
                value="B"
                checked={answ2 === 'B'}
                onChange={handleAnsw2Change}
              />
              <label className="form-check-label" htmlFor="roof-no">No</label>
            </div>
          </div>
        )}

        {answ1 === 'B' && (
          <div className="mt-4">
            <h5 className="fw-semibold mb-2">
              Are you interested in <strong>tracking solutions</strong>? (Tracking increase maintenance and installation cost for better output)
            </h5>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="answ2"
                id="tracking-yes"
                value="A"
                checked={answ2 === 'A'}
                onChange={handleAnsw2Change}
              />
              <label className="form-check-label" htmlFor="tracking-yes">Yes</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="answ2"
                id="tracking-no"
                value="B"
                checked={answ2 === 'B'}
                onChange={handleAnsw2Change}
              />
              <label className="form-check-label" htmlFor="tracking-no">No</label>
            </div>
          </div>
        )}

        {answ2 && (
          <button
          type="button"
          className="btn btn-primary fw-semibold mt-4"
          onClick={handleNext}
          disabled={!answ1 || !answ2}
        >
          Next
        </button>
        )}
      </div>
    </div>
  );
}
