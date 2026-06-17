import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../auth/types';

type AuthMode = 'select' | 'login' | 'register' | 'forgot';

const LoginPage: React.FC = () => {
  const { login, selectedRole, setSelectedRole } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('select');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [forgotId, setForgotId] = useState('');

  const resetForm = () => {
    setUserId('');
    setPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setForgotId('');
    setError('');
    setMessage('');
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedRole) {
      setError('Please select your role first.');
      return;
    }

    if (!userId.trim() || !password) {
      setError('Please enter both User ID and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(userId, password);
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Login failed.');
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedRole) {
      setError('Please select a role before registering.');
      return;
    }
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill all registration fields.');
      return;
    }

    setMessage('Registration submitted. Use your new credentials to sign in once approved.');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!forgotId.trim()) {
      setError('Please enter your User ID or email.');
      return;
    }

    setMessage('If this account exists, instructions have been sent to the registered email.');
    setForgotId('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setAuthMode('select');
    resetForm();
  };

  const renderRoleSelection = () => (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Welcome to UDHRS</h1>
        <p className="text-slate-500 mt-3 text-lg">Unified Digital Health Record System</p>
        <p className="text-slate-400 mt-1 text-sm">Role-based access for patients, doctors, labs, pharmacies, records staff and admins.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(ROLES).map((roleConfig) => (
          <button
            key={roleConfig.role}
            type="button"
            onClick={() => {
              setSelectedRole(roleConfig.role);
              setAuthMode('login');
              resetForm();
            }}
            className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50"
          >
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{roleConfig.label}</h3>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{roleConfig.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">{roleConfig.idFormat}</span>
              <span className={`text-xs font-semibold ${roleConfig.textColor} group-hover:translate-x-1 transition-transform`}>Login →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-3xl p-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-3">
          <CheckCircle2 className="w-4 h-4" /> Demo Credentials
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
          <div><strong>Doctor:</strong> UDHRS-DOC-20001 / doctor123</div>
          <div><strong>Patient:</strong> UDHRS-PAT-10001 / patient123</div>
          <div><strong>Laboratory:</strong> UDHRS-LAB-30001 / lab123</div>
          <div><strong>Pharmacy:</strong> UDHRS-PHM-40001 / pharm123</div>
          <div><strong>Records:</strong> UDHRS-MRC-50001 / records123</div>
          <div><strong>Admin:</strong> UDHRS-ADM-90001 / admin123</div>
        </div>
      </div>
    </div>
  );

  const renderSelectedRoleHeader = () => {
    if (!selectedRole) return null;
    const roleConfig = ROLES[selectedRole];
    return (
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200/80">
        <div className={`bg-gradient-to-r ${roleConfig.bgGradient} px-6 py-5`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-3xl">
              {roleConfig.label.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{roleConfig.label} Login</h2>
              <p className="text-sm text-white/80">{roleConfig.description}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormActions = () => (
    <div className="flex flex-col gap-3 text-sm text-slate-600 mt-2">
      <button type="button" onClick={() => { setAuthMode('forgot'); setError(''); setMessage(''); }} className="text-left text-blue-600 hover:text-blue-800 transition-colors">
        Forgot password?
      </button>
      <button type="button" onClick={() => { setAuthMode('register'); setError(''); setMessage(''); }} className="text-left text-blue-600 hover:text-blue-800 transition-colors">
        Register a new account
      </button>
    </div>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="p-6 space-y-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
      {error && <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <div>
        <label className="text-sm font-medium text-slate-900">User ID</label>
        <div className="mt-3 rounded-3xl bg-slate-50 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={ROLES[selectedRole]?.idFormat || 'UDHRS-XXXX-XXXXX'}
              className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-900">Password</label>
        <div className="mt-3 rounded-3xl bg-slate-50 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>
      {renderFormActions()}
      <p className="text-xs text-slate-500">Demo IDs: UDHRS-PAT-10001, UDHRS-DOC-20001, UDHRS-ADM-90001</p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="p-6 space-y-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Register as {ROLES[selectedRole!].label}</h2>
        <button type="button" onClick={() => { setAuthMode('login'); setError(''); setMessage(''); }} className="text-sm text-blue-600 hover:text-blue-800">
          Back to Login
        </button>
      </div>
      {error && <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <div>
        <label className="text-sm font-medium text-slate-900">Full Name</label>
        <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name" className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-900">Email</label>
        <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-900">Password</label>
        <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} type="password" placeholder="Create password" className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500" />
      </div>

      <button type="submit" className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Submit Registration
      </button>
      <button type="button" onClick={() => { setAuthMode('login'); setError(''); setMessage(''); }} className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Already have an account?
      </button>
    </form>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgot} className="p-6 space-y-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Forgot Password</h2>
        <button type="button" onClick={() => { setAuthMode('login'); setError(''); setMessage(''); }} className="text-sm text-blue-600 hover:text-blue-800">
          Back to Login
        </button>
      </div>
      {error && <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <div>
        <label className="text-sm font-medium text-slate-900">User ID or Email</label>
        <input value={forgotId} onChange={(e) => setForgotId(e.target.value)} placeholder="Enter your registered ID or email" className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500" />
      </div>

      <button type="submit" className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Send Reset Instructions
      </button>
    </form>
  );

  if (authMode === 'select' || !selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">{renderRoleSelection()}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Role Selection
        </button>

        {renderSelectedRoleHeader()}

        {authMode === 'login' && renderLoginForm()}
        {authMode === 'register' && renderRegisterForm()}
        {authMode === 'forgot' && renderForgotForm()}

        <p className="text-center text-slate-500 text-sm">© 2024 UDHRS - Universal Digital Health Records System</p>
      </div>
    </div>
  );
};

export default LoginPage;
