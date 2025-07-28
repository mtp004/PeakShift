import { useLocation, useSearchParams } from 'react-router-dom';
import { type RateItem } from '../APIs/OpenEIServices';
import { useState, useEffect } from 'react';
import { processRatesResults } from '../APIs/OpenEIServices';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RateChart() {
  const location = useLocation();
  const [params] = useSearchParams();
  const [report, setReport] = useState<RateItem | null | undefined>(undefined);

  useEffect(() => {
    const state = location.state;
    if (state?.report) {
      setReport(state.report);
    } else {
      const encodedAddress = params.get('address');
      const encodedRate = params.get('rate');
      const address = decodeURIComponent(encodedAddress || "");
      const rate = decodeURIComponent(encodedRate || "");
      
      // Fixed fallback fetching logic
      processRatesResults(address, (reports) => {
        // Assuming reports is an array of RateItem
        if (reports) {
          const matchedReport = reports.items.find(r => r.name === rate);
          if (matchedReport) {
            setReport(matchedReport);
          } else {
            setReport(null); // No matching report found
          }
        } else {
          setReport(null); // No reports returned
        }
      });
    }
  }, [params, location.state]);

  // Loading state
  if (report === undefined) {
    return (
      <div style={{ padding: '20px' }}>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={() => window.history.back()}
          aria-label="Navigate back to reports page"
        >
          ← Back
        </button>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status"></div>
        </div>
      </div>
    );
  }

  // No data found state
  if (report === null) {
    return (
      <div style={{ padding: '20px' }}>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm fw-semibold"
          onClick={() => window.history.back()}
          aria-label="Navigate back to reports page"
        >
          ← Back
        </button>
        <div className="alert alert-info">
          No residential electric rates found for this address.
        </div>
      </div>
    );
  }

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const monthIndex = today.getMonth();
  const schedule = isWeekend
    ? report.energyweekendschedule?.[monthIndex]
    : report.energyweekdayschedule?.[monthIndex];
  const structure = report.energyratestructure;

  // Build the data for the chart
  const data = schedule?.map((tierIndex, hour) => {
    const tierData = structure?.[tierIndex]?.[0];
    const rate = tierData?.rate || 0;
    const adj = tierData?.adj ?? 0;
    return {
      hour: `${hour}`,
      rate: parseFloat((rate + adj).toFixed(4)),
    };
  }) || [];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm fw-semibold"
        onClick={() => window.history.back()}
        aria-label="Navigate back to address search page"
      >
        Back
      </button>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            label={{ value: 'Hour (0-23)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Rate ($/kWh)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Bar dataKey="rate" fill="#0d6efd" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RateChart;