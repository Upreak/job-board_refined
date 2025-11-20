import React, { useState } from 'react';
import { AuthModule } from './modules/auth/AuthModule';
import { PublicJobBoard } from './modules/public/PublicJobBoard';
import { UnifiedDashboard } from './modules/dashboard/UnifiedDashboard';
import { SalesCRM } from './modules/sales/SalesCRM';
import { RecruiterWorkspace } from './modules/recruiter/RecruiterWorkspace';
import { CandidatePortal } from './modules/candidate/CandidatePortal';
import { ArchitectureView } from './modules/docs/ArchitectureView';
import { User, UserRole } from './types';
import { LayoutDashboard, Briefcase, Users, LogOut, Menu, Home } from 'lucide-react';

type AppView = 'PUBLIC' | 'AUTH' | 'APP' | 'ARCH_DOCS';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('PUBLIC');
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle Login Success
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('APP');
    // Default module based on role
    if (loggedInUser.role === UserRole.SALES) setActiveModule('sales');
    else if (loggedInUser.role === UserRole.RECRUITER) setActiveModule('recruiter');
    else setActiveModule('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setView('PUBLIC');
  };

  // 1. Public View (Default)
  if (view === 'PUBLIC') {
    return (
      <PublicJobBoard 
        onSignInClick={() => setView('AUTH')} 
        onViewArchitecture={() => setView('ARCH_DOCS')}
      />
    );
  }

  // 2. Architecture Documentation
  if (view === 'ARCH_DOCS') {
    return (
      <ArchitectureView onBack={() => setView('PUBLIC')} />
    );
  }

  // 3. Auth View (Login/Signup)
  if (view === 'AUTH') {
    return (
      <AuthModule 
        onLogin={handleLogin} 
        onBack={() => setView('PUBLIC')}
      />
    );
  }

  // 4. App/Dashboard View (Authenticated)
  if (view === 'APP' && user) {
    // Special Shell for Candidate
    if (user.role === UserRole.CANDIDATE) {
      return (
        <div className="relative">
          {/* Candidate Portal handles its own internal nav, but needs a logout mechanism if not built-in */}
          <button 
            onClick={handleLogout} 
            className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg z-50 hover:bg-slate-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
          <CandidatePortal user={user} />
        </div>
      );
    }

    // Internal Shell (Admin, Recruiter, Sales)
    const renderContent = () => {
      switch (activeModule) {
        case 'dashboard':
          return <UnifiedDashboard currentUser={user} />;
        case 'sales':
          return <SalesCRM />;
        case 'recruiter':
          return <RecruiterWorkspace />;
        default:
          return <UnifiedDashboard currentUser={user} />;
      }
    };

    const getNavItems = () => {
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ALL'] },
      ];

      if (user.role === UserRole.SALES || user.role === UserRole.ADMIN) {
        items.push({ id: 'sales', label: 'Sales & Clients', icon: Users, roles: [UserRole.SALES, UserRole.ADMIN] });
      }

      if (user.role === UserRole.RECRUITER || user.role === UserRole.ADMIN) {
        items.push({ id: 'recruiter', label: 'Recruitment', icon: Briefcase, roles: [UserRole.RECRUITER, UserRole.ADMIN] });
      }

      return items;
    };

    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-10`}>
          <div className="h-16 flex items-center justify-center border-b border-slate-800 relative">
            <span className={`font-bold text-xl tracking-wider ${!sidebarOpen && 'hidden'}`}>sree.ai</span>
            {!sidebarOpen && <span className="font-bold text-xl">S</span>}
          </div>

          <div className="flex-1 py-6 space-y-2 px-3">
            {getNavItems().map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeModule === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
               <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-700 object-cover" />
               {sidebarOpen && (
                 <div className="overflow-hidden">
                   <p className="text-sm font-medium truncate">{user.name}</p>
                   <p className="text-xs text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
                 </div>
               )}
            </div>
            <button onClick={handleLogout} className={`mt-4 w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-sm ${!sidebarOpen && 'justify-center'}`}>
              <LogOut size={16} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800">
               <Menu />
             </button>
             <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
             </div>
          </header>

          <main>
            {renderContent()}
          </main>
        </div>
      </div>
    );
  }

  return null;
};

export default App;