'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLeadStore } from '@/store/lead-store';
import { useEffect } from 'react';
import { LoaderFour } from './ui/loader';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function LeadChart() {
  const { leads, isLoading, fetchLeads } = useLeadStore();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Leads by Status',
        data: Object.values(statusCounts),
        backgroundColor: 'rgba(99, 102, 241, 0.6)', // Matches primary
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (isLoading) return <LoaderFour />;
  if (!leads.length)
    return <p className="text-center text-muted-foreground">No leads yet</p>;

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Status Distribution</h2>
      <Bar data={data} options={options} />
    </div>
  );
}
