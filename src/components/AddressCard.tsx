import React from 'react';

type GeocodeProps = {
  geocodeResult: {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    name: string;
    class: string;
    type: string;
    importance: number;
    addresstype: string;
    place_rank: number;
    address: {
      house_number?: string;
      road?: string;
      city?: string;
      county?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
    boundingbox: [string, string, string, string];
  };
  onSelect: (result: GeocodeProps['geocodeResult']) => void; // Callback for report selection
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const AddressCard: React.FC<GeocodeProps> = ({ geocodeResult, onSelect }) => {
  return (
    <div className="card shadow-sm" >
      <div className="card-body p-2 d-flex justify-content-between align-items-center" style={{ height: '90px' }}>        
        <div className="align-self-start">
          <h5 className="card-title mb-0 p-1 start-0 top-0">{capitalize(geocodeResult.addresstype)}</h5>
          <h6 className="card-subtitle text-muted" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
            }}>{geocodeResult.display_name}
          </h6>
        </div>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold flex-shrink-0"
          style={{height: '60px', width: '100px'}}
          onClick={() => onSelect(geocodeResult)}
          aria-label={`View reports for ${geocodeResult.display_name}`}
        >
          See reports →
        </button>
      </div>
    </div>
  );
};

export default AddressCard;