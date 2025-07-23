import React from 'react';

type Props = {
  address: string;
};

const AddressCard: React.FC<Props> = ({ address }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{address}</h5>
      </div>
    </div>
  );
};

export default AddressCard;
