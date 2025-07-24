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
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const AddressCard: React.FC<GeocodeProps> = ({ geocodeResult }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <h5 className="card-title mb-1">
            {capitalize(geocodeResult.addresstype)}
          </h5>
          <h6 className="card-subtitle text-muted">
            {geocodeResult.display_name}
          </h6>
        </div>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold"
          onClick={() => {
            console.log('Navigate to reports for', geocodeResult.place_id);
            // Replace with actual navigation logic later
          }}
        >
          See reports →
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
