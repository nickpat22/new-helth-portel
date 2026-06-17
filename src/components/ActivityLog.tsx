import React, { useState, useEffect } from 'react';
import { LogIn, FileText, FlaskConical, Pill, Edit, Trash2 } from 'lucide-react';
import { getActivities } from '../lib/supabaseService';

const PAGE_SIZE = 10;

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchActivities = async (offsetVal: number, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    const { data, count } = await getActivities(PAGE_SIZE, offsetVal);
    if (data) {
      setActivities(prev => append ? [...prev, ...data] : data);
    }
    if (count !== null && count !== undefined) setTotalCount(count);
    if (append) setLoadingMore(false); else setLoading(false);
  };

  useEffect(() => { fetchActivities(0); }, []);

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchActivities(newOffset, true);
  };

  const todayCount = activities.filter(a => {
    const d = new Date(a.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const weekCount = activities.filter(a => {
    const d = new Date(a.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="text-blue-600" size={20} />;
      case 'record_update': return <Edit className="text-purple-600" size={20} />;
      case 'lab_result': return <FlaskConical className="text-green-600" size={20} />;
      case 'prescription': return <Pill className="text-amber-600" size={20} />;
      case 'document_delete': return <Trash2 className="text-red-600" size={20} />;
      default: return <FileText className="text-gray-600" size={20} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-50 border-l-4 border-blue-600';
      case 'record_update': return 'bg-purple-50 border-l-4 border-purple-600';
      case 'lab_result': return 'bg-green-50 border-l-4 border-green-600';
      case 'prescription': return 'bg-amber-50 border-l-4 border-amber-600';
      case 'document_delete': return 'bg-red-50 border-l-4 border-red-600';
      default: return 'bg-gray-50 border-l-4 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading activity log…</p>
        </div>
      </div>
    );
  }

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
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Today</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{todayCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{weekCount}</p>
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
              <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{activity.description}</h3>
                <p className="text-sm text-gray-600 mb-2">By: <span className="font-medium">{activity.user_name}</span></p>
                <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
                  {activity.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500"><p>No activities recorded yet.</p></div>
        )}
      </div>

      {/* Load More */}
      {activities.length < totalCount && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : `Load More Activities (${totalCount - activities.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
