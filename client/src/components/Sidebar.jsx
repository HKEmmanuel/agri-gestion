import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
    LayoutDashboard, 
    User, 
    Settings, 
    LogOut, 
    ChevronRight,
    Map,
    Sprout,
    ShieldCheck,
    Briefcase,
    FileText,
    PieChart,
    Plus,
    DollarSign,
    ShoppingCart,
    CloudSun,
    Bell,
    Download,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, setUser, logout } = useContext(AuthContext);
    const location = useLocation();
    const [exploitations, setExploitations] = useState([]);
    const [activeCultures, setActiveCultures] = useState([]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }, [location.pathname, setIsOpen]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data to sync role
                const userRes = await api.get('/users/me');
                if (userRes.data.role !== user.role) {
                    setUser({ ...user, role: userRes.data.role });
                }

                const [expRes, culRes] = await Promise.all([
                    api.get('/exploitations'),
                    api.get('/cultures')
                ]);
                setExploitations(expRes.data);
                // Filter active cultures (not harvested yet for example)
                setActiveCultures(culRes.data.filter(c => c.status !== 'Récoltée').slice(0, 3));
            } catch (error) {
                console.error("Sidebar: Error fetching data", error);
            }
        };
        if (user) fetchData();
    }, [user.id]); // Use user.id to avoid unnecessary re-runs but allow sync

    if (!user) return null;

    const mainItems = [
        { name: 'Tableau de Bord', icon: LayoutDashboard, path: '/' },
        { name: 'Mon Profil', icon: User, path: '/profile' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-2xl flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header - Logo */}
                <div className="relative p-8 border-b border-gray-50 bg-green-700 text-white overflow-hidden flex justify-between items-start">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="relative flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
                            <Sprout size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight uppercase tracking-wider">AgriGestion</h2>
                            <span className="text-xs opacity-70 italic font-medium tracking-tight">Espace Producteur</span>
                        </div>
                    </div>
                    
                    {/* Close button for mobile inside the header area */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="md:hidden relative p-1 bg-white/10 rounded-full hover:bg-white/20 transition text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {/* Section: Navigation Principale */}
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Navigation</p>
                        {mainItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive 
                                        ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={19} className={isActive ? 'text-green-600' : 'group-hover:text-green-600 transition-colors'} />
                                        <span className={`font-medium text-sm ${isActive ? 'text-green-700' : ''}`}>{item.name}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Section: Actions Rapides - ONLY FOR EXPLOITANTS */}
                    {user.role !== 'admin' && (
                        <div className="p-4 space-y-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Actions Rapides</p>
                            <div className="grid grid-cols-1 gap-2">
                                <button 
                                    onClick={() => window.location.href = '/?add=true'}
                                    className="flex flex-col items-center justify-center p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors border border-green-100 group shadow-sm"
                                >
                                    <Plus size={18} className="mb-1 group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="text-[9px] font-bold uppercase">New Farmer</span>
                                </button>
                            </div>

                            {/* Quick navigation to active cultures */}
                            {activeCultures.length > 0 && (
                                <div className="space-y-1">
                                    {activeCultures.map(cul => (
                                        <Link 
                                            key={cul.id} 
                                            to={`/culture/${cul.id}`}
                                            className="flex items-center gap-2 px-4 py-2 text-[11px] bg-gray-50 border border-gray-100 rounded-lg text-gray-600 hover:border-green-300 hover:text-green-700 transition-all font-medium"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="truncate">{cul.type} ({cul.parcelle?.exploitation?.name || '...'})</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section: Mes Exploitations - ONLY FOR EXPLOITANTS */}
                    {user.role !== 'admin' && (
                        <div className="p-4 space-y-1">
                            <div className="flex items-center justify-between px-4 mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mes Exploitations</p>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">{exploitations.length}</span>
                            </div>
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                {exploitations.map((exp) => {
                                    const path = `/exploitation/${exp.id}`;
                                    const isActive = location.pathname.startsWith(path);
                                    return (
                                        <Link
                                            key={exp.id}
                                            to={path}
                                            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all ${
                                                isActive 
                                                ? 'bg-amber-50 text-amber-700 font-bold border-l-4 border-amber-500 pl-3' 
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                            }`}
                                        >
                                            <Briefcase size={16} />
                                            <span className="truncate">{exp.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Section: Administration & Outils */}
                    <div className="p-4 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Outils & Admin</p>
                        
                        {/* Generate PDF Report - Available for all users */}
                        <button 
                            onClick={() => window.location.href = '/?report=true'}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all group"
                        >
                            <FileText size={19} className="group-hover:text-amber-600 transition-colors" />
                            <span className="font-medium text-sm">Générer Rapport PDF</span>
                        </button>

                        {/* Admin Panel Link - Only for admins */}
                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    location.pathname === '/admin' ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm font-bold' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <ShieldCheck size={19} className={location.pathname === '/admin' ? 'text-blue-600' : ''} />
                                <span className="font-medium text-sm">Administration</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer - Social/Logout */}
                <div className="p-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                            <span className="text-[9px] uppercase font-bold text-green-600 tracking-tighter">Connecté</span>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-bold group"
                    >
                        <LogOut size={19} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">Déconnexion</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
