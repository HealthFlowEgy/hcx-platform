import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, FileCheck, Clock, Users } from 'lucide-react';

interface HCXMetrics {
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  eligibilityChecks: number;
  preAuthRequests: number;
  activeParticipants: number;
}

const HCXDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HCXMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API call
      setMetrics({
        totalClaims: 1247,
        approvedClaims: 1156,
        pendingClaims: 91,
        eligibilityChecks: 3421,
        preAuthRequests: 234,
        activeParticipants: 15
      });
    } catch (error) {
      console.error('Failed to load HCX dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const approvalRate = metrics ? Math.round((metrics.approvedClaims / metrics.totalClaims) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">HCX Protocol Dashboard</h1>
        <p className="text-gray-600">Monitor HCX claims processing and participant activities</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalClaims}</div>
            <p className="text-xs text-gray-600">
              {metrics?.pendingClaims} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-gray-600">
              {metrics?.approvedClaims} approved claims
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligibility Checks</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.eligibilityChecks}</div>
            <p className="text-xs text-gray-600">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeParticipants}</div>
            <p className="text-xs text-gray-600">
              Registered payors & providers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coverage Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Check patient coverage eligibility before providing services.
            </p>
            <button 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/hcx/eligibility'}
            >
              Check Eligibility
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pre-Authorization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Submit pre-authorization requests for planned procedures.
            </p>
            <button 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => window.location.href = '/hcx/preauth'}
            >
              Submit Pre-Auth
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Submit claims for reimbursement processing.
            </p>
            <button 
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              onClick={() => window.location.href = '/hcx/claims'}
            >
              Submit Claim
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HCXDashboard;
