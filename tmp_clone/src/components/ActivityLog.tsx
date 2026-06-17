import React, { useState } from 'react';
import { Activity, FileText, Calendar, Pill, FlaskConical, Heart, Search, Shield } from 'lucide-react';
import { activities } from '../data';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'record_update': return <FileText className="w-4 h-4" />;
    case 'appointment': return <Calendar className="w-4 h-4" />;
    case 'prescription': return <Pill className="w-4 h-4" />;
    case 'lab_result': return <FlaskConical className="w-4 h-4" />;
    case 'admission': return <Heart className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const getActivityBg = (type: string) => {
  switch (type) {
    case 'record_update': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'appointment': return 'bg-violet-50 text-violet-600 border-violet-200';
    case 'prescription': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'lab_result': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'admission': return 'bg-red-50 text-red-600 border-red-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const ActivityLog: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivities = activities.filter(a => {
    const matchesFilter = filter === 'all' || a.type === filter;
    const matchesSearch = a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.actor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activityTypes = [
    { id: 'all', label: 'All Activities', count: activities.length },
    { id: 'record_update', label: 'Record Updates', count: activities.filter(a => a.type === 'record_update').length },
    { id: 'appointment', label: 'Appointments', count: activities.filter(a => a.type === 'appointment').length },
    { id: 'prescription', label: 'Prescriptions', count: activities.filter(a => a.type === 'prescription').length },
    { id: 'lab_result', label: 'Lab Results', count: activities.filter(a => a.type === 'lab_result').length },
    { id: 'admission', label: 'Admissions', count: activities.filter(a => a.type === 'admission').length },
  ];

  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = {};
  filteredActivities.forEach(activity => {
    const date = activity.timestamp.split(' ')[0];
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-slate-500 mt-1">Every action is tracked for compliance and traceability</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
          <Shield className="w-3.5 h-3.5" />
          <span>Immutable • Cannot be modified or deleted</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {activityTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === type.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <p className={`text-xl font-bold ${filter === type.id ? 'text-white' : 'text-slate-900'}`}>{type.count}</p>
            <p className={`text-xs mt-0.5 ${filter === type.id ? 'text-blue-100' : 'text-slate-500'}`}>{type.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search audit trail by description, patient, or actor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Activity Timeline */}
      {Object.entries(groupedActivities).map(([date, dayActivities]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {date}
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{dayActivities.length} entries</span>
          </h3>
          <div className="space-y-3">
            {dayActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getActivityBg(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{activity.type.replace('_', ' ')}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">{activity.patientName}</span>
                      <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-medium">By: {activity.actor}</span>
                      <span className="text-xs text-slate-400">{activity.timestamp.split(' ')[1]}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-mono">{activity.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredActivities.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No audit entries found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
