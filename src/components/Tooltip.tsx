import { useState } from 'react';

interface TooltipProps {
  icon?: string;
  tooltip: React.ReactNode;
}

export function Tooltip({ 
  icon = '?',
  tooltip
}: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="position-relative">
        <button
            className="btn p-0 border-0 d-flex align-items-center justify-content-center"
            style={{ 
            fontSize: '16px',
            width: '36px',
            height: '36px',
            backgroundColor: '#6c757d',
            borderRadius: '50%',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label="Guide"
        >
            {icon}
        </button>
        
        {/* Tooltip */}
        {showTooltip && (
            <div
            className="position-absolute bg-dark text-white p-3 rounded shadow-lg"
            style={{
                top: '41px',
                right: '0px',
                minWidth: '300px',
                maxWidth: '400px',
                zIndex: 1001,
                fontSize: '14px'
            }}
            >
            {tooltip}
            
            {/* Triangle pointer */}
            <div
                className="position-absolute bg-dark"
                style={{
                top: '-6px',
                right: '12px',
                width: '12px',
                height: '12px',
                transform: 'rotate(45deg)'
                }}
            ></div>
            </div>
        )}
    </div>
  );
}