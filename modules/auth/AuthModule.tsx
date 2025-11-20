import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import { ShieldCheck, Users, Briefcase, UserCircle, User as UserIcon, ArrowLeft, Lock, Mail, Check } from 'lucide-react';
import { useToast } from '../ui/ToastContext';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export const AuthModule: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formMode, setFormMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Simulate Login Flow
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    // Simulate API Delay
    setTimeout(() => {
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: selectedRole === UserRole.ADMIN ? 'Admin User' : 
              selectedRole === UserRole.SALES ? 'Sales Rep' : 
              selectedRole === UserRole.RECRUITER ? 'Recruiter Jane' : 'Candidate One',
        role: selectedRole,
        avatar: `https://picsum.photos/seed/${selectedRole}/200`
      };
      setIsLoading(false);
      addToast(`Welcome back, ${mockUser.name}!`, 'success');
      onLogin(mockUser);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    if (!selectedRole) return;
    setIsLoading(true);
    // In a real app, this would call: window.google.accounts.oauth2.initCodeClient(...)
    console.log("Initializing Google Sign In...");
    
    setTimeout(() => {
       const mockUser: User = {
        id: `user-google-${Math.random().toString(36).substr(2, 9)}`,
        name: selectedRole === UserRole.SALES ? 'Sales Rep (Google)' : 'User (Google)',
        role: selectedRole,
        avatar: `https://picsum.photos/seed/${selectedRole}google/200`
      };
      setIsLoading(false);
      addToast('Google Sign-In Successful', 'success');
      onLogin(mockUser);
    }, 2000);
  };

  const renderRoleSelection = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
      <button onClick={() => onBack()} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold mb-6">
        <ArrowLeft size={16} /> Back to Home
      </button>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Portal</h2>
      
      <div className="space-y-4">
        <button onClick={() => setSelectedRole(UserRole.CANDIDATE)} className="w-full p-4 bg-white border hover:border-blue-500 rounded-xl flex items-center gap-4 transition-all group shadow-sm hover:shadow-md">
          <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg group-hover:bg-yellow-600 group-hover:text-white transition-colors">
            <UserIcon size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900">Candidate Portal</div>
            <div className="text-xs text-slate-500">Job Search & Applications</div>
          </div>
        </button>

        <div className="border-t pt-4 mt-2">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3">Internal Teams</p>
          <div className="space-y-3">
            <button onClick={() => setSelectedRole(UserRole.SALES)} className="w-full p-3 bg-slate-50 border hover:border-blue-500 rounded-lg flex items-center gap-3 transition-all hover:bg-white">
              <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
                <Briefcase size={16} />
              </div>
              <div className="text-left">
                 <div className="text-sm font-semibold text-slate-700">Sales Team</div>
                 <div className="text-[10px] text-slate-400">CRM & Client Mgmt</div>
              </div>
            </button>

            <button onClick={() => setSelectedRole(UserRole.RECRUITER)} className="w-full p-3 bg-slate-50 border hover:border-blue-500 rounded-lg flex items-center gap-3 transition-all hover:bg-white">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                <UserCircle size={16} />
              </div>
              <div className="text-left">
                 <div className="text-sm font-semibold text-slate-700">Recruiter</div>
                 <div className="text-[10px] text-slate-400">Sourcing & Screening</div>
              </div>
            </button>
            
            <button onClick={() => setSelectedRole(UserRole.ADMIN)} className="w-full p-3 bg-slate-50 border hover:border-blue-500 rounded-lg flex items-center gap-3 transition-all hover:bg-white">
              <div className="p-1.5 bg-red-100 text-red-600 rounded">
                <ShieldCheck size={16} />
              </div>
              <div className="text-sm font-semibold text-slate-700">Admin Console</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => {
    const isSales = selectedRole === UserRole.SALES;
    const roleName = selectedRole === UserRole.SALES ? 'Sales' : selectedRole === UserRole.RECRUITER ? 'Recruiter' : selectedRole === UserRole.ADMIN ? 'Admin' : 'Candidate';

    return (
      <div className="animate-in fade-in slide-in-from-right-8 max-w-md mx-auto w-full">
         <button onClick={() => { setSelectedRole(null); setFormMode('LOGIN'); }} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold mb-6">
           <ArrowLeft size={16} /> Back to Roles
         </button>

         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{formMode === 'LOGIN' ? 'Welcome Back' : formMode === 'SIGNUP' ? 'Create Account' : 'Reset Password'}</h2>
            <p className="text-slate-500 text-sm mt-1">
               {formMode === 'LOGIN' ? `Sign in to access your ${roleName} dashboard` : formMode === 'SIGNUP' ? `Register for a ${roleName} account` : 'Enter your email to receive a reset link'}
            </p>
         </div>

         {/* Google Sign In - Specific emphasis for Sales Team as per requirements */}
         {(formMode === 'LOGIN' || formMode === 'SIGNUP') && (
           <>
             <button 
               onClick={handleGoogleLogin}
               disabled={isLoading}
               className={`w-full border hover:bg-slate-50 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm ${
                 isSales ? 'bg-white border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-300 text-slate-700'
               }`}
             >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isLoading ? 'Connecting...' : `Sign in with Google ${isSales ? '(Recommended)' : ''}`}
             </button>
             
             <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold">Or continue with email</span></div>
             </div>
           </>
         )}

         {formMode !== 'FORGOT' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-slate-300 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="name@company.com"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-slate-300 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="••••••••"
                    />
                 </div>
              </div>
              
              {formMode === 'LOGIN' && (
                <div className="flex justify-between items-center text-xs">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600" />
                      <span className="text-slate-600">Remember me</span>
                   </label>
                   <button type="button" onClick={() => setFormMode('FORGOT')} className="text-blue-600 font-bold hover:underline">Forgot Password?</button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading} 
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                 {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : formMode === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
         )}

         {formMode === 'FORGOT' && (
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                 Enter the email associated with your account and we'll send you a link to reset your password.
              </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                 <input 
                   type="email" 
                   className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                   placeholder="name@company.com"
                 />
              </div>
              <button 
                onClick={() => { setFormMode('LOGIN'); addToast('Reset link sent to your email!', 'info'); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
              >
                 Send Reset Link
              </button>
           </div>
         )}

         <div className="mt-8 text-center text-sm">
            {formMode === 'LOGIN' ? (
              <p className="text-slate-500">
                Don't have an account? <button onClick={() => setFormMode('SIGNUP')} className="text-blue-600 font-bold hover:underline">Sign Up</button>
              </p>
            ) : (
              <p className="text-slate-500">
                Already have an account? <button onClick={() => setFormMode('LOGIN')} className="text-blue-600 font-bold hover:underline">Sign In</button>
              </p>
            )}
         </div>

         {/* Integration Note for Sales */}
         {isSales && (
           <div className="mt-6 p-3 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-700 text-center">
             Sales Team: Please use your corporate Google Workspace account for seamless CRM access.
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">sree</h1>
            <p className="text-lg text-blue-100 mb-8">
              The next-generation AI recruitment platform. Automate parsing, streamline workflows, and hire faster.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm bg-blue-500/30 p-3 rounded-lg backdrop-blur-sm">
                <ShieldCheck size={20} className="text-blue-200" />
                <div>
                  <div className="font-bold">Secure Access</div>
                  <div className="text-blue-100 text-xs opacity-80">Role-based permissions & data privacy</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm bg-blue-500/30 p-3 rounded-lg backdrop-blur-sm">
                 <Users size={20} className="text-blue-200" />
                <div>
                  <div className="font-bold">Collaborative Hiring</div>
                  <div className="text-blue-100 text-xs opacity-80">Unified dashboard for all stakeholders</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract Decoration */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-30 blur-2xl"></div>
        </div>
        
        <div className="md:w-1/2 p-12 bg-slate-50 flex flex-col justify-center">
          {selectedRole ? renderLoginForm() : renderRoleSelection()}
        </div>
      </div>
    </div>
  );
};