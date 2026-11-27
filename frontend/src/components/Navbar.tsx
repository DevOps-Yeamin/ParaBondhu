import React, { useState } from 'react';
import {
  Car, Users, Search, Clock, Accessibility, Globe2,
  Briefcase, Bell, Menu, X, ShieldCheck, LogIn, LogOut,
  User as UserIcon, Sparkles, MapPin, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, toast, clearToast } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'traffic', label: t('nav.traffic'), icon: Car, color: 'text-amber-500' },
    { id: 'neighbor', label: t('nav.neighbor'), icon: Users, color: 'text-emerald-600' },
    { id: 'khunje', label: t('nav.khunje'), icon: Search, color: 'text-blue-600' },
    { id: 'lineless', label: t('nav.lineless'), icon: Clock, color: 'text-purple-600' },
    { id: 'easyaccess', label: t('nav.easyaccess'), icon: Accessibility, color: 'text-teal-600' },
    { id: 'probashi', label: t('nav.probashi'), icon: Globe2, color: 'text-sky-600' },
    { id: 'workhub', label: t('nav.workhub'), icon: Briefcase, color: 'text-indigo-600' },
  ];

  return (
    <>
      {/* Real-time Toast Banner */}
      {toast && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-50 text-sm">
          <div className="flex items-center space-x-2 container mx-auto">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">{toast.title}</span>
            <span className="text-emerald-200 hidden md:inline">— {toast.message}</span>
          </div>
          <button
            onClick={clearToast}
            className="text-emerald-300 hover:text-white font-bold ml-4 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setCurrentTab('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black tracking-tight">প</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-0.5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-bold text-slate-900 tracking-tight">
                    {lang === 'bn' ? 'পাড়াবন্ধু' : 'ParaBondhu'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    BD MVP
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {lang === 'bn' ? 'কমিউনিটি ও সুযোগ প্ল্যাটফর্ম' : 'Community & Opportunity'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Language, Notifications, Auth */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Language Switcher */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setLang('bn')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    lang === 'bn'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    lang === 'en'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">
                        {t('nav.notifications')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {unreadCount} new
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-xs">
                          {lang === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No notifications yet'}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link_url) {
                                const tab = n.link_url.replace('/', '');
                                if (tab) setCurrentTab(tab);
                              }
                              setNotifDropdownOpen(false);
                            }}
                            className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors text-xs ${
                              !n.is_read ? 'bg-emerald-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="font-semibold">{n.title}</span>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                            </div>
                            <p className="text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Authentication Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.full_name}`}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full border border-emerald-400 object-cover"
                    />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.full_name}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium flex items-center">
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        {user.reputation_score} pts
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-600">
                          <MapPin className="w-3 h-3" />
                          <span>{user.thana}, {user.district}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentTab('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t('nav.dashboard')}</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                  >
                    {t('nav.register')}
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Slide-down */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};
