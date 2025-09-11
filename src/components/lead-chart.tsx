'use client';

import { useEffect, useMemo } from 'react';
import { Bar as ChartJSBar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from 'recharts';
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
import { useLeadStore } from '@/store/lead-store';
import { usePipelineStore } from '@/store/pipeline-metrics';
import { useReportStore } from '@/store/report-store';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { LoaderFour } from './ui/loader';

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

interface PipelineMetric {
  status: string;
  leadCount: number;
  conversionRate: number;
  avgTimeInStage: number;
}

export default function LeadChart() {
  const { leads, isLoading: leadsLoading, fetchLeads } = useLeadStore();
  const {
    metrics,
    isLoading: metricsLoading,
    fetchMetrics,
    error,
  } = usePipelineStore();
  const { exportReport, isLoading: exportLoading } = useReportStore();

  useEffect(() => {
    fetchLeads();
    fetchMetrics();
  }, [fetchLeads, fetchMetrics]);

  // --- Lead status distribution chart (Chart.js) ---
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadChartData = {
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

  const leadChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { beginAtZero: true } },
  };

  // --- Pipeline Metrics Table (React Table) ---
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

  // --- Export Handler ---
  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const { fileContent, fileName } = await exportReport(format);
      const link = document.createElement('a');
      link.href = `data:${
        format === 'pdf' ? 'application/pdf' : 'text/csv'
      };base64,${fileContent}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // handled in report-store
    }
  };

  if (leadsLoading || metricsLoading || exportLoading) {
    return <LoaderFour />;
  }

  if (!leads.length) {
    return <p className="text-center text-muted-foreground">No leads yet</p>;
  }

  return (
    <div className="bg-background/50 backdrop-blur-lg rounded-lg border border-border/80 p-6 space-y-8">
      {/* Lead Status Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Lead Status Distribution</h2>
        <ChartJSBar data={leadChartData} options={leadChartOptions} />
      </div>

      {/* Pipeline Metrics Chart */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pipeline Metrics (Chart)</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              className="bg-primary/80 hover:bg-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="bg-primary/80 hover:bg-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <RechartTooltip />
            <Bar dataKey="leadCount" fill="#8884d8" name="Lead Count" />
            <Bar
              dataKey="conversionRate"
              fill="#82ca9d"
              name="Conversion Rate (%)"
            />
            <Bar
              dataKey="avgTimeInStage"
              fill="#ffc658"
              name="Avg Time in Stage (days)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Metrics Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pipeline Metrics (Table)</h2>
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
    </div>
  );
}
