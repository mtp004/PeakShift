import { useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { type RateItem, processRatesResults } from '../APIs/OpenEIServices';
import {
  saveBookmark,
  removeBookmark,
  isBookmarked,
  type BookmarkedRate,
} from '../APIs/BookmarkManager';
import { findPeakHours } from '../APIs/RateOptimizer';

const HOUR_TO_TIME = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const today = new Date();
const currentMonth = today.getMonth();
const currentIsWeekend = [0, 6].includes(today.getDay());

export function RateChart() {
  const location = useLocation();
  const [params] = useSearchParams();
  const [report, setReport] = useState<RateItem | null | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isWeekend, setIsWeekend] = useState(currentIsWeekend);
  const [bookmarked, setBookmarked] = useState(false);
  const noState = !location.state;

  const address = decodeURIComponent(params.get('address') || '');
  const rateName = decodeURIComponent(params.get('rate') || '');

  useEffect(() => {
    if (location.state?.report) {
      setReport(location.state.report);
    } else {
      processRatesResults(address, (reports) => {
        const match = reports?.items.find(r => r.name === rateName) ?? null;
        setReport(match);
      });
    }
  }, [params, location.state, address, rateName]);

  useEffect(() => {
    if (report) {
      setBookmarked(isBookmarked(report.name));
    }
  }, [report]);

  const handleBookmarkToggle = () => {
    if (!report) return;

    if (bookmarked) {
      removeBookmark();
      setBookmarked(false);
    } else {
      const bookmark: BookmarkedRate = {
        id: report.name,
        address: address,
        dateBookmarked: new Date().toISOString(),
      };
      saveBookmark(bookmark);
      setBookmarked(true);
    }
  };

  const backButton = !noState && (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm fw-semibold"
      onClick={() => window.history.back()}
      aria-label="Navigate back to reports page"
    >
      Back
    </button>
  );


  
  if (report === undefined) {
    return (
      <div className="card-body p-2">
        <div className="d-flex align-items-center">
          {backButton}
        </div>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status"></div>
        </div>
      </div>
    );
  }

  if (report === null) {
    return (
      <div className="card-body p-2">
        <div className="d-flex align-items-center">
          {backButton}
        </div>
        <div className="alert alert-info">
          No residential electric rates found for this address.
        </div>
      </div>
    );
  }

  const schedule = (isWeekend ? report.energyweekendschedule : report.energyweekdayschedule)?.[selectedMonth];
  const data = schedule?.map((tierIndex, hour) => ({
    hour: HOUR_TO_TIME[hour],
    rate: parseFloat((report.energyratestructure?.[tierIndex]?.[0]?.rate || 0).toFixed(4)),
  })) ?? [];
  const peakPeriods = findPeakHours(data);

  return (
    <div className="card-body p-2">
      <div className="d-flex align-items-center mb-3">
        {backButton}
        {report && (
          <button
            type="button"
            className={`btn btn-sm fw-semibold ms-2 ${bookmarked ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        )}
      </div>

      {report && (
        <div className="mb-3">
          <h5 className="mb-1">Rate schedule for {address}</h5>
          <small className="text-muted">{report.utility}</small>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-auto">
          <label htmlFor="monthSelect" className="form-label fw-semibold">Month</label>
          <select
            id="monthSelect"
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index}>
                {month} {index === currentMonth ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="col-auto">
          <label className="form-label fw-semibold">Day Type</label>
          <div className="btn-group d-flex" role="group" aria-label="Day type toggle">
            <input
              type="radio"
              className="btn-check"
              name="dayType"
              id="weekdays"
              checked={!isWeekend}
              onChange={() => setIsWeekend(false)}
            />
            <label className="btn btn-outline-primary flex-fill" htmlFor="weekdays">
              Weekdays {!currentIsWeekend ? '(Current)' : ''}
            </label>

            <input
              type="radio"
              className="btn-check"
              name="dayType"
              id="weekends"
              checked={isWeekend}
              onChange={() => setIsWeekend(true)}
            />
            <label className="btn btn-outline-primary flex-fill" htmlFor="weekends">
              Weekends {currentIsWeekend ? '(Current)' : ''}
            </label>
          </div>
        </div>
      </div>
      <div className="d-flex gap-3 w-75">
        <div className="d-flex flex-column flex-grow-1">
          <h5 className="text-center mb-1">Schedule name: {report.name}</h5>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis label={{ value: 'Rate ($/kWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#0d6efd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="d-flex flex-column align-items-start ps-4">
          <h6 className="text-danger mb-3">⚠️ Avoid usage in these Peak Hours:</h6>
          <div className="d-flex flex-column gap-2">
            {peakPeriods.length > 0 ? (
              peakPeriods.map((period, index) => (
                <div key={index} className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                  {period.startHour} - {period.endHour}
                </div>
              ))
            ) : (
              <div className="text-muted fst-italic">No peak hours during daytime</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateChart;