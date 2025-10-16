import { useNavigate, useLocation } from 'react-router-dom';

export function SolarQuestionPage(){
  const navigate = useNavigate();
  const location = useLocation();
  const addressQuery = location.state?.addressQuery || '';
  const searchMode = location.state?.searchMode || 'solar';

  return (
    <div className="card-body p-0 d-flex flex-column h-100 position-relative">
      <div className="p-2" style={{ borderBottom: '1px solid #ccc' }}>
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
    </div>
  );
}