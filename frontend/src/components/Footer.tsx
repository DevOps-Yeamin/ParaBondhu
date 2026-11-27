import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                প
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {lang === 'bn' ? 'পাড়াবন্ধু' : 'ParaBondhu'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t('app.subtitle')}
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bangladesh First • Safe Community Standard</span>
            </div>
          </div>

          {/* Col 2: Modules */}
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-3">
              Modules (সমন্বিত সেবা)
            </span>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => setCurrentTab('traffic')} className="hover:text-emerald-400 transition-colors">TrafficAlert</button></li>
              <li><button onClick={() => setCurrentTab('neighbor')} className="hover:text-emerald-400 transition-colors">NeighborShare</button></li>
              <li><button onClick={() => setCurrentTab('khunje')} className="hover:text-emerald-400 transition-colors">KhunjeDao</button></li>
              <li><button onClick={() => setCurrentTab('lineless')} className="hover:text-emerald-400 transition-colors">LineLess Queue</button></li>
              <li><button onClick={() => setCurrentTab('easyaccess')} className="hover:text-emerald-400 transition-colors">EasyAccess Map</button></li>
              <li><button onClick={() => setCurrentTab('probashi')} className="hover:text-emerald-400 transition-colors">ProbashiConnect</button></li>
              <li><button onClick={() => setCurrentTab('workhub')} className="hover:text-emerald-400 transition-colors">Skill & Work Hub</button></li>
            </ul>
          </div>

          {/* Col 3: Bangladesh Emergency Numbers */}
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-3">
              Emergency Hotlines (জরুরি সেবা)
            </span>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                <span>National Emergency Service: <strong>999</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Probashi Kalyan Helpline: <strong>16135</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Disaster Warning (DMC): <strong>1090</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Child & Women Support: <strong>109</strong></span>
              </li>
            </ul>
          </div>

          {/* Col 4: National Divisions Covered */}
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-3">
              Divisions (বিভাগসমূহ)
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Dhaka (ঢাকা)', 'Chattogram (চট্টগ্রাম)', 'Sylhet (সিলেট)', 'Rajshahi (রাজশাহী)', 'Khulna (খুলনা)', 'Barishal (বরিশাল)', 'Rangpur (রংপুর)', 'Mymensingh (ময়মনসিংহ)'].map((div) => (
                <span key={div} className="px-2 py-1 bg-slate-800 rounded text-slate-300">
                  {div}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 ParaBondhu (পাড়াবন্ধু). All Rights Reserved. Built for Bangladesh.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for community impact
          </p>
        </div>
      </div>
    </footer>
  );
};
