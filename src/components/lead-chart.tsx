'use client';

import { useEffect, useMemo } from 'react';
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePipelineMetrics } from './pipeline-metrics';
import { LoaderFour } from './ui/loader';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface PipelineMetric {
  status: string;
  leadCount: number;
  conversionRate: number;
  avgTimeInStage: number;
}

export default function LeadChart() {
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadStore();
  const { metrics, isLoading: metricsLoading, error } = usePipelineMetrics();

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
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
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

  const columns = useMemo<ColumnDef<PipelineMetric>[]>(
    () => [
      { accessorKey: 'status', header: 'Stage' },
      { accessorKey: 'leadCount', header: 'Lead Count' },
      {
        accessorKey: 'conversionRate',
        header: 'Conversion Rate (%)',
        cell: ({ row }) => `${row.original.conversionRate}%`,
      },
      {
        accessorKey: 'avgTimeInStage',
        header: 'Avg. Time in Stage (Days)',
        cell: ({ row }) => `${row.original.avgTimeInStage} days`,
      },
    ],
    []
  );

  const table = useReactTable({
    data: metrics,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (leadsLoading || metricsLoading) return <LoaderFour />;
  if (!leads.length)
    return <p className="text-center text-muted-foreground">No leads yet</p>;

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Status Distribution</h2>
      <Bar data={data} options={options} />
      <h2 className="text-xl font-semibold mt-8 mb-4">Pipeline Metrics</h2>
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
