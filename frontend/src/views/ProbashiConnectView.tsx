import React, { useState, useEffect } from 'react';
import {
  Globe2, ShieldAlert, ShieldCheck, CheckCircle2, Phone,
  FileText, ExternalLink, AlertTriangle, Building, Search, Landmark, Briefcase
} from 'lucide-react';
import { ProbashiJob, ProbashiGuide } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ProbashiConnectView: React.FC = () => {
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'jobs' | 'guides'>('jobs');
  const [jobs, setJobs] = useState<ProbashiJob[]>([]);
  const [guides, setGuides] = useState<ProbashiGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Job Details Modal
  const [selectedJob, setSelectedJob] = useState<ProbashiJob | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'jobs') {
        const data = await api.getProbashiJobs({
          country: countryFilter || undefined,
          sector: sectorFilter !== 'all' ? sectorFilter : undefined,
          search: search || undefined,
        });
        setJobs(data);
      } else {
        const data = await api.getProbashiGuides(countryFilter || undefined);
        setGuides(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, countryFilter, sectorFilter, search]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Globe2 className="w-3.5 h-3.5 text-sky-200" />
            <span>ProbashiConnect (প্রবাসী কানেক্ট ও নিরাপদ অভিবাসন)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('probashi.title')}
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">
            {t('probashi.subtitle')}
          </p>
        </div>
      </div>

      {/* Critical Anti-Fraud Disclaimer Alert */}
      <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-rose-900 flex items-start space-x-3 text-xs shadow-xs">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block text-rose-950">
            {lang === 'bn' ? 'দালাল ও অবৈধ ভিসা প্রতারণা থেকে সাবধান!' : 'Anti-Broker & Safe Migration Warning'}
          </span>
          <p className="leading-relaxed text-rose-900">
            {t('probashi.disclaimer')}
          </p>
          <div className="flex flex-wrap gap-4 pt-1 font-semibold text-rose-800">
            <span>📞 Probashi Kalyan Hotline: 16135 (Toll-free in BD)</span>
            <span>🌐 Verify BMET Smart Card: bmet.gov.bd</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t('probashi.verified_jobs')}</span>
        </button>

        <button
          onClick={() => setActiveTab('guides')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'guides'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('probashi.guides')}</span>
        </button>
      </div>

      {/* Jobs Section */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Filter:</span>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="all">All Sectors</option>
                <option value="healthcare">Healthcare & Nursing</option>
                <option value="manufacturing">Manufacturing & Tech</option>
                <option value="construction">Construction & Heavy Equip</option>
              </select>

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="">All Destination Countries</option>
                <option value="Japan">Japan</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="Qatar">Qatar</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
              </select>
            </div>

            <input
              type="text"
              placeholder={lang === 'bn' ? 'চাকরি বা দক্ষতা খুঁজুন...' : 'Search jobs or skills...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48"
            />
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                Loading verified opportunities...
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                No job postings found matching this filter.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800">
                        {job.destination_country}
                      </span>
                      {job.is_verified_agency && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {t('badge.bmet_approved')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {job.title}
                    </h3>

                    <div className="my-2 p-2 rounded-xl bg-slate-50 text-xs space-y-1">
                      <div className="text-slate-500">
                        <strong>Agency:</strong> {job.recruiter_agency}
                      </div>
                      <div className="text-slate-500">
                        <strong>RL License:</strong> {job.rl_license_no || 'Govt Direct'}
                      </div>
                      <div className="text-emerald-700 font-bold">
                        <strong>Salary:</strong> {job.salary_range}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2">
                      <strong>Requirements:</strong> {job.required_skills}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      {t('action.view_details')} & Cost Guidelines
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Guides Section */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800">
                  {guide.country}
                </span>
                <span className="text-slate-400 capitalize">{guide.category.replace('_', ' ')}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">
                {guide.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {guide.content}
              </p>

              {guide.helpline_phone && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{guide.helpline_phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedJob.title}</h3>
                <span className="text-xs text-sky-600 font-semibold">{selectedJob.destination_country} • {selectedJob.visa_type}</span>
              </div>
              <button onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div><strong>Authorized Recruiter:</strong> {selectedJob.recruiter_agency}</div>
                <div><strong>BMET Approval Number:</strong> {selectedJob.bmet_approval_no || 'Approved'}</div>
                <div><strong>Recruiting Agency RL:</strong> {selectedJob.rl_license_no || 'Govt G2G'}</div>
                <div><strong>Remuneration:</strong> {selectedJob.salary_range}</div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Skills & Criteria:</span>
                <p className="text-slate-600 leading-relaxed">{selectedJob.required_skills}</p>
              </div>

              {selectedJob.cost_guidelines && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" /> Official Cost Guidelines:
                  </span>
                  <p className="leading-relaxed">{selectedJob.cost_guidelines}</p>
                </div>
              )}

              {selectedJob.warnings_against_brokers && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Caution Notice:
                  </span>
                  <p className="leading-relaxed">{selectedJob.warnings_against_brokers}</p>
                </div>
              )}

              <div className="pt-2 text-center text-slate-400 text-[11px]">
                Always cross-verify recruitment advertisements at your district DEMO (District Employment and Manpower Office).
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
