import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPvWatts, ARRAY_TYPES, MODULE_TYPES } from '../APIs/PVwatts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function SolarInfoPage() {
  const [params] = useSearchParams();
  const encodedAddress = params.get('address');
  const decodedAddress = decodeURIComponent(encodedAddress || '');
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
      navigate(`/search/questionaire?address=${encodedAddress}&lat=${lat}&lon=${lon}`, { state: { addressQuery, purpose } });
    } else {
      window.history.back();
    }
  };

  const loadData = async () => {
    if (!lat || !lon || !purposeOption) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPvWatts(parseFloat(lat), parseFloat(lon), purposeOption);
      setPvResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lat, lon, purposeOption]);

  // --- Subcomponent for visualization ---
  const SolarChart = ({ result }: { result: any }) => {
    const acMonthly = result.outputs.ac_monthly;
    const acAnnual = result.outputs.ac_annual;
    const efficiency = result.outputs.capacity_factor?.toFixed(2);

    const data = MONTHS.map((m, i) => ({
      month: m,
      ac: parseFloat(acMonthly[i].toFixed(1)),
    }));

    const { tilt, azimuth, array_type, module_type } = result.inputs;

    // Friendly replacements
    const friendlyTilt =
      array_type === "4" ? "Not Applicable" : `${parseFloat(tilt).toFixed(1)}°`;
    const friendlyAzimuth =
      array_type === "4"
        ? "Not Applicable"
        : `${parseFloat(azimuth).toFixed(1)}° ${
            parseFloat(azimuth) >= 315 || parseFloat(azimuth) < 45
              ? "(North facing)"
              : parseFloat(azimuth) < 135
              ? "(East facing)"
              : parseFloat(azimuth) < 225
              ? "(South facing)"
              : "(West facing)"
          }`;

    // Context explanations
    const arrayTypeDesc = ({
      "0": "Open-rack fixed systems – simple and low-cost, common for ground installations.",
      "1": "Roof-mounted fixed systems – common for homes and buildings.",
      "2": "Single-axis tracking – follows the sun east to west.",
      "3": "Single-axis with backtracking – reduces shading for smoother output.",
      "4": "Dual-axis tracking – continuously follows the sun in all directions.",
    } as Record<string, string>)[String(array_type)];

    const moduleTypeDesc = ({
      "0": "Standard panels: typical efficiency and cost.",
      "1": "Premium panels: higher efficiency and longer lifespan.",
      "2": "Thin-film panels: lightweight, lower efficiency, used for large areas.",
    } as Record<string, string>)[String(module_type)];
    return (
      <div className="container-fluid">
        <h5 className="fw-bold mb-4">
          Solar potential analysis for {decodedAddress}
        </h5>
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title text-center mb-4">
              Monthly AC Output (Annual: {acAnnual.toFixed(1)} kWh)
            </h5>
            <div className="row g-4">
              {/* Left: Chart */}
              <div className="col-lg-8 col-md-7 col-sm-12">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      label={{ value: "AC Output (kWh)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kWh`, "Output"]} />
                    <Bar dataKey="ac" fill="#fd7e14" /> {/* orange bars */}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Right: Info Panel */}
              <div className="col-lg-4 col-md-5 col-sm-12">
                <div className="p-3 border rounded bg-light h-100">
                  <h6 className="fw-bold mb-3">Optimal configuration for this address</h6>

                  <div className="mb-2">
                    <strong>Panel Angle:</strong> {friendlyTilt}
                  </div>
                  <div className="mb-2">
                    <strong>Direction:</strong> {friendlyAzimuth}
                  </div>

                  <div className="mb-2">
                    <strong>Array Type:</strong> {ARRAY_TYPES[array_type] ?? array_type}
                    <div className="text-muted small">{arrayTypeDesc}</div>
                  </div>

                  <div className="mb-2">
                    <strong>Module Type:</strong> {MODULE_TYPES[module_type] ?? module_type}
                    <div className="text-muted small">{moduleTypeDesc}</div>
                  </div>

                  <div className="mb-2">
                    <strong>Energy Utilization:</strong> {efficiency ? `${efficiency}%` : "N/A"}
                    <div className="text-muted small">
                      Represents average system output vs. running at full nameplate panel's capacity all year round.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Render ---
  return (
    <div className="card-body p-0 d-flex flex-column h-100 position-relative">
      {/* Back button */}
      <div className="p-2 border-bottom">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={handleBack}
          aria-label="Navigate back to questionaire page"
        >
          Back
        </button>
      </div>

      {/* Main content */}
      <div className="p-3 flex-grow-1">
        {loading && (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{ height: '100%' }}
          >
            <div className="spinner-border mb-2" role="status"></div>
            <p className="fw-semibold">
              Optimizing configuration, please wait up to 30 seconds...
            </p>
          </div>
        )}

        {error && <p className="text-danger">{error}</p>}

        {pvResult && <SolarChart result={pvResult} />}
      </div>
    </div>
  );
}
