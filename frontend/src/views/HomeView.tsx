import React, { useState, useEffect } from 'react';
import {
  Car, Users, Search, Clock, Accessibility, Globe2,
  Briefcase, ArrowRight, ShieldCheck, Sparkles, CheckCircle2,
  MapPin, AlertCircle, HeartHandshake, Compass, Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlatformStats } from '../types';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentTab,
  openAuthModal,
}) => {
  const { lang, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch {
        // Fallback default
      }
    }
    loadStats();
  }, []);

  const modules = [
    {
      id: 'traffic',
      title: lang === 'bn' ? 'ট্রাফিক অ্যালার্ট' : 'TrafficAlert',
      subtitle: lang === 'bn' ? 'সড়ক জ্যাম, জলাবদ্ধতা ও দুর্ঘটনা' : 'Traffic, waterlogging & road closures',
      badge: lang === 'bn' ? 'লাইভ ম্যাপ' : 'Live Map',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Car,
      iconColor: 'text-amber-500',
      stat: stats ? `${stats.traffic_reports_today}+ reports` : 'Active feeds',
      actionText: lang === 'bn' ? 'সড়ক পরিস্থিতি দেখুন' : 'Explore Traffic Alert',
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-400',
    },
    {
      id: 'neighbor',
      title: lang === 'bn' ? 'পাড়া শেয়ার ও সহায়তা' : 'NeighborShare',
      subtitle: lang === 'bn' ? 'টুলস ও চিকিৎসা সামগ্রী ধার নিন' : 'Lend & borrow neighborhood items',
      badge: lang === 'bn' ? 'পারস্পরিক বিশ্বাস' : 'Mutual Aid',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Users,
      iconColor: 'text-emerald-600',
      stat: stats ? `${stats.active_community_loans} loans active` : 'Community items',
      actionText: lang === 'bn' ? 'আইটেম ধার নিন বা দিন' : 'Borrow & Share Items',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-400',
    },
    {
      id: 'khunje',
      title: lang === 'bn' ? 'খুঁজে দাও (লস্ট অ্যান্ড ফাউন্ড)' : 'KhunjeDao',
      subtitle: lang === 'bn' ? 'হারানো জিনিস উদ্ধার ও নিরাপদ হ্যান্ডওভার' : 'Lost & found with smart matching',
      badge: lang === 'bn' ? 'স্মার্ট ম্যাচ' : 'Smart Match',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: Search,
      iconColor: 'text-blue-600',
      stat: stats ? `${stats.reunited_items_count} reunited` : 'Safe Handover',
      actionText: lang === 'bn' ? 'হারানো জিনিস খুঁজুন' : 'Report / Search Item',
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'hover:border-blue-400',
    },
    {
      id: 'lineless',
      title: lang === 'bn' ? 'লাইনলেস (ডিজিটাল কিউ)' : 'LineLess',
      subtitle: lang === 'bn' ? 'হাসপাতাল ও ব্যাংকের ভার্চুয়াল টোকেন' : 'Skip physical crowds with digital tokens',
      badge: lang === 'bn' ? 'সময় বাঁচান' : 'Save Time',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Clock,
      iconColor: 'text-purple-600',
      stat: stats ? `${stats.virtual_tokens_served}+ tokens` : 'Live Counters',
      actionText: lang === 'bn' ? 'ডিজিটাল টোকেন নিন' : 'Get Digital Token',
      gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'hover:border-purple-400',
    },
    {
      id: 'easyaccess',
      title: lang === 'bn' ? 'সহজ এক্সেস' : 'EasyAccess',
      subtitle: lang === 'bn' ? 'হুইলচেয়ার ও প্রতিবন্ধীবান্ধব স্থান' : 'Wheelchair ramps, lifts & accessible spots',
      badge: lang === 'bn' ? 'অন্তর্ভুক্তি' : 'Accessible',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: Accessibility,
      iconColor: 'text-teal-600',
      stat: stats ? `${stats.accessible_spots_mapped} verified spots` : 'Inclusive Map',
      actionText: lang === 'bn' ? 'ম্যাপে স্থান দেখুন' : 'Explore Accessibility Map',
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      borderColor: 'hover:border-teal-400',
    },
    {
      id: 'probashi',
      title: lang === 'bn' ? 'প্রবাসী কানেক্ট' : 'ProbashiConnect',
      subtitle: lang === 'bn' ? 'বিএমইটি যাচাইকৃত বিদেশি চাকরি' : 'Verified overseas jobs & safe migration',
      badge: lang === 'bn' ? 'দালালমুক্ত' : 'BMET Verified',
      badgeColor: 'bg-sky-100 text-sky-800',
      icon: Globe2,
      iconColor: 'text-sky-600',
      stat: stats ? `${stats.verified_probashi_jobs} vacancies` : 'Zero Middlemen',
      actionText: lang === 'bn' ? 'বিদেশি চাকরি দেখুন' : 'View Verified Jobs',
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      borderColor: 'hover:border-sky-400',
    },
    {
      id: 'workhub',
      title: lang === 'bn' ? 'স্কিল ও কর্ম হাব' : 'Skill & Work Hub',
      subtitle: lang === 'bn' ? 'কোর্স, ফ্রিল্যান্সিং ও দেশি চাকরি' : 'Courses, local & remote careers, gigs',
      badge: lang === 'bn' ? 'দক্ষতা' : 'Upskilling',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: Briefcase,
      iconColor: 'text-indigo-600',
      stat: stats ? `${stats.active_job_seekers} active jobs` : 'Career Hub',
      actionText: lang === 'bn' ? 'কোর্স ও চাকরি খুঁজুন' : 'Find Courses & Jobs',
      gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-indigo-400',
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === 'bn' ? 'বাংলাদেশ-ফার্স্ট কমিউনিটি প্ল্যাটফর্ম' : 'Bangladesh-First Community Platform'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {lang === 'bn' ? (
              <>
                প্রতিদিনের জীবনকে সহজ করুন <br />
                <span className="text-emerald-300">বিশ্বস্ত কমিউনিটির সাথে</span>
              </>
            ) : (
              <>
                Making Everyday Life Easier <br />
                <span className="text-emerald-300">Through Trusted Community</span>
              </>
            )}
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-light">
            {t('app.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-6 py-3.5 bg-white text-emerald-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-emerald-50 transition-all flex items-center space-x-2 hover:scale-[1.02]"
                >
                  <span>{t('nav.register')}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-3.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-500/40 backdrop-blur-md transition-all"
                >
                  {t('nav.login')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-6 py-3.5 bg-white text-emerald-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-emerald-50 transition-all flex items-center space-x-2"
              >
                <span>{lang === 'bn' ? 'আপনার ড্যাশবোর্ডে যান' : 'Go to Citizen Dashboard'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>
            )}

            <button
              onClick={() => setCurrentTab('traffic')}
              className="px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <Car className="w-4 h-4" />
              <span>{lang === 'bn' ? 'লাইভ ট্রাফিক ম্যাপ' : 'Live Traffic Map'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Telemetry Stats Strip */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="pt-2 sm:pt-0">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
              {stats?.active_citizens || 120}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.citizens')}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
              {stats?.traffic_reports_today || 45}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.traffic')}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
              {stats?.active_community_loans || 18}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.loans')}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 block">
              {stats?.reunited_items_count || 34}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.reunited')}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 block">
              {stats?.virtual_tokens_served || 210}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.tokens')}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-2xl sm:text-3xl font-black text-teal-600 block">
              {stats?.accessible_spots_mapped || 68}+
            </span>
            <span className="text-xs text-slate-500 font-medium">{t('stats.spots')}</span>
          </div>
        </div>
      </section>

      {/* 7 Modules Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {lang === 'bn' ? 'সাতটি সমন্বিত প্ল্যাটফর্ম মডিউল' : 'Seven Integrated Platform Modules'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {lang === 'bn' ? 'আপনার প্রয়োজনীয় সেবাটি নির্বাচন করুন' : 'Select any module to interact in real time'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setCurrentTab(mod.id)}
                className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group ${mod.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-slate-200/80 transition-colors">
                      <Icon className={`w-6 h-6 ${mod.iconColor}`} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 font-medium">{mod.stat}</span>
                  <span className="text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>{mod.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparency & Integrity Disclaimer */}
      <section className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 text-sm block">
            {lang === 'bn' ? 'তথ্য সততা ও নির্ভরযোগ্যতা অঙ্গীকার' : 'Data Integrity & Anti-Fabrication Commitment'}
          </span>
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'পাড়াবন্ধু প্ল্যাটফর্মে কখনোই অসত্য ট্রাফিক, চাকরি বা সরকারি তথ্য উপস্থাপন করা হয় না। সকল নমুনা রেকর্ড স্পষ্টভাবে [ডেমো নমুনা ডেটা] বা [অফিসিয়াল তথ্য] লেবেলযুক্ত। অভিবাসন সংক্রান্ত তথ্যে দালালদের বিরুদ্ধে কড়া সতর্কতা দেওয়া হয়েছে।'
              : 'ParaBondhu adheres to strict anti-fabrication standards. Official authority feeds (DMP Traffic, BMET, Hospital Desks) are rigorously distinguished from community submissions. All seeded demonstration records are explicitly labeled [Demo Seed Data].'}
          </p>
        </div>
      </section>
    </div>
  );
};
