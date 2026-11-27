import React, { useState, useEffect } from 'react';
import {
  Search, Shield, Sparkles, Plus, MapPin, Calendar,
  CheckCircle2, AlertCircle, FileText, Smartphone, Briefcase, Key, Eye
} from 'lucide-react';
import { KhunjeDaoItem, KhunjeDaoClaim } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const KhunjeDaoView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [items, setItems] = useState<KhunjeDaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [itemType, setItemType] = useState('phone');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [brandIdentifier, setBrandIdentifier] = useState('');
  const [safeHandover, setSafeHandover] = useState('Nearest Police Thana Helpdesk');
  const [imageUrl, setImageUrl] = useState('');

  // Match suggestions modal
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedItemForMatch, setSelectedItemForMatch] = useState<KhunjeDaoItem | null>(null);
  const [matchSuggestions, setMatchSuggestions] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Claim ownership modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<KhunjeDaoItem | null>(null);
  const [proofDescription, setProofDescription] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab !== 'all') params.report_type = activeTab;
      if (itemTypeFilter !== 'all') params.item_type = itemTypeFilter;
      if (search) params.search = search;

      const data = await api.getKhunjeItems(params);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab, itemTypeFilter, search]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createKhunjeItem({
        report_type: reportType,
        item_type: itemType,
        title,
        description,
        primary_image_url: imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
        location_name: locationName,
        district: user?.district || 'Dhaka',
        brand_or_identifier: brandIdentifier,
        safe_handover_location: safeHandover,
      });
      setIsReportModalOpen(false);
      setTitle('');
      setDescription('');
      setLocationName('');
      setBrandIdentifier('');
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckMatches = async (item: KhunjeDaoItem) => {
    setSelectedItemForMatch(item);
    setMatchModalOpen(true);
    setLoadingMatches(true);
    try {
      const matches = await api.getKhunjeMatches(item.id);
      setMatchSuggestions(matches);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim) return;
    setSubmittingClaim(true);
    try {
      await api.submitKhunjeClaim(selectedItemForClaim.id, {
        proof_description: proofDescription,
        proof_image_url: proofImageUrl,
      });
      alert(lang === 'bn' ? 'মালিকানা প্রমাণের দাবি সফলভাবে জমা হয়েছে!' : 'Ownership claim submitted to the finder!');
      setClaimModalOpen(false);
      setProofDescription('');
      setProofImageUrl('');
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'wallet_bag':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'nid_passport':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'keys':
        return <Key className="w-4 h-4 text-purple-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5 text-sky-200" />
            <span>KhunjeDao (খুঁজে দাও)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('khunje.title')}
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-2xl">
            {t('khunje.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                alert(lang === 'bn' ? 'রিপোর্ট করতে প্রথমে লগইন করুন' : 'Please log in to submit reports');
                return;
              }
              setReportType('lost');
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('khunje.report_lost')}</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                alert(lang === 'bn' ? 'রিপোর্ট করতে প্রথমে লগইন করুন' : 'Please log in to submit reports');
                return;
              }
              setReportType('found');
              setIsReportModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-white text-blue-900 hover:bg-sky-50 font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>{t('khunje.report_found')}</span>
          </button>
        </div>
      </div>

      {/* Safe Handover Advisory Notice */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 flex items-start space-x-3 text-xs">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm mb-0.5">
            {lang === 'bn' ? 'নিরাপদ হ্যান্ডওভার নীতি ও সতর্কতা' : 'Safe Handover Advisory & Checkpoint Policy'}
          </span>
          <p className="leading-relaxed text-amber-950">
            {lang === 'bn'
              ? 'ব্যক্তিগত নিরাপত্তা রক্ষার্থে কখনোই নির্জন স্থানে দেখা করবেন না। হারানো ও পাওয়া জিনিসপত্র হস্তান্তরের জন্য নিকটস্থ পুলিশ থানা বা মডেল ডিউটি ডেস্ক, অথবা বিশ্ববিদ্যালয় প্রক্টর অফিসকে নিরাপদ স্থান হিসেবে ব্যবহার করুন।'
              : 'For personal safety, never meet strangers in isolated areas. Always use recognized checkpoints such as your local Police Thana desk or university proctor office for ownership verification and handover.'}
          </p>
        </div>
      </div>

      {/* Filter and Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex border-b border-transparent gap-1.5">
          {[
            { id: 'all', label: t('khunje.tab_all') },
            { id: 'lost', label: t('khunje.tab_lost') },
            { id: 'found', label: t('khunje.tab_found') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
          >
            <option value="all">All Types</option>
            <option value="phone">Phones (মোবাইল)</option>
            <option value="wallet_bag">Wallets & Bags (ব্যাগ/মানিব্যাগ)</option>
            <option value="nid_passport">NID & Documents (এনআইডি/কাগজ)</option>
            <option value="keys">Keys (চাবি)</option>
          </select>

          <input
            type="text"
            placeholder={lang === 'bn' ? 'আইটেম বা স্থান...' : 'Search items...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-44"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading lost & found board...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            {lang === 'bn' ? 'কোনো হারানো বা পাওয়া আইটেম নেই।' : 'No items match the selected filter.'}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {item.primary_image_url && (
                  <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.primary_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs ${
                          item.report_type === 'lost'
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.report_type === 'lost' ? 'LOST (হারিয়ে গেছে)' : 'FOUND (পাওয়া গেছে)'}
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs">
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    {getItemTypeIcon(item.item_type)}
                    <span className="capitalize font-semibold text-slate-700">
                      {item.item_type.replace('_', ' ')}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.event_date).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>

                  {item.brand_or_identifier && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Identifier:</strong> {item.brand_or_identifier}
                    </div>
                  )}

                  <div className="flex items-center text-xs text-slate-500 space-x-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{item.location_name} ({item.district})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs py-2 text-slate-400 text-[11px]">
                  <span>Safe Handover: {item.safe_handover_location?.slice(0, 25)}...</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCheckMatches(item)}
                    className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>{lang === 'bn' ? 'ম্যাচিং চেক' : 'Matches'}</span>
                  </button>

                  {item.report_type === 'found' && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert(lang === 'bn' ? 'দাবি জানাতে প্রথমে লগইন করুন' : 'Please log in to claim items');
                          return;
                        }
                        setSelectedItemForClaim(item);
                        setClaimModalOpen(true);
                      }}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      {t('action.claim')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Match Suggestions Modal */}
      {matchModalOpen && selectedItemForMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  {t('khunje.smart_match')}
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing "{selectedItemForMatch.title}" with database
                </p>
              </div>
              <button onClick={() => setMatchModalOpen(false)}>✕</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {loadingMatches ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Running heuristic similarity matching...
                </div>
              ) : matchSuggestions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No matching counter-reports found yet. We will notify you when a match is detected!
                </div>
              ) : (
                matchSuggestions.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 text-sm">
                        {m.matched_item.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white font-black text-[11px]">
                        {m.confidence_score}% Match
                      </span>
                    </div>
                    <p className="text-slate-600">{m.matched_item.description}</p>
                    <div className="text-[11px] text-slate-500">
                      <strong>Keywords:</strong> {m.matching_keywords.join(', ')} | <strong>Location:</strong> {m.matched_item.location_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Ownership Modal */}
      {claimModalOpen && selectedItemForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {t('action.claim')}: {selectedItemForClaim.title}
              </h3>
              <button onClick={() => setClaimModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মালিকানার অকাট্য প্রমাণ / বিবরণ' : 'Proof of Ownership Details'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="e.g. Phone wallpaper has a family photo; back case has a tiny blue scratch; NID number ends in 9402; cash amount inside wallet was approx ৳1,200."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'রিসিপ্ট বা ছবির লিংক (ঐচ্ছিক)' : 'Receipt or Photo URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-xs">
                <strong>Safe Handover:</strong> Handover must happen at{' '}
                <span className="font-bold">{selectedItemForClaim.safe_handover_location}</span>.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  {submittingClaim ? 'Submitting...' : t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {reportType === 'lost' ? t('khunje.report_lost') : t('khunje.report_found')}
              </h3>
              <button onClick={() => setIsReportModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateReport} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lost iPhone 13 Pro in CNG auto-rickshaw"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="phone">Phone / Smartphone</option>
                    <option value="wallet_bag">Wallet / Bag</option>
                    <option value="nid_passport">NID / Passport / Document</option>
                    <option value="keys">Keys</option>
                    <option value="electronics">Electronics / Laptop</option>
                    <option value="other">Other Belonging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Identifier / Color</label>
                  <input
                    type="text"
                    value={brandIdentifier}
                    onChange={(e) => setBrandIdentifier(e.target.value)}
                    placeholder="e.g. Blue case, NID ...9402"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Route</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Farmgate to Dhanmondi 32"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Safe Handover Checkpoint</label>
                <input
                  type="text"
                  value={safeHandover}
                  onChange={(e) => setSafeHandover(e.target.value)}
                  placeholder="e.g. Tejgaon Police Thana or DU Proctor Office"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of circumstances and item features..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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
