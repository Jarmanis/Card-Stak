
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function TransactionChart({ entries }) {
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const data = {
    labels: sortedEntries.map(entry => entry.date),
    datasets: [
      {
        label: 'Transaction Amount ($)',
        data: sortedEntries.map(entry => entry.cost),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction History'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Line options={options} data={data} />;
}
