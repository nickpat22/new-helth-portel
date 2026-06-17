import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User, Building2, AlertCircle, ChevronLeft, CheckCircle2, X, Mail, Phone, HelpCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../auth/types';

const LoginPage: React.FC = () => {
  const { login, selectedRole, setSelectedRole } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'id' | 'otp' | 'reset' | 'done'>('id');
  const [forgotId, setForgotId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your role first.');
      return;
    }

    if (!userId.trim()) {
      setError('Please enter your User ID.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(userId, password);
      if (!result.success) {
        setError(result.error || 'Login failed.');
      }
      setLoading(false);
    }, 800);
  };

  const handleForgotSubmit = () => {
    setForgotError('');
    if (forgotStep === 'id') {
      if (!forgotId.trim()) {
        setForgotError('Please enter your User ID.');
        return;
      }
      setForgotLoading(true);
      setTimeout(() => {
        setForgotLoading(false);
        setForgotStep('otp');
      }, 1200);
    } else if (forgotStep === 'otp') {
      if (!otp.trim() || otp.length !== 6) {
        setForgotError('Please enter the 6-digit OTP sent to your registered mobile.');
        return;
      }
      setForgotLoading(true);
      setTimeout(() => {
        setForgotLoading(false);
        setForgotStep('reset');
      }, 1200);
    } else if (forgotStep === 'reset') {
      if (!newPassword || newPassword.length < 6) {
        setForgotError('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setForgotError('Passwords do not match.');
        return;
      }
      setForgotLoading(true);
      setTimeout(() => {
        setForgotLoading(false);
        setForgotStep('done');
      }, 1200);
    }
  };

  const resetForgot = () => {
    setShowForgotModal(false);
    setForgotStep('id');
    setForgotId('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        {/* Government Header */}
        <header className="bg-white border-b-4 border-orange-500 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
                  <span className="text-white text-xl">🇮🇳</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900">भारत सरकार | Government of India</h1>
                  <p className="text-xs text-slate-600">Ministry of Health & Family Welfare</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Secured by AES-256 & RSA Encryption</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-5xl">
            {/* Logo & Title */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Welcome to UDHRS</h1>
              <p className="text-slate-500 mt-3 text-lg">
                Unified Digital Health Record System
              </p>
              <p className="text-slate-400 mt-1 text-sm">
                Cloud-Based · Role-Based Access Control · Multi-Device · Audit Logged
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(ROLES).map((roleConfig) => (
                <button
                  key={roleConfig.role}
                  onClick={() => setSelectedRole(roleConfig.role)}
                  className="group bg-white rounded-2xl p-6 border-2 border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 text-left"
                >
                  <div className="text-4xl mb-4">{roleConfig.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {roleConfig.label}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{roleConfig.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{roleConfig.idFormat}</span>
                    <span className={`text-xs font-semibold ${roleConfig.textColor} group-hover:translate-x-1 transition-transform`}>
                      Login →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Demo Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-2xl mx-auto">
              <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Demo Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-blue-800">
                <div><strong>Doctor:</strong> UDHRS-DOC-20001 / doctor123</div>
                <div><strong>Patient:</strong> UDHRS-PAT-10001 / patient123</div>
                <div><strong>Laboratory:</strong> UDHRS-LAB-30001 / lab123</div>
                <div><strong>Pharmacy:</strong> UDHRS-PHM-40001 / pharm123</div>
                <div><strong>Records:</strong> UDHRS-MRC-50001 / records123</div>
                <div><strong>Admin:</strong> UDHRS-ADM-90001 / admin123</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>© 2024 UDHRS - Government of India</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Helpline: 1800-XXX-XXXX</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>|</span>
              <span>Terms of Service</span>
              <span>|</span>
              <span>GIGW Compliance</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Login Form for selected role
  const roleConfig = ROLES[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Government Header */}
      <header className="bg-white border-b-4 border-orange-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
                <span className="text-white text-xl">🇮🇳</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">भारत सरकार | Government of India</h1>
                <p className="text-xs text-slate-600">Ministry of Health & Family Welfare</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secured by AES-256 & RSA Encryption</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => { setSelectedRole(null); setError(''); setUserId(''); setPassword(''); }}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Role Selection
          </button>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
            {/* Role Header */}
            <div className={`bg-gradient-to-r ${roleConfig.bgGradient} px-6 py-5`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  {roleConfig.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{roleConfig.label} Login</h2>
                  <p className="text-sm text-white/80">{roleConfig.description}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {roleConfig.idLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toUpperCase())}
                    placeholder={roleConfig.idFormat}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:font-mono placeholder:text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Enter your unique government-issued ID</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Government System Notice</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    All login attempts are logged. Unauthorized access is a punishable offence under the IT Act, 2000.
                  </p>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleConfig.bgGradient} text-white py-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Secure Login
                  </>
                )}
              </button>

              {/* Links */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <button type="button" onClick={() => setShowForgotModal(true)} className="hover:text-blue-700 transition-colors">Forgot Password?</button>
                <button type="button" onClick={() => setShowHelpModal(true)} className="hover:text-blue-700 transition-colors">Help & Support</button>
              </div>
            </form>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>256-bit SSL</span>
            </div>
            <div>•</div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>AES Encrypted</span>
            </div>
            <div>•</div>
            <span>GIGW Certified</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {forgotStep === 'done' ? 'Password Reset Successful' : 'Reset Password'}
              </h3>
              <button onClick={resetForgot} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {forgotStep === 'id' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Enter your registered User ID. An OTP will be sent to your registered mobile number.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">User ID</label>
                  <input
                    type="text"
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value.toUpperCase())}
                    placeholder="UDHRS-XXX-XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            )}

            {forgotStep === 'otp' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to your registered mobile ending in <strong>XX1234</strong>.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <button className="text-xs text-blue-600 hover:text-blue-700">Resend OTP</button>
              </div>
            )}

            {forgotStep === 'reset' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Create a new secure password.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            )}

            {forgotStep === 'done' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-600">Your password has been reset successfully. Please login with your new password.</p>
              </div>
            )}

            {forgotError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{forgotError}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              {forgotStep !== 'done' ? (
                <>
                  <button
                    onClick={resetForgot}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForgotSubmit}
                    disabled={forgotLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {forgotStep === 'id' && 'Send OTP'}
                        {forgotStep === 'otp' && 'Verify'}
                        {forgotStep === 'reset' && 'Reset Password'}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={resetForgot}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Help & Support</h3>
              <button onClick={() => setShowHelpModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Helpline Number</p>
                  <p className="text-sm text-blue-700 mt-0.5">1800-XXX-XXXX (Toll Free)</p>
                  <p className="text-xs text-blue-600 mt-0.5">Available 24x7</p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Email Support</p>
                  <p className="text-sm text-emerald-700 mt-0.5">support@udhrs.gov.in</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Response within 24 hours</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Common Issues</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>• Forgot User ID? Contact your system administrator</li>
                    <li>• Account locked? Wait 30 minutes or call helpline</li>
                    <li>• First time login? Use credentials provided by admin</li>
                    <li>• OTP not received? Check registered mobile number</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>© 2024 UDHRS - Government of India</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>|</span>
            <span>Terms of Service</span>
            <span>|</span>
            <span>GIGW Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
