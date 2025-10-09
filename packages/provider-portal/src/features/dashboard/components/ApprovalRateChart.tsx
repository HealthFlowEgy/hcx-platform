/**
 * Approval Rate Chart Component
 * Sprint 2 - Provider Dashboard
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ApprovalRateData } from '../types/dashboard.types';

interface ApprovalRateChartProps {
  data: ApprovalRateData[];
  isLoading?: boolean;
}

export function ApprovalRateChart({ data, isLoading }: ApprovalRateChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Approval Rate Trend</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey="approved" fill="#10b981" name="Approved" />
          <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
          <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-600">Rejected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
}

export default ApprovalRateChart;
