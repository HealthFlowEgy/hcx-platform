import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import { hcxApiService, ClaimSubmissionRequest, DiagnosisInfo, ProcedureInfo, HCXResponse } from '../../services/hcx/hcxApiService';

const ClaimsSubmission: React.FC = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    payorCode: '',
    serviceDate: '',
    totalAmount: 0
  });
  
  const [diagnoses, setDiagnoses] = useState<DiagnosisInfo[]>([
    { code: '', description: '', type: 'primary' }
  ]);
  
  const [procedures, setProcedures] = useState<ProcedureInfo[]>([
    { code: '', description: '', quantity: 1, unitPrice: 0 }
  ]);
  
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HCXResponse | null>(null);

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { code: '', description: '', type: 'secondary' }]);
  };

  const removeDiagnosis = (index: number) => {
    if (diagnoses.length > 1) {
      setDiagnoses(diagnoses.filter((_, i) => i !== index));
    }
  };

  const addProcedure = () => {
    setProcedures([...procedures, { code: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeProcedure = (index: number) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((_, i) => i !== index));
    }
  };

  const updateDiagnosis = (index: number, field: keyof DiagnosisInfo, value: string) => {
    const updated = [...diagnoses];
    updated[index] = { ...updated[index], [field]: value };
    setDiagnoses(updated);
  };

  const updateProcedure = (index: number, field: keyof ProcedureInfo, value: string | number) => {
    const updated = [...procedures];
    updated[index] = { ...updated[index], [field]: value };
    setProcedures(updated);
    
    // Recalculate total amount
    const total = updated.reduce((sum, proc) => sum + (proc.quantity * proc.unitPrice), 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSupportingDocs(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const request: ClaimSubmissionRequest = {
        patientId: formData.patientId,
        payorCode: formData.payorCode,
        recipientCode: formData.payorCode,
        serviceDate: formData.serviceDate,
        diagnosis: diagnoses,
        procedures: procedures,
        totalAmount: formData.totalAmount,
        supportingDocuments: supportingDocs.map(file => file.name)
      };

      const response = await hcxApiService.submitClaim(request);
      setResult(response);
    } catch (error: any) {
      setResult({
        status: 'error',
        errorMessage: error.response?.data?.errorMessage || 'Failed to submit claim',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Claims Submission</h1>
        <p className="text-gray-600">Submit claims for medical services provided</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Payor *
                </label>
                <select
                  value={formData.payorCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, payorCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select payor</option>
                  <option value="PAYOR001">Government Health Insurance</option>
                  <option value="PAYOR002">Private Insurance Co.</option>
                  <option value="PAYOR003">Corporate Health Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Diagnosis Information</span>
              <button
                type="button"
                onClick={addDiagnosis}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Diagnosis</span>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnoses.map((diagnosis, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ICD-10 Code *
                    </label>
                    <input
                      type="text"
                      value={diagnosis.code}
                      onChange={(e) => updateDiagnosis(index, 'code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="E.g., J44.0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={diagnosis.description}
                      onChange={(e) => updateDiagnosis(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Diagnosis description"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={diagnosis.type}
                        onChange={(e) => updateDiagnosis(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                    </div>
                    {diagnoses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDiagnosis(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Procedures & Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Procedures & Services</span>
              <button
                type="button"
                onClick={addProcedure}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Procedure</span>
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procedures.map((procedure, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPT Code *
                    </label>
                    <input
                      type="text"
                      value={procedure.code}
                      onChange={(e) => updateProcedure(index, 'code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="E.g., 99213"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={procedure.description}
                      onChange={(e) => updateProcedure(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Procedure description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={procedure.quantity}
                      onChange={(e) => updateProcedure(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={procedure.unitPrice}
                        onChange={(e) => updateProcedure(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {procedures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProcedure(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-right p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold">
                  Total Amount: ${formData.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading || !formData.patientId || !formData.payorCode}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Submit Claim</span>
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <Card className={result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
              Claim Submission {result.status === 'success' ? 'Successful' : 'Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.status === 'success' ? (
              <div className="space-y-2">
                <p className="text-green-700">
                  Your claim has been successfully submitted for processing.
                </p>
                <p className="text-sm text-gray-600">
                  Correlation ID: {result.headers?.correlationId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  You will receive updates as your claim is processed.
                </p>
              </div>
            ) : (
              <p className="text-red-700">{result.errorMessage}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClaimsSubmission;
