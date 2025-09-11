'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth-store';
import { toast } from 'react-hot-toast';

interface ReportState {
  isLoading: boolean;
  error: string | null;
  exportReport: (
    format: 'pdf' | 'csv'
  ) => Promise<{ fileContent: string; fileName: string }>;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://klientel-backend.onrender.com/graphql';

export const useReportStore = create<ReportState>((set) => ({
  isLoading: false,
  error: null,

  exportReport: async (format: 'pdf' | 'csv') => {
    const { token } = useAuthStore.getState();
    if (!token) {
      set({ error: 'Please log in to export a report', isLoading: false });
      toast.error('Please log in to export a report');
      throw new Error('Please log in to export a report');
    }
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ExportReport($input: ExportReportInput!) {
              exportReport(input: $input) {
                report {
                  fileContent
                  fileType
                  fileName
                }
              }
            }
          `,
          variables: { input: { format } },
        }),
      });

      const { data, errors } = await response.json();
      if (errors)
        throw new Error(
          errors[0]?.message || `Failed to export ${format.toUpperCase()}`
        );
      set({ isLoading: false });
      toast.success(`${format.toUpperCase()} exported`);
      return {
        fileContent: data.exportReport.report.fileContent,
        fileName: data.exportReport.report.fileName,
      };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error(err.message);
      throw err;
    }
  },
}));
