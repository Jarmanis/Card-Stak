
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
  const cumulativeData = sortedEntries.reduce((acc, entry, index) => {
    const currentValue = parseFloat(entry.cost) || 0;
    acc[index] = (acc[index - 1] || 0) + currentValue;
    return acc;
  }, []);
  
  const data = {
    labels: sortedEntries.map(entry => entry.date),
    datasets: [
      {
        label: 'Cumulative Transactions ($)',
        data: cumulativeData,
        borderColor: 'rgb(76, 175, 80)',
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
        text: 'Transaction Tracker'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const entry = sortedEntries[dataIndex];
            return [
              `Title: ${entry.title}`,
              `Total: $${context.parsed.y.toFixed(2)}`
            ];
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
