import React, { useState, useEffect } from 'react';
import {
  Users, Wrench, HeartHandshake, Shield, Sparkles, Plus,
  MapPin, CheckCircle, Clock, Calendar, AlertCircle, Search
} from 'lucide-react';
import { NeighborItem, NeighborAssistance } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const NeighborShareView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'items' | 'assistance'>('items');
  const [items, setItems] = useState<NeighborItem[]>([]);
  const [assistances, setAssistances] = useState<NeighborAssistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<NeighborItem | null>(null);
  const [borrowDays, setBorrowDays] = useState(3);
  const [borrowNotes, setBorrowNotes] = useState('');

  const [isAddAssistanceOpen, setIsAddAssistanceOpen] = useState(false);

  // Add Item form states
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCat, setItemCat] = useState('tools');
  const [itemCond, setItemCond] = useState('good');
  const [itemDeposit, setItemDeposit] = useState('0');
  const [itemMaxDays, setItemMaxDays] = useState('7');
  const [itemLoc, setItemLoc] = useState('');
  const [itemImg, setItemImg] = useState('');

  // Add Assistance form states
  const [asTitle, setAsTitle] = useState('');
  const [asDesc, setAsDesc] = useState('');
  const [asCat, setAsCat] = useState('general');
  const [asUrgency, setAsUrgency] = useState('normal');
  const [asLoc, setAsLoc] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'items') {
        const data = await api.getNeighborItems({
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: search || undefined,
        });
        setItems(data);
      } else {
        const data = await api.getNeighborAssistance();
        setAssistances(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, categoryFilter, search]);

  const handleBorrowRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowItem) return;
    try {
      await api.requestNeighborLoan({
        item_id: selectedBorrowItem.id,
        requested_days: borrowDays,
        notes: borrowNotes,
      });
      alert(lang === 'bn' ? 'ধার নেওয়ার অনুরোধ পাঠানো হয়েছে!' : 'Borrow request submitted successfully!');
      setIsBorrowModalOpen(false);
      setBorrowNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVolunteer = async (reqId: number) => {
    if (!isAuthenticated) {
      alert(lang === 'bn' ? 'সাহায্য করতে প্রথমে লগইন করুন' : 'Please log in to volunteer');
      return;
    }
    try {
      await api.volunteerForAssistance(reqId);
      alert(lang === 'bn' ? 'আপনি সহায়তার জন্য যুক্ত হয়েছেন!' : 'You have stepped up to help! Check notifications.');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNeighborItem({
        title: itemTitle,
        description: itemDesc,
        category: itemCat,
        condition: itemCond,
        deposit_amount: parseFloat(itemDeposit) || 0,
        max_days: parseInt(itemMaxDays) || 7,
        location_name: itemLoc,
        district: user?.district || 'Dhaka',
        image_url: itemImg || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
      });
      setIsAddItemOpen(false);
      setItemTitle('');
      setItemDesc('');
      setItemLoc('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNeighborAssistance({
        title: asTitle,
        description: asDesc,
        category: asCat,
        urgency: asUrgency,
        location_name: asLoc,
        district: user?.district || 'Dhaka',
      });
      setIsAddAssistanceOpen(false);
      setAsTitle('');
      setAsDesc('');
      setAsLoc('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-200" />
            <span>NeighborShare (পাড়া শেয়ার ও পারস্পরিক সহায়তা)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('neighbor.title')}
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            {t('neighbor.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'items' ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert(lang === 'bn' ? 'আইটেম যুক্ত করতে লগইন করুন' : 'Please log in to list items');
                  return;
                }
                setIsAddItemOpen(true);
              }}
              className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-1.5 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{t('action.share_item')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert(lang === 'bn' ? 'অনুরোধ জানাতে লগইন করুন' : 'Please log in to request assistance');
                  return;
                }
                setIsAddAssistanceOpen(true);
              }}
              className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-1.5 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{t('neighbor.post_assistance')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{t('neighbor.items_tab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('assistance')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'assistance'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{t('neighbor.assistance_tab')}</span>
        </button>
      </div>

      {/* Items Section */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'tools', 'medical', 'kitchen', 'books', 'electronics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? (lang === 'bn' ? 'সকল' : 'All') : cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'আইটেম খুঁজুন...' : 'Search items...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-xs w-48"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                Loading neighborhood items...
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                {lang === 'bn' ? 'কোনো আইটেম পাওয়া যায়নি।' : 'No items listed in this category.'}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {item.image_url && (
                      <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-emerald-800 shadow-xs">
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="capitalize font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span>Max {item.max_days} days</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center text-xs text-slate-500 space-x-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location_name} ({item.district})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'মালিক' : 'Owner'}</span>
                        <span className="font-semibold text-slate-700">{item.owner_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'জামানত' : 'Deposit'}</span>
                        <span className="font-bold text-emerald-700">
                          {item.deposit_amount > 0 ? `৳${item.deposit_amount}` : t('neighbor.free_borrow')}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={item.status !== 'available'}
                      onClick={() => {
                        if (!isAuthenticated) {
                          alert(lang === 'bn' ? 'ধার নিতে প্রথমে লগইন করুন' : 'Please log in to borrow items');
                          return;
                        }
                        setSelectedBorrowItem(item);
                        setIsBorrowModalOpen(true);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {item.status === 'available' ? t('action.borrow') : 'Currently Lent'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assistance / Mutual Aid Section */}
      {activeTab === 'assistance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              Loading requests...
            </div>
          ) : assistances.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
              {lang === 'bn' ? 'কোনো সহায়তার অনুরোধ নেই।' : 'No active assistance requests.'}
            </div>
          ) : (
            assistances.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 capitalize">
                      {req.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      req.urgency === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {req.description}
                  </p>

                  <div className="flex items-center text-xs text-slate-500 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.location_name} ({req.district})</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {lang === 'bn' ? 'অনুরোধকারী: ' : 'From: '}
                    <strong className="text-slate-700">{req.author_name}</strong>
                  </span>

                  {req.status === 'open' ? (
                    <button
                      onClick={() => handleVolunteer(req.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      {t('action.volunteer')}
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 font-semibold text-xs">
                      Helper Connected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Borrow Modal */}
      {isBorrowModalOpen && selectedBorrowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {t('action.borrow')}: {selectedBorrowItem.title}
              </h3>
              <button onClick={() => setIsBorrowModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleBorrowRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'কতদিনের জন্য প্রয়োজন?' : 'Duration (Days)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedBorrowItem.max_days}
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Max allowed: {selectedBorrowItem.max_days} days
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মালিকের জন্য কোনো বার্তা / নোট' : 'Message to Owner'}
                </label>
                <textarea
                  rows={2}
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  placeholder="e.g. Need for hanging paintings on Saturday afternoon."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
                <span className="font-semibold block mb-0.5">Trust & Return Guarantee</span>
                <p className="text-[11px] text-emerald-950">
                  Returning items promptly and in good condition boosts your ParaBondhu Reputation score!
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  {t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {t('action.share_item')}
              </h3>
              <button onClick={() => setIsAddItemOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Electric Rotary Lawn Mower"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={itemCat}
                    onChange={(e) => setItemCat(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="tools">Tools (যন্ত্রপাতি)</option>
                    <option value="medical">Medical (চিকিৎসা সরঞ্জাম)</option>
                    <option value="kitchen">Kitchen (রান্নাঘর)</option>
                    <option value="books">Books (বই)</option>
                    <option value="electronics">Electronics (ইলেকট্রনিক্স)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={itemCond}
                    onChange={(e) => setItemCond(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good Condition</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit (৳ BDT)</label>
                  <input
                    type="number"
                    value={itemDeposit}
                    onChange={(e) => setItemDeposit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Borrow Days</label>
                  <input
                    type="number"
                    value={itemMaxDays}
                    onChange={(e) => setItemMaxDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Road</label>
                <input
                  type="text"
                  required
                  value={itemLoc}
                  onChange={(e) => setItemLoc(e.target.value)}
                  placeholder="e.g. Dhanmondi 27 / Road 16"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Details, safety instructions, included parts..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={itemImg}
                  onChange={(e) => setItemImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  {t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assistance Modal */}
      {isAddAssistanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {t('neighbor.post_assistance')}
              </h3>
              <button onClick={() => setIsAddAssistanceOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAssistance} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Need / Request Title</label>
                <input
                  type="text"
                  required
                  value={asTitle}
                  onChange={(e) => setAsTitle(e.target.value)}
                  placeholder="e.g. Urgent prescription medicine pickup"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={asCat}
                    onChange={(e) => setAsCat(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="elderly_support">Elderly Support</option>
                    <option value="emergency_ride">Emergency Ride / Jumper</option>
                    <option value="grocery_run">Grocery / Medicine</option>
                    <option value="tutor">Study Help</option>
                    <option value="general">General Neighbor Help</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={asUrgency}
                    onChange={(e) => setAsUrgency(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Location</label>
                <input
                  type="text"
                  required
                  value={asLoc}
                  onChange={(e) => setAsLoc(e.target.value)}
                  placeholder="e.g. Uttara Sector 3"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  required
                  rows={2}
                  value={asDesc}
                  onChange={(e) => setAsDesc(e.target.value)}
                  placeholder="Explain what help is needed..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssistanceOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
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
