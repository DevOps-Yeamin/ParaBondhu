import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Platform brand & tagline
    'app.name': 'পাড়াবন্ধু',
    'app.tagline': 'বাংলাদেশের প্রথম কমিউনিটি ও সুযোগ প্ল্যাটফর্ম',
    'app.subtitle': 'প্রতিদিনের জীবনকে সহজ, নিরাপদ ও সম্ভাবনাময় করতে আপনার পাশের মানুষ ও সুযোগের সাথে যুক্ত হোন।',

    // Nav & Shared
    'nav.home': 'হোম',
    'nav.traffic': 'ট্রাফিক অ্যালার্ট',
    'nav.neighbor': 'পাড়া শেয়ার',
    'nav.khunje': 'খুঁজে দাও',
    'nav.lineless': 'লাইনলেস',
    'nav.easyaccess': 'সহজ এক্সেস',
    'nav.probashi': 'প্রবাসী কানেক্ট',
    'nav.workhub': 'স্কিল ও কর্ম হাব',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.login': 'লগইন',
    'nav.register': 'রেজিস্ট্রেশন',
    'nav.logout': 'লগআউট',
    'nav.profile': 'প্রোফাইল',
    'nav.notifications': 'নোটিফিকেশন',
    'nav.search': 'অনুসন্ধান...',
    'nav.filter': 'ফিল্টার',
    'nav.all_districts': 'সকল জেলা',

    // Common Actions & Badges
    'action.submit': 'জমা দিন',
    'action.cancel': 'বাতিল',
    'action.close': 'বন্ধ করুন',
    'action.save': 'সংরক্ষণ করুন',
    'action.apply': 'আবেদন করুন',
    'action.view_details': 'বিস্তারিত দেখুন',
    'action.verify': 'যাচাই করুন',
    'action.upvote': 'সঠিক',
    'action.downvote': 'ভুল',
    'action.claim': 'দাবি করুন',
    'action.borrow': 'ধার নিন',
    'action.share_item': 'আইটেম যোগ করুন',
    'action.take_token': 'ডিজিটাল টোকেন নিন',
    'action.call_next': 'পরবর্তী টোকেন ডাকুন',
    'action.volunteer': 'সাহায্যের হাত বাড়ান',
    'action.check_matches': 'সম্ভাব্য মিল খুঁজুন',

    'badge.official': 'অফিসিয়াল তথ্য',
    'badge.community': 'কমিউনিটি রিপোর্ট',
    'badge.demo_seed': 'ডেমো নমুনা ডেটা',
    'badge.verified_partner': 'যাচাইকৃত পার্টনার',
    'badge.bmet_approved': 'বিএমইটি অনুমোদিত',
    'badge.active': 'চলমান',
    'badge.resolved': 'সমাধানকৃত',
    'badge.available': 'উপলব্ধ',
    'badge.lent': 'ধার দেওয়া হয়েছে',

    // Traffic
    'traffic.title': 'লাইভ ট্রাফিক ও সড়ক পরিস্থিতি',
    'traffic.subtitle': 'যানজট, দুর্ঘটনা, রাস্তা বন্ধ ও জলাবদ্ধতার নির্ভরযোগ্য কমিউনিটি ও অফিসিয়াল আপডেট।',
    'traffic.report_now': 'ট্রাফিক রিপোর্ট দিন',
    'traffic.official_only': 'শুধুমাত্র সরকারি/অফিসিয়াল সতর্কতা',
    'traffic.waterlogging': 'জলাবদ্ধতা',
    'traffic.accident': 'দুর্ঘটনা',
    'traffic.congestion': 'তীব্র যানজট',
    'traffic.road_closure': 'রাস্তা বন্ধ',
    'traffic.construction': 'উন্নয়ন কাজ',
    'traffic.alt_route': 'বিকল্প পথ পরামর্শ',

    // NeighborShare
    'neighbor.title': 'প্রতিবেশী শেয়ার ও সহায়তা',
    'neighbor.subtitle': 'দরকারী ড্রিল মেশিন, নেবুলাইজার, বই বা হুইলচেয়ার ধার নিন ও প্রতিবেশীকে সহায়তা করুন।',
    'neighbor.items_tab': 'ধার দেওয়ার আইটেমসমূহ',
    'neighbor.assistance_tab': 'প্রতিবেশী পারস্পরিক সহায়তা',
    'neighbor.post_assistance': 'সহায়তার অনুরোধ পোস্ট করুন',
    'neighbor.tools': 'টুলস ও যন্ত্রপাতি',
    'neighbor.medical': 'চিকিৎসা সরঞ্জাম',
    'neighbor.kitchen': 'রান্নাঘরের জিনিস',
    'neighbor.books': 'বই ও পাঠ্যসামগ্রী',
    'neighbor.free_borrow': 'সম্পূর্ণ বিনামূল্যে',
    'neighbor.deposit_required': 'নিরাপত্তা জামানত প্রযোজ্য',

    // KhunjeDao
    'khunje.title': 'খুঁজে দাও (হারানো ও প্রাপ্তি)',
    'khunje.subtitle': 'মোবাইল, ব্যাগ, এনআইডি বা চাবি হারিয়ে গেলে রিপোর্ট করুন, নিরাপদ হ্যান্ডওভারে উদ্ধার করুন।',
    'khunje.report_lost': 'হারিয়ে গেছে রিপোর্ট করুন',
    'khunje.report_found': 'কুড়িয়ে পেয়েছি রিপোর্ট করুন',
    'khunje.tab_all': 'সকল তালিকা',
    'khunje.tab_lost': 'হারিয়ে গেছে',
    'khunje.tab_found': 'পাওয়া গেছে',
    'khunje.smart_match': 'স্মার্ট ম্যাচ অ্যালগরিদম',
    'khunje.safe_handover': 'নিরাপদ হ্যান্ডওভার বুথ (থানা / প্রক্টর অফিস)',

    // LineLess
    'lineless.title': 'লাইনলেস: ভার্চুয়াল কিউ ও টোকেন',
    'lineless.subtitle': 'হাসপাতাল, ব্যাংক ও পাসপোর্ট অফিসে দীর্ঘ লাইনে দাঁড়িয়ে সময় নষ্ট না করে ডিজিটাল টোকেন নিন।',
    'lineless.current_token': 'বর্তমান টোকেন চলছে',
    'lineless.your_token': 'আপনার টোকেন',
    'lineless.estimated_wait': 'আনুমানিক অপেক্ষার সময়',
    'lineless.desk_dashboard': 'কাউন্টার / বুথ কন্ট্রোল ড্যাশবোর্ড',

    // EasyAccess
    'easyaccess.title': 'সহজ এক্সেস: প্রতিবন্ধীবান্ধব মানচিত্র',
    'easyaccess.subtitle': 'হুইলচেয়ার ব্যবহারকারী, প্রবীণ ও বিশেষ চাহিদাসম্পন্ন নাগরিকদের জন্য র‍্যাম্প, লিফট ও সুবিধাযুক্ত স্থান।',
    'easyaccess.ramp': 'হুইলচেয়ার র‍্যাম্প',
    'easyaccess.lift': 'লিফট / এলিভেটর',
    'easyaccess.toilet': 'এক্সেসিবল টয়লেট',
    'easyaccess.doors': 'প্রশস্ত দরজা',
    'easyaccess.tactile': 'ট্যাকটাইল পেভিং',
    'easyaccess.parking': 'সংরক্ষিত পার্কিং',
    'easyaccess.add_spot': 'নতুন সুবিধাযুক্ত স্থান যোগ করুন',

    // ProbashiConnect
    'probashi.title': 'প্রবাসী কানেক্ট: নিরাপদ অভিবাসন ও সুযোগ',
    'probashi.subtitle': 'বিএমইটি অনুমোদিত বিদেশি কর্মসংস্থান, নিরাপদ মাইগ্রেশন গাইডলাইন ও জরুরি সাহায্য।',
    'probashi.disclaimer': 'সতর্কতা: কোনো দালাল বা মধ্যস্বত্বভোগীকে নগদ টাকা দেবেন না। বিএমইটি স্মার্ট কার্ড ছাড়া বিদেশে যাওয়া আইনত দণ্ডনীয়। কোনো চাকরির শতভাগ গ্যারান্টি দেওয়া হয় না।',
    'probashi.verified_jobs': 'যাচাইকৃত বিদেশি চাকরির বিজ্ঞপ্তি',
    'probashi.guides': 'দেশভিত্তিক নিয়ম ও দূতাবাসের হটলাইন',
    'probashi.cost_ceiling': 'সরকারি অভিবাসন খরচ নির্দেশিকা',

    // Skill & Work Hub
    'workhub.title': 'স্কিল ও কর্মসংস্থান হাব',
    'workhub.subtitle': 'ভাষা শিক্ষা, কারিগরি দক্ষতা, ফ্রিল্যান্সিং কোর্স এবং স্থানীয় ও রিমোট চাকরির খোঁজ।',
    'workhub.tab_jobs': 'চাকরি ও ফ্রিল্যান্স প্রজেক্ট',
    'workhub.tab_courses': 'দক্ষতা উন্নয়ন কোর্স',
    'workhub.post_job': 'নতুন চাকরির নিয়োগ দিন',
    'workhub.cv_tips': 'আকর্ষণীয় সিভি তৈরির নির্দেশিকা',

    // Admin & Metrics
    'stats.citizens': 'সক্রিয় নাগরিক',
    'stats.traffic': 'দৈনিক ট্রাফিক রিপোর্ট',
    'stats.loans': 'কমিউনিটি ঋণ সহায়তা',
    'stats.reunited': 'উদ্ধারকৃত হারানো জিনিস',
    'stats.tokens': 'লাইনে সময় বাঁচানো টোকেন',
    'stats.spots': 'প্রতিবন্ধীবান্ধব স্থান',
  },
  en: {
    'app.name': 'ParaBondhu',
    'app.tagline': 'Bangladesh-First Community & Opportunity Platform',
    'app.subtitle': 'Empowering daily life with local community trust, real-time alerts, and verified opportunities across Bangladesh and diaspora.',

    'nav.home': 'Home',
    'nav.traffic': 'TrafficAlert',
    'nav.neighbor': 'NeighborShare',
    'nav.khunje': 'KhunjeDao',
    'nav.lineless': 'LineLess',
    'nav.easyaccess': 'EasyAccess',
    'nav.probashi': 'ProbashiConnect',
    'nav.workhub': 'Skill & Work Hub',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log In',
    'nav.register': 'Register',
    'nav.logout': 'Log Out',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.search': 'Search...',
    'nav.filter': 'Filter',
    'nav.all_districts': 'All Districts',

    'action.submit': 'Submit',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.save': 'Save',
    'action.apply': 'Apply Now',
    'action.view_details': 'View Details',
    'action.verify': 'Verify',
    'action.upvote': 'Accurate',
    'action.downvote': 'Inaccurate',
    'action.claim': 'Claim Ownership',
    'action.borrow': 'Borrow Item',
    'action.share_item': 'List Item to Share',
    'action.take_token': 'Get Digital Token',
    'action.call_next': 'Call Next Token',
    'action.volunteer': 'Volunteer Help',
    'action.check_matches': 'Check Possible Matches',

    'badge.official': 'Official Authority Feed',
    'badge.community': 'Community Report',
    'badge.demo_seed': 'Demo Seed Data',
    'badge.verified_partner': 'Verified Partner',
    'badge.bmet_approved': 'BMET Approved',
    'badge.active': 'Active',
    'badge.resolved': 'Resolved',
    'badge.available': 'Available',
    'badge.lent': 'Lent Out',

    'traffic.title': 'Live Traffic & Road Alerts',
    'traffic.subtitle': 'Reliable community-powered and official alerts on congestion, waterlogging, accidents and road works.',
    'traffic.report_now': 'Report Traffic Incident',
    'traffic.official_only': 'Official Authority Alerts Only',
    'traffic.waterlogging': 'Waterlogging',
    'traffic.accident': 'Accident',
    'traffic.congestion': 'Heavy Congestion',
    'traffic.road_closure': 'Road Closure',
    'traffic.construction': 'Construction Work',
    'traffic.alt_route': 'Suggested Alternative Route',

    'neighbor.title': 'NeighborShare & Mutual Aid',
    'neighbor.subtitle': 'Borrow tools, medical gear, kitchen appliances, and support elderly neighbors with mutual assistance.',
    'neighbor.items_tab': 'Items Available to Borrow',
    'neighbor.assistance_tab': 'Neighborhood Mutual Aid Requests',
    'neighbor.post_assistance': 'Request Neighborhood Assistance',
    'neighbor.tools': 'Tools & Equipment',
    'neighbor.medical': 'Medical Equipment',
    'neighbor.kitchen': 'Kitchen Appliances',
    'neighbor.books': 'Books & Learning',
    'neighbor.free_borrow': 'Free Lending',
    'neighbor.deposit_required': 'Deposit Required',

    'khunje.title': 'KhunjeDao (Lost & Found)',
    'khunje.subtitle': 'Report lost or found phones, bags, NIDs and keys. Verify ownership and handover safely at police boxes.',
    'khunje.report_lost': 'Report Lost Belonging',
    'khunje.report_found': 'Report Found Item',
    'khunje.tab_all': 'All Items',
    'khunje.tab_lost': 'Lost Items',
    'khunje.tab_found': 'Found Items',
    'khunje.smart_match': 'Smart Match Algorithm',
    'khunje.safe_handover': 'Safe Handover Hub (Police Station / Campus)',

    'lineless.title': 'LineLess: Virtual Queue & Token Manager',
    'lineless.subtitle': 'Skip physical crowds at hospitals, banks and passport centers by taking digital tokens with live wait estimates.',
    'lineless.current_token': 'Now Serving Token',
    'lineless.your_token': 'Your Token',
    'lineless.estimated_wait': 'Estimated Wait Time',
    'lineless.desk_dashboard': 'Counter Desk Dashboard',

    'easyaccess.title': 'EasyAccess: Mobility & Inclusion Map',
    'easyaccess.subtitle': 'Map and verify places with wheelchair ramps, elevators, accessible toilets and step-free entrances across Bangladesh.',
    'easyaccess.ramp': 'Wheelchair Ramp',
    'easyaccess.lift': 'Elevator / Lift',
    'easyaccess.toilet': 'Accessible Toilet',
    'easyaccess.doors': 'Wide Doors',
    'easyaccess.tactile': 'Tactile Paving',
    'easyaccess.parking': 'Accessible Parking',
    'easyaccess.add_spot': 'Add Accessible Spot',

    'probashi.title': 'ProbashiConnect: Safe Migration & Opportunities',
    'probashi.subtitle': 'BMET-verified overseas job vacancies, migration expense guidelines, anti-fraud warnings and embassy hotlines.',
    'probashi.disclaimer': 'Notice: Never pay cash to middlemen (dalals). Overseas travel without a BMET Smart Card is illegal. No employment or visa outcome is guaranteed.',
    'probashi.verified_jobs': 'Verified Overseas Vacancies',
    'probashi.guides': 'Country Laws & Embassy Hotlines',
    'probashi.cost_ceiling': 'Official Cost Guidelines',

    'workhub.title': 'Skill & Work Hub',
    'workhub.subtitle': 'Accredited vocational and digital courses, local and remote job vacancies, and freelance project opportunities.',
    'workhub.tab_jobs': 'Jobs & Freelance Gigs',
    'workhub.tab_courses': 'Skill Training Courses',
    'workhub.post_job': 'Post Job Opening',
    'workhub.cv_tips': 'Professional CV Guidelines',

    'stats.citizens': 'Active Citizens',
    'stats.traffic': 'Traffic Reports Today',
    'stats.loans': 'Community Loans',
    'stats.reunited': 'Belongings Reunited',
    'stats.tokens': 'LineLess Tokens Served',
    'stats.spots': 'Accessible Places Mapped',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  t: () => '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('parabondhu_lang') as Language) || 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('parabondhu_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
