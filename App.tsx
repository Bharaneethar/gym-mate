
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import Workout from './components/Workout';
import Diet from './components/Diet';
import Progress from './components/Progress';
import Profile from './components/Profile';
import Goals from './components/Goals';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { checkSession, logoutUser } from './services/api';

export type AppView = 'Dashboard' | 'Workout' | 'Diet' | 'Goals' | 'Progress' | 'Profile';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [view, setView] = useState<AppView>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const sessionValid = await checkSession();
      setIsAuthenticated(sessionValid);
      setIsLoadingSession(false);
    };
    verifySession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('Dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    setView('Dashboard');
  };
  
  const renderContent = () => {
    switch (view) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Workout':
        return <Workout />;
      case 'Diet':
        return <Diet />;
      case 'Goals':
        return <Goals />;
      case 'Progress':
        return <Progress />;
      case 'Profile':
        return <Profile onProfileUpdate={() => {}} />; // Simplified for now
      default:
        return <Dashboard />;
    }
  };

  if (isLoadingSession) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-sm mx-auto bg-gray-50 shadow-lg min-h-screen">
            <Auth onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className={`max-w-sm mx-auto bg-gray-50 shadow-lg min-h-screen relative`}>
        <Sidebar 
            isOpen={isSidebarOpen} 
            setView={setView} 
            onClose={() => setIsSidebarOpen(false)} 
            onLogout={handleLogout}
        />
        
        <div 
          className={`flex flex-col h-screen transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-64' : ''}`}
        >
          <main className="flex-grow overflow-y-auto pb-16">
            { view !== 'Profile' && <Header setView={setView} onMenuClick={() => setIsSidebarOpen(true)} />}
            {renderContent()}
          </main>
          <BottomNav activeTab={view} setView={setView} />
        </div>
      </div>
    </div>
  );
};

// FIX: An export assignment cannot have modifiers. Removed duplicate export keyword.
export default App;
