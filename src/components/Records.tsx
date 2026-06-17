import React, { useState } from 'react';
import { FileText, Eye, Download, Trash2, Plus } from 'lucide-react';

interface MedicalRecord {
  id: string;
  title: string;
  type: 'Lab Report' | 'X-Ray' | 'MRI' | 'CT Scan' | 'Blood Test' | 'ECG' | 'Other';
  date: string;
  provider: string;
  status: 'reviewed' | 'pending' | 'archived';
  fileSize: string;
}

const Records: React.FC = () => {
  const [records] = useState<MedicalRecord[]>([
    {
      id: 'REC001',
      title: 'Comprehensive Blood Work',
      type: 'Blood Test',
      date: '2024-01-18',
      provider: 'Central Lab',
      status: 'reviewed',
      fileSize: '2.4 MB',
    },
    {
      id: 'REC002',
      title: 'Chest X-Ray',
      type: 'X-Ray',
      date: '2024-01-15',
      provider: 'Radiology Department',
      status: 'reviewed',
      fileSize: '5.1 MB',
    },
    {
      id: 'REC003',
      title: 'Cardiac Stress Test',
      type: 'ECG',
      date: '2024-01-10',
      provider: 'Cardiology Clinic',
      status: 'pending',
      fileSize: '1.8 MB',
    },
    {
      id: 'REC004',
      title: 'Brain MRI',
      type: 'MRI',
      date: '2023-12-20',
      provider: 'Imaging Center',
      status: 'reviewed',
      fileSize: '45.2 MB',
    },
  ]);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Lab Report': 'bg-blue-100 text-blue-800',
      'X-Ray': 'bg-purple-100 text-purple-800',
      'MRI': 'bg-indigo-100 text-indigo-800',
      'CT Scan': 'bg-pink-100 text-pink-800',
      'Blood Test': 'bg-red-100 text-red-800',
      'ECG': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">Manage and view all patient medical records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <Plus size={20} />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.fileSize}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No medical records found.</p>
        </div>
      )}
    </div>
  );
};

export default Records;
