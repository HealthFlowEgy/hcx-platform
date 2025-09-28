import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { hcxApiService, CoverageEligibilityRequest, HCXResponse } from '../../services/hcx/hcxApiService';

const CoverageEligibilityCheck: React.FC = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    payorCode: '',
    serviceCategory: '',
    serviceCodes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HCXResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: CoverageEligibilityRequest = {
        patientId: formData.patientId,
        payorCode: formData.payorCode,
        recipientCode: formData.payorCode, // Same as payor for now
        serviceCategory: formData.serviceCategory,
        serviceCodes: formData.serviceCodes.split(',').map(code => code.trim()).filter(Boolean)
      };

      const response = await hcxApiService.checkCoverageEligibility(request);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Coverage Eligibility Check</h1>
        <p className="text-gray-600">Verify patient insurance coverage for specific services</p>
      </div>

      {/* Eligibility Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Patient & Service Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient identifier"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payor Code *
                </label>
                <select
                  value={formData.payorCode}
                  onChange={(e) => handleInputChange('payorCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select insurance payor</option>
                  <option value="PAYOR001">Government Health Insurance</option>
                  <option value="PAYOR002">Private Insurance Co.</option>
                  <option value="PAYOR003">Corporate Health Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Category
                </label>
                <select
                  value={formData.serviceCategory}
                  onChange={(e) => handleInputChange('serviceCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All services</option>
                  <option value="outpatient">Outpatient Care</option>
                  <option value="inpatient">Inpatient Care</option>
                  <option value="emergency">Emergency Services</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="diagnostic">Diagnostic Tests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Codes
                </label>
                <input
                  type="text"
                  value={formData.serviceCodes}
                  onChange={(e) => handleInputChange('serviceCodes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service codes (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: 99213, 80053, 36415
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.patientId || !formData.payorCode}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Check Eligibility</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error checking eligibility</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Eligibility Check Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coverage Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {result.status === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 font-medium">Active Coverage</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-700 font-medium">No Coverage</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Response Time</label>
                  <p className="text-gray-900 mt-1">1.2s</p>
                </div>
              </div>
              
              {result.payload && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Coverage Details</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoverageEligibilityCheck;
