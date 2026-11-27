import React, { useState, useEffect } from 'react';
import {
  Briefcase, GraduationCap, MapPin, DollarSign, Clock,
  CheckCircle2, Plus, FileText, Search, Sparkles, Send
} from 'lucide-react';
import { SkillCourse, WorkHubJob } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const WorkHubView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'jobs' | 'courses' | 'cv_guide'>('jobs');
  const [jobs, setJobs] = useState<WorkHubJob[]>([]);
  const [courses, setCourses] = useState<SkillCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Application Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<WorkHubJob | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  // Post Job Modal
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState('full_time');
  const [workplaceType, setWorkplaceType] = useState('on_site');
  const [jobLocation, setJobLocation] = useState('Dhaka, Bangladesh');
  const [salaryMin, setSalaryMin] = useState('30000');
  const [salaryMax, setSalaryMax] = useState('45000');
  const [skillsReq, setSkillsReq] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'jobs') {
        const data = await api.getWorkHubJobs({
          job_type: jobTypeFilter !== 'all' ? jobTypeFilter : undefined,
          search: search || undefined,
        });
        setJobs(data);
      } else if (activeTab === 'courses') {
        const data = await api.getCourses({ search: search || undefined });
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, jobTypeFilter, search]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    setSubmittingApply(true);
    try {
      await api.applyWorkHubJob({
        job_id: selectedJobForApply.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        portfolio_url: portfolioUrl,
      });
      alert(lang === 'bn' ? 'আবেদন সফলভাবে পাঠানো হয়েছে!' : 'Application submitted successfully!');
      setIsApplyModalOpen(false);
      setCoverLetter('');
      setResumeUrl('');
      setPortfolioUrl('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingApply(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorkHubJob({
        title: jobTitle,
        company_name: companyName,
        job_type: jobType,
        workplace_type: workplaceType,
        location: jobLocation,
        salary_min: parseFloat(salaryMin) || 0,
        salary_max: parseFloat(salaryMax) || 0,
        skills_required: skillsReq,
        description: jobDesc,
      });
      setIsPostJobOpen(false);
      setJobTitle('');
      setCompanyName('');
      setSkillsReq('');
      setJobDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-indigo-200" />
            <span>Skill & Work Hub (দক্ষতা ও কর্মসংস্থান হাব)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('workhub.title')}
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
            {t('workhub.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert(lang === 'bn' ? 'বিজ্ঞপ্তি দিতে প্রথমে লগইন করুন' : 'Please log in to post jobs');
              return;
            }
            setIsPostJobOpen(true);
          }}
          className="px-4 py-2.5 bg-white text-indigo-900 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-all flex items-center space-x-1.5 text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>{t('workhub.post_job')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t('workhub.tab_jobs')}</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t('workhub.tab_courses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('cv_guide')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'cv_guide'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('workhub.cv_tips')}</span>
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Job Type:</span>
              {['all', 'full_time', 'part_time', 'freelance', 'remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => setJobTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    jobTypeFilter === type
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'all' ? 'All Roles' : type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search title, skills or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-52"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                Loading opportunities...
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                No job openings found.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {job.job_type.replace('_', ' ')} • {job.workplace_type}
                      </span>
                      {job.salary_min && (
                        <span className="text-emerald-700 font-bold text-xs">
                          ৳{job.salary_min.toLocaleString()} - ৳{job.salary_max?.toLocaleString()} /mo
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {job.title}
                    </h3>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      {job.company_name} • {job.location}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills_required.split(',').map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Verified Employer</span>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert(lang === 'bn' ? 'আবেদন করতে প্রথমে লগইন করুন' : 'Please log in to apply');
                          return;
                        }
                        setSelectedJobForApply(job);
                        setIsApplyModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('action.apply')}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 capitalize">
                    {course.category.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {course.is_free ? 'Free / সরকারি অনুদান' : `৳${course.price_bdt}`}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {course.title}
                </h3>
                <span className="text-xs text-slate-500 block my-1">
                  Provider: {course.provider_name}
                </span>

                <p className="text-xs text-slate-600 line-clamp-3 my-2">
                  {course.description}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                  <span>⏱ {course.duration_weeks} Weeks</span>
                  <span>•</span>
                  <span>📜 Certificate Included</span>
                  <span>•</span>
                  <span>🌐 {course.language}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={course.enrollment_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Enroll / Register on Official Portal
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CV Guide Tab */}
      {activeTab === 'cv_guide' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {lang === 'bn' ? 'বাংলাদেশ ও আন্তর্জাতিক মানের আকর্ষণীয় সিভি তৈরির নিয়ম' : 'Bangladesh & International Standard CV Best Practices'}
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">1. Keep it Concise (1 - 2 Pages Maximum):</strong>
              Employers take less than 10 seconds to scan. Place your technical skills, summary, and recent work right at the top.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">2. Contact Details & Privacy:</strong>
              Include your professional email, LinkedIn, and district. Avoid exposing sensitive private documents publicly.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-800 block mb-1">3. Measurable Impact:</strong>
              Use quantifiable outcomes: "Decreased page load time by 40%", "Served 50+ clients per week", "Passed JLPT N4 exam".
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Apply: {selectedJobForApply.title}
              </h3>
              <button onClick={() => setIsApplyModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter / Note</label>
                <textarea
                  required
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a strong fit..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume / CV Link (Google Drive / PDF)</label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio / GitHub Link (Optional)</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingApply}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {submittingApply ? 'Submitting...' : t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{t('workhub.post_job')}</h3>
              <button onClick={() => setIsPostJobOpen(false)}>✕</button>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Banglalink / StartUp"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace Type</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="on_site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary (৳ BDT)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary (৳ BDT)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Required (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={skillsReq}
                  onChange={(e) => setSkillsReq(e.target.value)}
                  placeholder="Python, FastAPI, PostgreSQL, Docker"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Job roles, requirements, benefits..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
