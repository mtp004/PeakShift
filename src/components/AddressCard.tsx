import React from 'react';
import type { GeocodeResult } from '../APIs/GeocodeService';

type SearchMode = 'electric' | 'solar';

type GeocodeProps = {
  geocodeResult: GeocodeResult['results'][0]; // Single result from Google Maps
  onSelect: () => void;
  searchMode: SearchMode;
};

const getAddressType = (types?: string[]): string => {
  if (!types || types.length === 0) {
    return 'Address';
  }

  // Check for common types users understand
  if (types.includes('street_address')) return 'Street Address';
  if (types.includes('premise')) return 'Building';
  if (types.includes('airport')) return 'Airport';
  if (types.includes('park')) return 'Park';
  if (types.includes('route')) return 'Road';
  if (types.includes('locality')) return 'City';
  if (types.includes('neighborhood')) return 'Neighborhood';
  if (types.includes('postal_code')) return 'Zip Code';
  
  // Default fallback
  return 'Address';
};

const AddressCard: React.FC<GeocodeProps> = ({ geocodeResult, onSelect, searchMode }) => {
  const addressType = getAddressType(geocodeResult.types);

  return (
    <div className="card shadow-sm">
      <div className="card-body p-2 d-flex justify-content-between align-items-center" style={{ height: '90px' }}>
        <div className="align-self-start p-1">
          <h5 className="card-title">{addressType}</h5>
          <h6 className="card-subtitle text-muted" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{geocodeResult.formatted_address}
          </h6>
        </div>
        <button
          className={`btn btn-sm fw-semibold flex-shrink-0 ${
            searchMode === 'solar' ? 'btn-outline-warning' : 'btn-outline-primary'
          }`}
          style={{height: '60px', width: '100px'}}
          onClick={() => onSelect()}
          aria-label={`View reports for ${geocodeResult.formatted_address}`}
        >
          See reports →
        </button>
      </div>
    </div>
  );
};

export default AddressCard;