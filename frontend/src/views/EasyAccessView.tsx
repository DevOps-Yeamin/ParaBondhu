import React, { useState, useEffect } from 'react';
import {
  Accessibility, CheckCircle, Star, MapPin, Plus,
  ShieldCheck, AlertCircle, ThumbsUp, Eye, Sparkles, Filter
} from 'lucide-react';
import { EasyAccessSpot } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapComponent, MapMarkerItem } from '../components/MapComponent';

export const EasyAccessView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [spots, setSpots] = useState<EasyAccessSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rampOnly, setRampOnly] = useState(false);
  const [liftOnly, setLiftOnly] = useState(false);
  const [toiletOnly, setToiletOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Add Spot Modal
  const [isAddSpotOpen, setIsAddSpotOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hospital');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState(user?.district || 'Dhaka');
  const [hasRamp, setHasRamp] = useState(true);
  const [hasLift, setHasLift] = useState(false);
  const [hasToilet, setHasToilet] = useState(false);
  const [hasWideDoors, setHasWideDoors] = useState(true);
  const [hasTactile, setHasTactile] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>([23.7656, 90.3888]);

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSpotForReview, setSelectedSpotForReview] = useState<EasyAccessSpot | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (rampOnly) params.has_ramp = true;
      if (liftOnly) params.has_lift = true;
      if (toiletOnly) params.has_toilet = true;
      if (search) params.search = search;

      const data = await api.getEasyAccessSpots(params);
      setSpots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, [categoryFilter, rampOnly, liftOnly, toiletOnly, search]);

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoord) return;
    try {
      await api.createEasyAccessSpot({
        title,
        category,
        address,
        district,
        latitude: selectedCoord[0],
        longitude: selectedCoord[1],
        has_wheelchair_ramp: hasRamp,
        has_lift_elevator: hasLift,
        has_accessible_toilet: hasToilet,
        has_wide_doors: hasWideDoors,
        has_tactile_paving: hasTactile,
        notes,
      });
      setIsAddSpotOpen(false);
      setTitle('');
      setAddress('');
      setNotes('');
      fetchSpots();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpotForReview) return;
    try {
      await api.addEasyAccessReview(selectedSpotForReview.id, {
        rating,
        comment,
        ramp_ok: true,
        elevator_ok: true,
        toilet_ok: true,
      });
      alert(lang === 'bn' ? 'আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!' : 'Review & verification recorded!');
      setIsReviewModalOpen(false);
      setComment('');
      fetchSpots();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const mapMarkers: MapMarkerItem[] = spots.map((s) => ({
    id: s.id,
    latitude: s.latitude,
    longitude: s.longitude,
    title: s.title,
    category: s.category,
    description: s.notes || s.address,
    type: 'easyaccess',
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold mb-2">
            <Accessibility className="w-3.5 h-3.5 text-teal-200" />
            <span>EasyAccess (সহজ এক্সেস ও অন্তর্ভুক্তিমূলক মানচিত্র)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('easyaccess.title')}
          </h1>
          <p className="text-teal-100 text-sm mt-1 max-w-2xl">
            {t('easyaccess.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert(lang === 'bn' ? 'স্থান যুক্ত করতে প্রথমে লগইন করুন' : 'Please log in to add accessible spots');
              return;
            }
            setIsAddSpotOpen(true);
          }}
          className="px-4 py-2.5 bg-white text-teal-900 font-bold rounded-xl shadow-md hover:bg-teal-50 transition-all flex items-center space-x-1.5 text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-teal-700" />
          <span>{t('easyaccess.add_spot')}</span>
        </button>
      </div>

      {/* Map View */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-600" />
            {lang === 'bn' ? 'অ্যাক্সেসিবল স্পটস মানচিত্র' : 'Accessibility Locations Map'}
          </span>
          <span className="text-slate-400">
            {spots.length} {lang === 'bn' ? 'টি যাচাইকৃত স্থান' : 'mapped locations'}
          </span>
        </div>

        <MapComponent
          markers={mapMarkers}
          height="360px"
          onLocationSelect={(lat, lng) => setSelectedCoord([lat, lng])}
          selectedCoord={selectedCoord}
        />
      </div>

      {/* Features Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 mr-1">Facilities:</span>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={rampOnly}
              onChange={(e) => setRampOnly(e.target.checked)}
              className="rounded text-teal-600"
            />
            <span>{t('easyaccess.ramp')}</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={liftOnly}
              onChange={(e) => setLiftOnly(e.target.checked)}
              className="rounded text-teal-600"
            />
            <span>{t('easyaccess.lift')}</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={toiletOnly}
              onChange={(e) => setToiletOnly(e.target.checked)}
              className="rounded text-teal-600"
            />
            <span>{t('easyaccess.toilet')}</span>
          </label>
        </div>

        <input
          type="text"
          placeholder={lang === 'bn' ? 'স্থান বা ঠিকানা খুঁজুন...' : 'Search place or address...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48"
        />
      </div>

      {/* Spots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading accessible spots...
          </div>
        ) : spots.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            No accessible locations found with these features.
          </div>
        ) : (
          spots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 capitalize">
                    {spot.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center text-amber-500 font-bold text-xs space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{spot.overall_rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {spot.title}
                </h3>

                <div className="flex items-center text-xs text-slate-500 my-1 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{spot.address} ({spot.district})</span>
                </div>

                {/* Badges for Accessibility Features */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {spot.has_wheelchair_ramp && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                      ✓ Ramp
                    </span>
                  )}
                  {spot.has_lift_elevator && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-semibold flex items-center gap-1">
                      ✓ Elevator
                    </span>
                  )}
                  {spot.has_accessible_toilet && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px] font-semibold flex items-center gap-1">
                      ✓ Toilet
                    </span>
                  )}
                  {spot.has_wide_doors && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      ✓ Wide Doors
                    </span>
                  )}
                </div>

                {spot.notes && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {spot.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {spot.verification_count} community reviews
                </span>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert(lang === 'bn' ? 'রিভিউ দিতে লগইন করুন' : 'Please log in to review');
                      return;
                    }
                    setSelectedSpotForReview(spot);
                    setIsReviewModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
                >
                  + Add Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedSpotForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Review: {selectedSpotForReview.title}
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddReview} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-2xl text-amber-400 hover:scale-110 transition-transform"
                    >
                      {star <= rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Comments / Accessibility Notes</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Ramp slope was comfortable, elevator buttons reachable."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  {t('action.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Spot Modal */}
      {isAddSpotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">{t('easyaccess.add_spot')}</h3>
              <button onClick={() => setIsAddSpotOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSpot} className="p-6 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bangladesh Eye Hospital"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="hospital">Hospital & Clinic</option>
                    <option value="public_transport">Metro / Bus Station</option>
                    <option value="shopping_mall">Shopping Mall</option>
                    <option value="government_office">Government Center</option>
                    <option value="park">Park & Recreation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Road 27, Dhanmondi, Dhaka"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Available Features</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasRamp}
                      onChange={(e) => setHasRamp(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Wheelchair Ramp</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasLift}
                      onChange={(e) => setHasLift(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Lift / Elevator</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasToilet}
                      onChange={(e) => setHasToilet(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Accessible Toilet</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasWideDoors}
                      onChange={(e) => setHasWideDoors(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <span>Wide Entrances</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Helpful Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specific entrance details, gate number, parking notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSpotOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
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
