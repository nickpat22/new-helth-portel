import React from 'react';
import { LogIn, FileText, FlaskConical, Pill, Edit, Trash2 } from 'lucide-react';
import { activities } from '../data';

const ActivityLog: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="text-blue-600" size={20} />;
      case 'record_update':
        return <Edit className="text-purple-600" size={20} />;
      case 'lab_result':
        return <FlaskConical className="text-green-600" size={20} />;
      case 'prescription':
        return <Pill className="text-amber-600" size={20} />;
      case 'document_delete':
        return <Trash2 className="text-red-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-blue-50 border-l-4 border-blue-600';
      case 'record_update':
        return 'bg-purple-50 border-l-4 border-purple-600';
      case 'lab_result':
        return 'bg-green-50 border-l-4 border-green-600';
      case 'prescription':
        return 'bg-amber-50 border-l-4 border-amber-600';
      case 'document_delete':
        return 'bg-red-50 border-l-4 border-red-600';
      default:
        return 'bg-gray-50 border-l-4 border-gray-600';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Activity Log</h1>
        <p className="text-gray-600">System activity and audit trail</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activities.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Today</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{Math.floor(activities.length * 0.6)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activities.length}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-6 flex gap-4 ${getActivityColor(activity.type)} ${
                index !== activities.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {activity.description}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  By: <span className="font-medium">{activity.user}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>

              {/* Badge */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
                  {activity.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center mt-6">
        <button className="px-6 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium">
          Load More Activities
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
