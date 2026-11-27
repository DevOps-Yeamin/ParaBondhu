import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { TrafficAlertView } from './views/TrafficAlertView';
import { NeighborShareView } from './views/NeighborShareView';
import { KhunjeDaoView } from './views/KhunjeDaoView';
import { LineLessView } from './views/LineLessView';
import { EasyAccessView } from './views/EasyAccessView';
import { ProbashiConnectView } from './views/ProbashiConnectView';
import { WorkHubView } from './views/WorkHubView';
import { DashboardView } from './views/DashboardView';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const renderView = () => {
    switch (currentTab) {
      case 'traffic':
        return <TrafficAlertView />;
      case 'neighbor':
        return <NeighborShareView />;
      case 'khunje':
        return <KhunjeDaoView />;
      case 'lineless':
        return <LineLessView />;
      case 'easyaccess':
        return <EasyAccessView />;
      case 'probashi':
        return <ProbashiConnectView />;
      case 'workhub':
        return <WorkHubView />;
      case 'dashboard':
        return <DashboardView />;
      case 'home':
      default:
        return (
          <HomeView
            setCurrentTab={setCurrentTab}
            openAuthModal={openAuthModal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={openAuthModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {renderView()}
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
