import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchFleetReport } from '../services/api';

/**
 * ModeratorView lists all batteries/packs under a moderator’s care with summary metrics.
 */
const ModeratorView = () => {
  const { user } = useAuth();
  const [report, setReport] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFleetReport(user?.token);
        setReport(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (user) load();
  }, [user]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Fleet Overview</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Battery ID</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Average SoC (%)</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Average SoH (%)</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Active Alerts</th>
          </tr>
        </thead>
        <tbody>
          {report.map((row) => (
            <tr key={row.batteryId}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{row.batteryId}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{row.avgSoc?.toFixed(1)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{row.avgSoh?.toFixed(1)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{row.activeAlerts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModeratorView;