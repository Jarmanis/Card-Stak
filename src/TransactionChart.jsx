
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
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  
  // Create ordered data points
  const dataPoints = sortedEntries.map((entry, index) => {
    const previousTotal = index > 0 ? dataPoints[index - 1].total : 0;
    return {
      date: entry.date,
      total: previousTotal + (parseFloat(entry.cost) || 0)
    };
  });
  
  const data = {
    labels: dataPoints.map(point => point.date),
    datasets: [
      {
        label: 'Cumulative Transactions ($)',
        data: dataPoints.map(point => point.total),
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
