import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, User as UserIcon, Sparkles, MapPin, Phone,
  Mail, Calendar, Ticket, Briefcase, Award, CheckCircle2,
  AlertCircle, Edit2, Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { LineLessToken, WorkHubApplication, PlatformStats } from '../types';

export const DashboardView: React.FC = () => {
  const { user, isAdmin, updateProfile } = useAuth();
  const { lang, t } = useLanguage();

  const [myTokens, setMyTokens] = useState<LineLessToken[]>([]);
  const [myApplications, setMyApplications] = useState<WorkHubApplication[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [phone, setPhone] = useState(user?.phone || '');
  const [thana, setThana] = useState(user?.thana || '');
  const [district, setDistrict] = useState(user?.district || '');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tokens, apps, platformStats] = await Promise.all([
          api.getMyTokens(),
          api.getMyApplications(),
          api.getStats(),
        ]);
        setMyTokens(tokens);
        setMyApplications(apps);
        setStats(platformStats);
      } catch (err) {
        console.error(err);
      }
    }
    loadDashboard();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ phone, thana, district });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Please sign in to view your citizen dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.full_name}`}
            alt={user.full_name}
            className="w-20 h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.full_name}</h1>
              {user.is_verified && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                {user.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {user.thana}, {user.district}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                {user.phone || 'No phone set'}
              </span>
            </div>
          </div>
        </div>

        {/* Reputation Badge */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 text-center min-w-[180px]">
          <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
            Reputation Score
          </span>
          <div className="text-3xl font-black text-emerald-700 my-0.5 flex items-center justify-center gap-1">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>{user.reputation_score}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Active Community Member
          </span>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Edit2 className="w-4 h-4 text-emerald-600" />
            {lang === 'bn' ? 'ব্যক্তিগত তথ্য আপডেট করুন' : 'Update Profile Details'}
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-emerald-600 font-semibold hover:underline"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Thana / Area</label>
              <input
                type="text"
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Overview Metrics (If Admin) */}
      {isAdmin && stats && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base">ParaBondhu National Platform Overview (Admin)</h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono">LIVE PRODUCTION TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block">Active Citizens</span>
              <span className="text-xl font-bold text-white">{stats.active_citizens}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block">Traffic Reports</span>
              <span className="text-xl font-bold text-amber-400">{stats.traffic_reports_today}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block">Virtual Tokens Served</span>
              <span className="text-xl font-bold text-purple-400">{stats.virtual_tokens_served}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block">Reunited Belongings</span>
              <span className="text-xl font-bold text-emerald-400">{stats.reunited_items_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* My Activity Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My LineLess Tokens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Ticket className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">My LineLess Tokens</h3>
          </div>

          <div className="space-y-2">
            {myTokens.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No digital tokens requested yet.</p>
            ) : (
              myTokens.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-700 text-sm block">{t.token_code}</span>
                    <span className="text-slate-600">{t.provider_name} • {t.queue_name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    t.status === 'called' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Job Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800">My WorkHub Applications</h3>
          </div>

          <div className="space-y-2">
            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No job applications submitted yet.</p>
            ) : (
              myApplications.map((app) => (
                <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{app.job_title}</span>
                    <span className="text-slate-500">{app.company_name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
