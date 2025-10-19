import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';


export function SolarInfoPage() {
  const [params] = useSearchParams();
  const address = params.get('address');
  const purposeOption = params.get('purpose');
  const decodedAddress = decodeURIComponent(address || '');

  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    const purpose = location.state?.purpose;
    const addressQuery = location.state?.addressQuery;
    if (purpose) {
      navigate('/search/questionaire', { state: { addressQuery, purpose } });
    } else {
      window.history.back();
    }
  };

  return (
    <div className="card-body p-0 d-flex flex-column h-100 position-relative">
      <div className="p-2" style={{ borderBottom: '1px solid #ccc' }}>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={handleBack}
          aria-label="Navigate back to questionaire page"
        >
          Back
        </button>
      </div>
    </div>
  );
}
