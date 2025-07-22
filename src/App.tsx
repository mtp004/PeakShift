// App.tsx
import React, { useState } from 'react';
import AddressInput from './components/AddressInput';

function App() {
  const [address, setAddress] = useState('');

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="text-center mb-4">PeakShift - Electric Usage Optimizer</h1>
        <AddressInput address={address} setAddress={setAddress} />
      </div>
    </div>
  );
}

export default App;
