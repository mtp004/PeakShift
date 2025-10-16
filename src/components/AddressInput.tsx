import { useEffect, useRef } from 'react';

interface AddressInputProps {
  address: string;
  setAddress: (address: string) => void;
}

function AddressInput({ address, setAddress }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => setAddress('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="h4 mb-3">Enter Your Address</h2>
      <p className="text-muted mb-4">
        Enter your address to get location-specific electricity rate information
      </p>

      <div className="mb-3">
        <label htmlFor="address" className="form-label">
          Street Address
        </label>
        <div className="position-relative">
          <input
            ref={inputRef} // 👈 attach the ref
            type="text"
            className="form-control"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main Street, City, State"
            style={{ paddingRight: address ? '40px' : '12px' }}
          />
          {address && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="btn position-absolute top-50 end-0 translate-middle-y text-secondary"
              style={{
                maxWidth: '40px',
                maxHeight: '40px',
                fontSize: '20px',
                lineHeight: '1',
                textDecoration: 'none',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressInput;
