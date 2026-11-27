import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('Dhanmondi');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          phone,
          division,
          district,
          thana,
          role: 'citizen',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login'
                ? lang === 'bn' ? 'পাড়াবন্ধু-তে প্রবেশ করুন' : 'Sign In to ParaBondhu'
                : lang === 'bn' ? 'নতুন নাগরিক একাউন্ট তৈরি করুন' : 'Create Citizen Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn' ? 'প্রতিবেশী সহায়তা ও নিরাপদ প্ল্যাটফর্ম' : 'Neighborhood mutual trust & verified services'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast-Fill Pills */}
        <div className="bg-emerald-50/70 px-6 py-2.5 border-b border-emerald-100 text-xs">
          <div className="text-[11px] font-semibold text-emerald-800 mb-1.5 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {lang === 'bn' ? 'দ্রুত ডেমো অ্যাকাউন্টে লগইন করুন:' : 'One-click quick demo accounts:'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('yeamin@parabondhu.bd', 'Citizen123!')}
              className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
            >
              Tanvir Yeamin (Citizen)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@parabondhu.bd', 'Admin123!')}
              className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('dmch_provider@parabondhu.bd', 'Provider123!')}
              className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium text-[11px] transition-colors"
            >
              DMCH Hospital Desk
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Yeamin"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.bd"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'থানা / এলাকা' : 'Thana / Area'}
                  </label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? t('nav.login') : t('nav.register')}
          </button>

          <div className="text-center pt-2 text-xs text-slate-500">
            {mode === 'login' ? (
              <span>
                {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলতে চান? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {t('nav.register')}
                </button>
              </span>
            ) : (
              <span>
                {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {t('nav.login')}
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
