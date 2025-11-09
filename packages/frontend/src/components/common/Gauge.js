import React from 'react';

/**
 * Gauge component displays a simple horizontal bar representing a percentage.
 * It is used for showing State of Charge (SoC) or State of Health (SoH).
 */
const Gauge = ({ label, value, max = 100 }) => {
  const percentage = Math.min(Math.max(value, 0), max) / max * 100;
  const barStyle = {
    width: `${percentage}%`,
    backgroundColor: percentage < 20 ? '#e74c3c' : percentage < 50 ? '#f1c40f' : '#2ecc71',
    height: '100%',
    borderRadius: 4,
  };
  const containerStyle = {
    width: '100%',
    height: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, marginBottom: 2 }}>{label}: {value}%</div>
      <div style={containerStyle}>
        <div style={barStyle} />
      </div>
    </div>
  );
};

export default Gauge;