import React, { useState } from 'react';
import Gauge from '../components/common/Gauge';
import VoltageChart from '../components/charts/VoltageChart';
import { useData } from '../contexts/DataContext';

/**
 * Dashboard page: displays the latest readings and charts for a selected cell.
 */
const Dashboard = () => {
  const { data } = useData();
  const availableCells = Object.keys(data);
  const [selectedCell, setSelectedCell] = useState(availableCells[0]);
  const readings = data[selectedCell] || [];
  const latest = readings[readings.length - 1] || {};
  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Select Cell: </label>
        <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)}>
          {availableCells.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Gauge label="State of Charge" value={latest.soc || 0} />
          <Gauge label="State of Health" value={latest.soh || 0} />
          <div>Voltage: {latest.voltage?.toFixed(2) || '--'} V</div>
          <div>Current: {latest.current?.toFixed(2) || '--'} A</div>
          <div>Temperature: {latest.temperature?.toFixed(1) || '--'} °C</div>
        </div>
        <div style={{ flex: '2 1 400px' }}>
          <VoltageChart readings={readings.slice(-20)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;