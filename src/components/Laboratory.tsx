import React, { useState } from 'react';
import { FlaskConical, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { labReports } from '../data';

const Laboratory: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'reviewed'>('all');

  const filteredReports = labReports.filter(report =>
    filterStatus === 'all' || report.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-600" size={20} />;
      case 'reviewed':
        return <CheckCircle className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Laboratory</h1>
        <p className="text-gray-600">View and manage lab test results</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredReports.length} of {labReports.length} lab reports
        </p>
      </div>

      {/* Lab Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FlaskConical className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.testType}</h3>
                  <p className="text-sm text-gray-600">{report.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Patient ID:</span>
                <span className="font-medium text-gray-900">{report.patientId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Test Date:</span>
                <span className="font-medium text-gray-900">{report.testDate}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Results:</p>
                <p className="text-sm text-gray-900">{report.results}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FlaskConical size={48} className="mx-auto mb-4 opacity-20" />
          <p>No lab reports found for the selected status.</p>
        </div>
      )}
    </div>
  );
};

export default Laboratory;
