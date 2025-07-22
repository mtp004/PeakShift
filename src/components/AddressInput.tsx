// components/AddressInput.tsx
import React from 'react';
import TextField from './TextField';

interface AddressInputProps {
  address: string;
  setAddress: (address: string) => void;
}

function AddressInput({ address, setAddress }: AddressInputProps) {
  return (
    <div className="card p-4 shadow-sm">
      <h2 className="h4 mb-3">Enter Your Address</h2>
      <p className="text-muted mb-4">
        Enter your address to get location-specific electricity rate information
      </p>

      <TextField
        label="Street Address"
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g., 123 Main Street, City, State"
      />

      <div className="text-center mt-3">
        <small className="text-muted">
          Powered by{' '}
          <a
            href="https://nominatim.openstreetmap.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nominatim
          </a>{' '}
          & OpenStreetMap
        </small>
      </div>
    </div>
  );
}

export default AddressInput;
