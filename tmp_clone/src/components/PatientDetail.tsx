import React, { useState } from 'react';
import {
  ArrowLeft, Heart, Activity, Thermometer, Droplets,
  Clock, Pill, AlertTriangle, Phone, Mail,
  FileText, Download, Edit, Plus, Lock, Shield
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Patient } from '../types';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
}

const getAvatarColor = (name: string) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-cyan-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" />Active</span>;
    case 'critical':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Critical</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400" />Inactive</span>;
    default:
      return null;
  }
};

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'history'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'vitals' as const, label: 'Vitals & Charts' },
    { id: 'medications' as const, label: 'Medications' },
    { id: 'history' as const, label: 'History' },
  ];

  const latestVitals = patient.vitals[0];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Record</h1>
            <p className="text-slate-500 text-sm">ID: {patient.id} • Immutable Record (Audit Logged)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
            <Shield className="w-3.5 h-3.5" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>RSA Transmission</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20">
            <Edit className="w-4 h-4" />
            Update Record
          </button>
        </div>
      </div>

      {/* Immutable Record Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Immutable Record Notice</p>
          <p className="text-xs text-amber-700 mt-1">
            All records in UDHRS are immutable. Any corrections or updates are logged as new entries in the audit trail.
            Previous versions are preserved for complete traceability. This ensures data integrity and compliance.
          </p>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 h-24" />
        <div className="px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 -mt-10">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(patient.name)} flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white flex-shrink-0`}>
              {patient.avatar}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                {getStatusBadge(patient.status)}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                <span>{patient.age} years old</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span className="text-red-600 font-semibold">Blood Type: {patient.bloodType}</span>
                <span>•</span>
                <span>Patient ID: {patient.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{patient.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/60">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Heart Rate', value: `${latestVitals.heartRate} bpm`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'Blood Pressure', value: latestVitals.bloodPressure, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Temperature', value: `${latestVitals.temperature}°F`, icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Oxygen Level', value: `${latestVitals.oxygenLevel}%`, icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Conditions & Allergies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Medical Conditions (Diagnosis by Doctor)
                  </h3>
                  <div className="space-y-2">
                    {patient.conditions.map((condition, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-4 py-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-slate-700">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Known Allergies
                  </h3>
                  {patient.allergies.length > 0 ? (
                    <div className="space-y-2">
                      {patient.allergies.map((allergy, i) => (
                        <div key={i} className="flex items-center gap-2 bg-red-50 rounded-lg px-4 py-3">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-sm text-red-700 font-medium">{allergy}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 rounded-lg px-4 py-3">
                      <span className="text-sm text-emerald-700 font-medium">No known allergies</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-violet-500" />
                  Current Medications
                </h3>
                <div className="grid gap-3">
                  {patient.medications.map((med, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{med.name}</p>
                          <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>Prescribed by {med.prescribedBy}</p>
                        <p>Since {med.startDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              {/* Heart Rate Chart */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Heart Rate Trend (Last 6 Readings)</h3>
                <div className="h-52 bg-slate-50 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patient.vitals}>
                      <defs>
                        <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                      <Area type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2.5} fill="url(#hrGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature & Oxygen Chart */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Temperature & O₂ Level Trend</h3>
                <div className="h-52 bg-slate-50 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patient.vitals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b' }} name="Temperature (°F)" />
                      <Line type="monotone" dataKey="oxygenLevel" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4' }} name="O₂ Level (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vitals Table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Vitals History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Heart Rate</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Blood Pressure</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Temperature</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">O₂ Level</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Weight</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Glucose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.vitals.map((v, i) => (
                        <tr key={i} className={`border-b border-slate-100 ${i === 0 ? 'bg-blue-50/50' : ''}`}>
                          <td className="py-3 px-4 text-slate-700 font-medium">{v.date}</td>
                          <td className="py-3 px-4 text-slate-700">{v.heartRate} bpm</td>
                          <td className="py-3 px-4 text-slate-700">{v.bloodPressure}</td>
                          <td className="py-3 px-4 text-slate-700">{v.temperature}°F</td>
                          <td className="py-3 px-4 text-slate-700">{v.oxygenLevel}%</td>
                          <td className="py-3 px-4 text-slate-700">{v.weight} lbs</td>
                          <td className="py-3 px-4 text-slate-700">{v.glucose} mg/dL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900">Active Prescriptions</h3>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Prescription
                </button>
              </div>
              {patient.medications.map((med, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-slate-900">{med.name}</h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{med.frequency}</span>
                        </div>
                        <span>•</span>
                        <span>Dosage: {med.dosage}</span>
                        <span>•</span>
                        <span>Prescribed by: {med.prescribedBy}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Started: {med.startDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                  <h4 className="text-sm font-semibold text-emerald-900 mb-1">Last Visit</h4>
                  <p className="text-2xl font-bold text-emerald-700">{patient.lastVisit}</p>
                  <p className="text-sm text-emerald-600 mt-1">Completed successfully</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Next Appointment</h4>
                  <p className="text-2xl font-bold text-blue-700">{patient.nextAppointment}</p>
                  <p className="text-sm text-blue-600 mt-1">Upcoming</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Visit Timeline</h3>
                <div className="space-y-4">
                  {patient.vitals.map((v, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        {i < patient.vitals.length - 1 && <div className="w-0.5 h-10 bg-slate-200" />}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">{v.date}</span>
                          <span className="text-xs text-slate-500">Routine Check-up</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          <span>HR: {v.heartRate} bpm</span>
                          <span>BP: {v.bloodPressure}</span>
                          <span>Temp: {v.temperature}°F</span>
                          <span>O₂: {v.oxygenLevel}%</span>
                          <span>Weight: {v.weight} lbs</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
