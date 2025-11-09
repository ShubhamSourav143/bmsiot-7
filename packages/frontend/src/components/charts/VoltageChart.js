import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

/**
 * VoltageChart renders a line chart of voltage readings over time.
 * It expects an array of reading objects with `timestamp` and `voltage` fields.
 */
const VoltageChart = ({ readings }) => {
  const data = useMemo(() => {
    const labels = readings.map((r) => new Date(r.timestamp).toLocaleTimeString());
    const values = readings.map((r) => r.voltage);
    return {
      labels,
      datasets: [
        {
          label: 'Voltage (V)',
          data: values,
          borderColor: '#3498db',
          fill: false,
        },
      ],
    };
  }, [readings]);
  const options = useMemo(() => ({
    responsive: true,
    scales: {
      y: {
        title: { display: true, text: 'Voltage (V)' },
      },
      x: {
        ticks: { maxTicksLimit: 5 },
      },
    },
  }), []);
  return <Line data={data} options={options} />;
};

export default VoltageChart;