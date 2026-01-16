import React, { useState, useEffect, useRef } from 'react';
import { ProjectAdvisor } from './components/ProjectAdvisor';
import { ChatAssistant } from './components/ChatAssistant';
import { ImageStudio } from './components/ImageStudio';
import { LiveSession } from './components/LiveSession';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image, 
  Mic, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  Info,
  Smartphone,
  CheckCircle2,
  Camera,
  Globe
} from 'lucide-react';

type View = 'advisor' | 'chat' | 'studio' | 'voice';

interface UserData {
  name: string;
  mobile: string;
  photo?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const COUNTRY_CODES = [
  { code: '+1', name: 'USA/Canada' },
  { code: '+44', name: 'UK' },
  { code: '+91', name: 'India' },
  { code: '+61', name: 'Australia' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+55', name: 'Brazil' },
  { code: '+971', name: 'UAE' },
];

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState<View>('advisor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountEdit, setShowAccountEdit] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Auth States
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  
  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pathfinder_active_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setEditName(parsed.name);
      setEditMobile(parsed.mobile);
      setEditPhoto(parsed.photo);
    }
    const savedTheme = localStorage.getItem('pathfinder_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim() && regMobile.trim()) {
      const fullMobile = countryCode + regMobile;
      const allUsers = JSON.parse(localStorage.getItem('pathfinder_all_users') || '[]');
      if (allUsers.find((u: UserData) => u.mobile === fullMobile)) {
        addToast("Mobile number already registered. Try logging in.", "error");
        return;
      }
      const newUser: UserData = { name: regName, mobile: fullMobile };
      allUsers.push(newUser);
      localStorage.setItem('pathfinder_all_users', JSON.stringify(allUsers));
      localStorage.setItem('pathfinder_active_user', JSON.stringify(newUser));
      setUser(newUser);
      setEditName(newUser.name);
      setEditMobile(newUser.mobile);
      addToast(`Welcome, ${newUser.name}!`, 'success');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMobile = countryCode + regMobile;
    const allUsers = JSON.parse(localStorage.getItem('pathfinder_all_users') || '[]');
    const existingUser = allUsers.find((u: UserData) => u.mobile === fullMobile);
    
    if (existingUser) {
      setUser(existingUser);
      setEditName(existingUser.name);
      setEditMobile(existingUser.mobile);
      setEditPhoto(existingUser.photo);
      localStorage.setItem('pathfinder_active_user', JSON.stringify(existingUser));
      addToast(`Welcome back, ${existingUser.name}!`, 'success');
    } else {
      addToast("Account not found with this mobile number.", "error");
    }
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updatedUser: UserData = { ...user, name: editName, mobile: editMobile, photo: editPhoto };
    
    setUser(updatedUser);
    localStorage.setItem('pathfinder_active_user', JSON.stringify(updatedUser));
    
    const allUsers = JSON.parse(localStorage.getItem('pathfinder_all_users') || '[]');
    const index = allUsers.findIndex((u: UserData) => u.mobile === user.mobile);
    if (index !== -1) {
      allUsers[index] = updatedUser;
      localStorage.setItem('pathfinder_all_users', JSON.stringify(allUsers));
    }
    
    setShowAccountEdit(false);
    addToast("Profile updated successfully", "success");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pathfinder_active_user');
    setShowProfileMenu(false);
    setRegMobile('');
    setRegName('');
    addToast('Logged out successfully', 'info');
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pathfinder_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pathfinder_theme', 'light');
    }
  }, [darkMode]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const NavItem = ({ view, label, icon: Icon }: { view: View; label: string; icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
        addToast(`Switched to ${label}`);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-500/10 dark:text-brand-400 dark:ring-1 dark:ring-brand-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 ${darkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-md bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-slate-200 dark:border-slate-800">
          <div className="bg-brand-600 dark:bg-brand-700/80 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-md ring-1 ring-white/30">
                <LayoutDashboard size={40} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Pathfinder</h1>
              <p className="text-brand-100 text-sm mt-2 opacity-80">
                {authMode === 'register' ? 'Join our Student Community' : 'Welcome back to your dashboard'}
              </p>
            </div>
          </div>
          <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="p-8 space-y-5">
            <div className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-600" size={18} />
                    <input 
                      required
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your name" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mobile No</label>
                <div className="flex gap-2">
                  <div className="relative w-1/3">
                    <Globe className="absolute left-3 top-3 text-slate-400 dark:text-slate-600" size={18} />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full pl-10 pr-2 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer text-sm"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-3 top-3 text-slate-400 dark:text-slate-600" size={18} />
                    <input 
                      required
                      type="tel" 
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="Number" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ring-1 ring-white/10"
            >
              {authMode === 'register' ? 'Create Account' : 'Log In'}
            </button>
            <div className="text-center pt-1">
              <button 
                type="button" 
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition"
              >
                {authMode === 'register' ? 'Already have an account? Log In' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-brand-100 dark:selection:bg-brand-900/50">
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 backdrop-blur-md ${
              toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' :
              toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' :
              'bg-white/90 border-slate-200 text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-slate-900/50 dark:backdrop-blur-md border-r border-slate-200 dark:border-slate-800/50 flex-col transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center space-x-3 text-brand-600 dark:text-brand-400">
            <div className="p-1.5 bg-brand-50 dark:bg-brand-900/30 rounded-lg">
              <LayoutDashboard size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">Pathfinder</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student Advisor</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-2">Main Menu</div>
          <NavItem view="advisor" label="Project Advisor" icon={LayoutDashboard} />
          <NavItem view="chat" label="AI Mentor Chat" icon={MessageSquare} />
          <NavItem view="studio" label="Creative Studio" icon={Image} />
          <NavItem view="voice" label="Voice Assistant" icon={Mic} />
          
          <div className="pt-6">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-2">Support</div>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <HelpCircle size={20} />
              <span>Help Center</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-sm active:scale-95"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-xs text-slate-400 dark:text-slate-600 font-medium tracking-tight">v1.2.0 • Gemini AI</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Universal Header */}
        <header className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 p-4 flex justify-between items-center z-20 shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-3">
             <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg"
             >
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
             <div className="hidden md:flex items-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
               Platform <ChevronRight size={10} className="mx-2" /> 
               <span className="text-brand-600 dark:text-brand-400">
                 {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
               </span>
             </div>
             <div className="md:hidden flex items-center space-x-2 text-brand-600 dark:text-brand-400">
                <LayoutDashboard size={24} />
                <span className="text-lg font-bold">Pathfinder</span>
             </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1 pl-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-brand-500/20 transition-all"
              >
                <span className="hidden sm:block text-xs font-bold px-1 text-slate-700 dark:text-slate-200">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden ring-1 ring-white/20">
                  {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-40 p-2 animate-in fade-in zoom-in duration-150 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 mb-2 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/40 flex-shrink-0 flex items-center justify-center text-brand-600 dark:text-brand-400 overflow-hidden font-bold text-lg ring-1 ring-brand-500/10">
                        {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{user.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium truncate">{user.mobile}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button 
                        onClick={() => { setShowAccountEdit(true); setShowProfileMenu(false); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                      >
                        <User size={18} /> <span>Account Profile</span>
                      </button>
                      <button 
                        onClick={() => { setDarkMode(!darkMode); setShowProfileMenu(false); }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                      >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-2 mx-2"></div>
                      <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" onClick={handleLogout}>
                        <LogOut size={18} /> <span>Logout Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-hidden relative transition-colors duration-500">
          {currentView === 'advisor' && <ProjectAdvisor />}
          {currentView === 'chat' && <ChatAssistant />}
          {currentView === 'studio' && <ImageStudio />}
          {currentView === 'voice' && <LiveSession />}
        </div>

        {/* Shared App Footer */}
        <footer className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/50 p-3 px-6 text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium flex justify-between items-center transition-colors">
          <div className="flex space-x-6">
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Docs</a>
          </div>
          <p>© 2025 Pathfinder AI. Built for Students.</p>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="uppercase tracking-widest font-bold text-[9px]">Live Service</span>
          </div>
        </footer>
      </main>

      {/* Account Profile Edit Modal */}
      {showAccountEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center text-slate-800 dark:text-slate-100"><User className="mr-3 text-brand-600" /> Edit Profile</h3>
              <button onClick={() => setShowAccountEdit(false)} className="hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors text-slate-400"><X /></button>
            </div>
            <form onSubmit={handleUpdateAccount} className="p-8 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-28 h-28 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 overflow-hidden font-bold text-4xl ring-4 ring-slate-100 dark:ring-slate-800 group-hover:ring-brand-500/20 transition-all">
                    {editPhoto ? <img src={editPhoto} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px]">
                    <Camera className="text-white" size={28} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 uppercase font-bold tracking-[0.2em]">Click circle to update photo</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mobile No</label>
                  <input 
                    type="tel" 
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAccountEdit(false)}
                  className="flex-1 py-3.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-600 dark:bg-brand-500 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-brand-500/30 transition-all ring-1 ring-white/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-brand-600 dark:bg-brand-700/80 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-30"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <HelpCircle size={28} />
                <h3 className="text-2xl font-bold tracking-tight">Pathfinder Help Center</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="hover:rotate-90 transition-transform relative z-10 p-1 hover:bg-white/10 rounded-full"><X /></button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900">
              <div className="space-y-4 text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-lg flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mr-4 ring-1 ring-brand-500/20">1</div>
                  Getting Started
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-14">
                  Start by using the <strong>Project Advisor</strong>. Input your timeframe and goals to see the best development paths. Compare tech stacks side-by-side using our AI analysis lab.
                </p>
              </div>
              
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/50 pt-8 text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-lg flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4 ring-1 ring-purple-500/20">2</div>
                  Creative Assets
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-14">
                  Use the <strong>Creative Studio</strong> to generate UI icons, landing page backgrounds, or wireframes. You can upload an existing image and ask the AI to edit it specifically for your project's brand.
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/50 pt-8 text-slate-800 dark:text-slate-100">
                <h4 className="font-bold text-lg flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-4 ring-1 ring-amber-500/20">3</div>
                  Voice Assistance
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-14">
                  Need a quick brainstorm session? The <strong>Voice Assistant</strong> uses Gemini Live to provide low-latency audio feedback. Perfect for hands-free thinking while you sketch or code.
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <a href="#" className="flex items-center text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline transition-all">
                View Full Documentation <ExternalLink size={16} className="ml-2" />
              </a>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full sm:w-auto bg-brand-600 dark:bg-brand-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 dark:hover:bg-brand-600 transition-all shadow-lg active:scale-95"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}