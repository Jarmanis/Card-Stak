
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
  
  // Calculate cumulative values
  let runningTotal = 0;
  const cumulativeData = sortedEntries.map(entry => {
    runningTotal += entry.cost;
    return runningTotal;
  });
  
  const data = {
    labels: sortedEntries.map(entry => entry.date),
    datasets: [
      {
        label: 'Cumulative Spending ($)',
        data: cumulativeData,
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
        text: 'Cumulative Transaction History'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return <Line options={options} data={data} />;
}
