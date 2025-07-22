// components/TextField.tsx
import React from 'react';

interface TextFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function TextField({
  label,
  id,
  value,
  onChange,
  onKeyDown,
  placeholder = '',
}: TextFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="form-control"
        placeholder={placeholder}
      />
    </div>
  );
}

export default TextField;
