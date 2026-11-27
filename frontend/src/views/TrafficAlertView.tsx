import React, { useState, useEffect } from 'react';
import {
  Car, AlertTriangle, CloudRain, ShieldCheck, ThumbsUp, ThumbsDown,
  Compass, Plus, Filter, MapPin, CheckCircle2, Info, Layers
} from 'lucide-react';
import { TrafficReport } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapComponent, MapMarkerItem } from '../components/MapComponent';

export const TrafficAlertView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [officialOnly, setOfficialOnly] = useState<boolean>(false);
  const [districtFilter, setDistrictFilter] = useState<string>('');
  
  // Create Report Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('congestion');
  const [severity, setSeverity] = useState('medium');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState(user?.district || 'Dhaka');
  const [altRoute, setAltRoute] = useState('');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>([23.8103, 90.4125]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (officialOnly) params.is_official = true;
      if (districtFilter) params.district = districtFilter;

      const data = await api.getTrafficReports(params);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, officialOnly, districtFilter]);

  const handleVerify = async (reportId: number, vote_type: string) => {
    if (!isAuthenticated) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please log in to verify reports');
      return;
    }
    try {
      await api.verifyTrafficReport(reportId, { vote_type });
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoord) return;
    setSubmitting(true);
    try {
      await api.createTrafficReport({
        title,
        description,
        category,
        severity,
        latitude: selectedCoord[0],
        longitude: selectedCoord[1],
        location_name: locationName,
        district,
        suggested_alternative_route: altRoute,
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setLocationName('');
      setAltRoute('');
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const mapMarkers: MapMarkerItem[] = reports.map((r) => ({
    id: r.id,
    latitude: r.latitude,
    longitude: r.longitude,
    title: r.title,
    category: r.category,
    severity: r.severity,
    is_official: r.is_official,
    description: r.description,
    type: 'traffic',
  }));

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'waterlogging':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 flex items-center gap-1"><CloudRain className="w-3 h-3" /> {t('traffic.waterlogging')}</span>;
      case 'accident':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('traffic.accident')}</span>;
      case 'road_closure':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 flex items-center gap-1"><Layers className="w-3 h-3" /> {t('traffic.road_closure')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><Car className="w-3 h-3" /> {t('traffic.congestion')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Car className="w-3.5 h-3.5 text-amber-200" />
            <span>TrafficAlert (ট্রাফিক অ্যালার্ট)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('traffic.title')}
          </h1>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            {t('traffic.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert(lang === 'bn' ? 'রিপোর্ট দিতে প্রথমে লগইন করুন' : 'Please log in to report incidents');
              return;
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md hover:bg-amber-50 transition-all flex items-center space-x-2 text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-600" />
          <span>{t('traffic.report_now')}</span>
        </button>
      </div>

      {/* Map Visualization */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-sm">
              {lang === 'bn' ? 'সরাসরি মানচিত্রে ট্রাফিক জোন' : 'Live Interactive Incident Map'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {reports.length} {lang === 'bn' ? 'টি অ্যাক্টিভ রিপোর্ট' : 'active incident markers'}
          </span>
        </div>

        <MapComponent
          markers={mapMarkers}
          height="380px"
          onLocationSelect={(lat, lng) => setSelectedCoord([lat, lng])}
          selectedCoord={selectedCoord}
        />
      </div>

      {/* Filter and Switcher Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'congestion', 'waterlogging', 'accident', 'road_closure'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? (lang === 'bn' ? 'সকল' : 'All') : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={officialOnly}
              onChange={(e) => setOfficialOnly(e.target.checked)}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-purple-700 font-semibold">{t('traffic.official_only')}</span>
          </label>

          <input
            type="text"
            placeholder={lang === 'bn' ? 'জেলা খুঁজুন...' : 'Filter district...'}
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-xs w-32"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading traffic alerts...
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            {lang === 'bn' ? 'কোনো সক্রিয় ট্রাফিক রিপোর্ট পাওয়া যায়নি।' : 'No active traffic alerts matching the filter.'}
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className={`rounded-2xl p-5 border shadow-xs transition-all bg-white ${
                report.is_official
                  ? 'border-purple-200 ring-1 ring-purple-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {getCategoryBadge(report.category)}
                  {report.is_official ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      {t('badge.official')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {t('badge.community')}
                    </span>
                  )}
                  {report.title.includes('[Demo Seed Data]') && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                      Demo
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {report.title}
              </h3>

              <div className="flex items-center text-xs text-slate-500 my-1.5 space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{report.location_name} ({report.district})</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {report.description}
              </p>

              {/* Alternative Route Suggestion Box */}
              {report.suggested_alternative_route && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                  <div className="font-bold flex items-center space-x-1 text-amber-800 mb-0.5">
                    <Compass className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('traffic.alt_route')}:</span>
                  </div>
                  <p className="text-[11px] text-amber-950 font-medium leading-relaxed">
                    {report.suggested_alternative_route}
                  </p>
                </div>
              )}

              {/* Reporter Info & Community Verification Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {report.is_official
                    ? report.official_source
                    : `${lang === 'bn' ? 'রিপোর্টকারী:' : 'Reported by:'} ${report.reporter_name || 'Citizen'}`}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVerify(report.id, 'upvote')}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors text-[11px] font-semibold"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{report.upvotes_count}</span>
                  </button>
                  <button
                    onClick={() => handleVerify(report.id, 'downvote')}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-[11px]"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>{report.downvotes_count}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Traffic Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lang === 'bn' ? 'ট্রাফিক বা সড়ক পরিস্থিতি রিপোর্ট করুন' : 'Report Traffic Incident'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'কমিউনিটির সুরক্ষায় সঠিক তথ্য শেয়ার করুন' : 'Provide accurate data to help fellow commuters'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ঘটনার শিরোনাম' : 'Incident Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bijoy Sarani heavy waterlogging after rain"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ক্যাটেগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="congestion">Congestion (যানজট)</option>
                    <option value="waterlogging">Waterlogging (জলাবদ্ধতা)</option>
                    <option value="accident">Accident (দুর্ঘটনা)</option>
                    <option value="road_closure">Road Closure (রাস্তা বন্ধ)</option>
                    <option value="construction">Construction (উন্নয়ন কাজ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'তীব্রতা' : 'Severity'}
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low (হালকা)</option>
                    <option value="medium">Medium (মাঝারি)</option>
                    <option value="high">High (তীব্র)</option>
                    <option value="severe">Severe (স্থবির)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'স্থান / মোড়' : 'Location Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Kakoli Crossing, Banani"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe road blockage, vehicle movement speed, etc."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিকল্প পথ পরামর্শ (যদি জানা থাকে)' : 'Alternative Route Suggestion'}
                </label>
                <input
                  type="text"
                  value={altRoute}
                  onChange={(e) => setAltRoute(e.target.value)}
                  placeholder="e.g. Divert through Hatirjheel loop 3"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  {lang === 'bn' ? 'ম্যাপ পিন লোকেশন:' : 'Pinned Map Location:'}
                </span>
                <span className="text-slate-500">
                  Lat: {selectedCoord ? selectedCoord[0].toFixed(4) : 23.8103}, Lng: {selectedCoord ? selectedCoord[1].toFixed(4) : 90.4125}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  (You can click directly on the main interactive map to adjust coordinates)
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {submitting ? 'Submitting...' : t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
