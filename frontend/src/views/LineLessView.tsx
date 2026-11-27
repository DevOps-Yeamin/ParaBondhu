import React, { useState, useEffect } from 'react';
import {
  Clock, Building2, UserCheck, CheckCircle2, Ticket,
  Hourglass, Users, Phone, MapPin, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { LineLessProvider, LineLessQueue, LineLessToken } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const LineLessView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [providers, setProviders] = useState<LineLessProvider[]>([]);
  const [myTokens, setMyTokens] = useState<LineLessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Take token modal
  const [isTakeTokenOpen, setIsTakeTokenOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<{ queue: LineLessQueue; provider: LineLessProvider } | null>(null);
  const [tokenNotes, setTokenNotes] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);

  // Active called ticket highlight
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<LineLessToken | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = categoryFilter !== 'all' ? { category: categoryFilter } : undefined;
      const data = await api.getLineLessProviders(params);
      setProviders(data);

      if (isAuthenticated) {
        const tokens = await api.getMyTokens();
        setMyTokens(tokens);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, isAuthenticated]);

  const handleTakeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueue) return;
    setSubmittingToken(true);
    try {
      const token = await api.takeDigitalToken({
        queue_id: selectedQueue.queue.id,
        notes: tokenNotes,
      });
      setNewlyCreatedToken(token);
      setIsTakeTokenOpen(false);
      setTokenNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingToken(false);
    }
  };

  const handleCallNext = async (queueId: number) => {
    try {
      const res = await api.callNextToken(queueId);
      alert(res.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5 text-purple-200" />
            <span>LineLess (ডিজিটাল কিউ ও ভার্চুয়াল টোকেন)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('lineless.title')}
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-2xl">
            {t('lineless.subtitle')}
          </p>
        </div>
      </div>

      {/* Active Token Banner for Citizen if present */}
      {myTokens.length > 0 && myTokens.some((t) => t.status === 'waiting' || t.status === 'called') && (
        <div className="bg-emerald-900 text-white rounded-2xl p-5 border border-emerald-700 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                {lang === 'bn' ? 'আপনার সক্রিয় ডিজিটাল টোকেন' : 'Your Active Digital Token'}
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-black text-white bg-emerald-800/80 px-3 py-1 rounded-xl border border-emerald-600">
                  {myTokens[0].token_code}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-emerald-100">{myTokens[0].provider_name}</h3>
                  <p className="text-xs text-emerald-200">{myTokens[0].queue_name}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-300 block">
                {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status'}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-1 ${
                myTokens[0].status === 'called' ? 'bg-amber-400 text-slate-900 animate-bounce' : 'bg-emerald-600 text-white'
              }`}>
                {myTokens[0].status === 'called' ? 'NOW CALLED! GO TO COUNTER' : 'WAITING IN QUEUE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Category */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Centers' },
            { id: 'hospital', label: 'Hospitals & Clinics' },
            { id: 'bank', label: 'Banks & Financial' },
            { id: 'government_service', label: 'Passport & Gov Offices' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                categoryFilter === cat.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-slate-400 text-xs">
          {providers.length} {lang === 'bn' ? 'টি সেবাকেন্দ্র সংযুক্ত' : 'participating service centers'}
        </span>
      </div>

      {/* Providers & Queues List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading queues...
          </div>
        ) : providers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            No service centers found.
          </div>
        ) : (
          providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 capitalize">
                    {p.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {p.opening_time} - {p.closing_time}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">
                  {p.name}
                </h3>

                <div className="flex items-center text-xs text-slate-500 my-1 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.address} ({p.district})</span>
                </div>

                <div className="mt-4 space-y-3">
                  <span className="text-xs font-semibold text-slate-700 block">
                    {lang === 'bn' ? 'সক্রিয় কাউন্টার ও কিউসমূহ:' : 'Active Counters & Live Queues:'}
                  </span>

                  {p.queues.map((q) => {
                    const waitingCount = Math.max(0, q.next_token_number - q.current_token_number - 1);
                    const estimatedWaitMins = waitingCount * q.estimated_wait_per_token_mins;

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{q.name}</div>
                          <div className="flex items-center space-x-3 text-slate-500 mt-1">
                            <span>Serving: <strong className="text-purple-700 font-bold">#{q.current_token_number}</strong></span>
                            <span>•</span>
                            <span>Waiting: <strong>{waitingCount} citizens</strong></span>
                            <span>•</span>
                            <span>Est. Wait: <strong>~{estimatedWaitMins} mins</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              if (!isAuthenticated) {
                                alert(lang === 'bn' ? 'টোকেন নিতে প্রথমে লগইন করুন' : 'Please log in to take a digital token');
                                return;
                              }
                              setSelectedQueue({ queue: q, provider: p });
                              setIsTakeTokenOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>{t('action.take_token')}</span>
                          </button>

                          {/* Desk Operator Call Next Button */}
                          <button
                            onClick={() => handleCallNext(q.id)}
                            title="Desk Operator action: Call next citizen"
                            className="px-2 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors"
                          >
                            Call Next
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Avg service speed: ~{p.avg_service_time_mins} min / citizen</span>
                <span>Total served today: {p.total_served_today}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Take Token Modal */}
      {isTakeTokenOpen && selectedQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t('action.take_token')}
                </h3>
                <p className="text-xs text-slate-500">{selectedQueue.provider.name}</p>
              </div>
              <button onClick={() => setIsTakeTokenOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleTakeToken} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1">
                <span className="font-bold text-sm block">{selectedQueue.queue.name}</span>
                <p>
                  You will be assigned Token #
                  <strong className="text-purple-700 font-bold">{selectedQueue.queue.next_token_number}</strong>
                </p>
                <p className="text-purple-700">
                  Estimated wait:{' '}
                  <strong>
                    ~{Math.max(0, selectedQueue.queue.next_token_number - selectedQueue.queue.current_token_number - 1) * selectedQueue.queue.estimated_wait_per_token_mins}{' '}
                    minutes
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সার্ভিস নোট (ঐচ্ছিক)' : 'Service Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={tokenNotes}
                  onChange={(e) => setTokenNotes(e.target.value)}
                  placeholder="e.g. Senior citizen consultation, cash deposit"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTakeTokenOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingToken}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  {submittingToken ? 'Generating Token...' : 'Confirm & Get Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
