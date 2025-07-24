import React from 'react';

const ElectricRateOptions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Electric Rates Options</h1>
        
        {/* Content will go here */}
      </div>
    </div>
  );
};

export default ElectricRateOptions;