import {type RateItem } from '../APIs/OpenEIServices';
type ReportCardProps = {
  rateItem: RateItem
  onSelect: () => void
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function ReportCard({ 
  rateItem,
  onSelect
}: ReportCardProps) {
  return (
  <div className="card shadow-sm w-100 mb-3">
    <div className="card-body p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="flex-grow-1 me-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{rateItem.name}</h5>
            {rateItem.is_default && (
              <span className="badge bg-primary">Default(most common)</span>
            )}
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <small className="text-muted">Start Date(M/D/Y): </small>
              <span className="fw-medium">{formatDate(rateItem.startdate)}</span>
            </div>
            <span className="fw-medium">Company: {rateItem.utility}</span>
          </div>
        </div>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold flex-shrink-0"
          style={{height: '60px', width: '100px'}}
          onClick={() => onSelect()}
          aria-label={`View details for ${name}`}
        >
          See detail →
        </button>
      </div>
      {rateItem.description && (
        <p className="card-text text-muted mb-0" style={{
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {rateItem.description}
        </p>
      )}
    </div>
  </div>
);
}