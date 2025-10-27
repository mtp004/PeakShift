import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function SolarInfoPage() {
  const [params] = useSearchParams();
  const lat = params.get('lat');
  const lon = params.get('lon');
  const purposeOption = params.get('purpose');

  const location = useLocation();
  const navigate = useNavigate();

  const [pvResult, setPvResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    const purpose = location.state?.purpose;
    const addressQuery = location.state?.addressQuery;
    if (purpose) {
      navigate(`/search/questionaire?lat=${lat}&lon=${lon}`, { state: { addressQuery, purpose } });
    } else {
      window.history.back();
    }
  };

  useEffect(() => {
    const fetchPvWatts = async () => {
      if (!lat || !lon || !purposeOption) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://us-central1-peakshift-react.cloudfunctions.net/get_pvwatts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: parseFloat(lat),
              lon: parseFloat(lon),
              purpose: purposeOption,
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch PVWatts data");
        }

        const data = await res.json();
        setPvResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPvWatts();
  }, [lat, lon, purposeOption]);

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

      <div className="p-4 flex-grow-1">
        {loading && <p>Loading PVWatts data...</p>}
        {error && <p className="text-danger">{error}</p>}
        {pvResult && (
          <div>
            <h5>PVWatts Output</h5>
            <pre className="small">{JSON.stringify(pvResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
