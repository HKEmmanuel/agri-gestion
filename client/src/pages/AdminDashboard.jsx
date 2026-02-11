import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
    Trash2, 
    ShieldCheck, 
    User as UserIcon, 
    Loader2, 
    Plus, 
    Pencil, 
    Users, 
    Briefcase, 
    TrendingUp, 
    TrendingDown,
    X,
    Filter,
    Calendar as CalendarIcon,
    MapPin,
    Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalExploitations: 0,
        totalRevenues: 0,
        totalCharges: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filters state
    const [allExploitations, setAllExploitations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [filters, setFilters] = useState({ region: 'Toutes', start: '', end: '' });

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'exploitant' });

    const fetchData = async () => {
        try {
            const [usersRes, expRes] = await Promise.all([
                api.get('/users'),
                api.get('/exploitations')
            ]);
            
            setUsers(usersRes.data);
            setAllExploitations(expRes.data);
            
            // Extract unique regions
            const uniqueRegions = ['Toutes', ...new Set(expRes.data.map(e => e.location))];
            setRegions(uniqueRegions);

            calculateFilteredStats(expRes.data, filters);

        } catch (err) {
            setError('Erreur lors du chargement des données de la plateforme');
        } finally {
            setLoading(false);
        }
    };

    const calculateFilteredStats = (data, activeFilters) => {
        let rev = 0;
        let cha = 0;
        let filteredExpCount = 0;

        data.forEach(exp => {
            const matchesRegion = activeFilters.region === 'Toutes' || exp.location === activeFilters.region;
            if (!matchesRegion) return;
            
            filteredExpCount++;
            exp.parcelles?.forEach(p => {
                p.cultures?.forEach(cul => {
                    cul.recoltes?.forEach(r => {
                        const date = new Date(r.date);
                        if (activeFilters.start && date < new Date(activeFilters.start)) return;
                        if (activeFilters.end && date > new Date(activeFilters.end)) return;
                        rev += (r.quantity * r.price);
                    });
                    cul.charges?.forEach(c => {
                        const date = new Date(c.date);
                        if (activeFilters.start && date < new Date(activeFilters.start)) return;
                        if (activeFilters.end && date > new Date(activeFilters.end)) return;
                        cha += c.amount;
                    });
                });
            });
        });

        setStats(prev => ({
            ...prev,
            totalExploitations: filteredExpCount,
            totalRevenues: rev,
            totalCharges: cha,
            totalUsers: users.length // Users count doesn't filter by region/date for now
        }));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (allExploitations.length > 0) {
            calculateFilteredStats(allExploitations, filters);
        }
    }, [filters, users.length]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setFormData({ name: '', email: '', password: '', role: 'exploitant' });
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de la création');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.id}`, formData);
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur lors de la modification');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Supprimer définitivement cet utilisateur et TOUTES ses données ?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchData();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        setIsEditModalOpen(true);
    };

    const exportToExcel = () => {
        const dataToExport = [];
        
        allExploitations.forEach(exp => {
            if (filters.region !== 'Toutes' && exp.location !== filters.region) return;
            
            exp.parcelles?.forEach(p => {
                p.cultures?.forEach(cul => {
                    let rev = 0;
                    let cha = 0;
                    cul.recoltes?.forEach(r => rev += (r.quantity * r.price));
                    cul.charges?.forEach(c => cha += c.amount);

                    dataToExport.push({
                        'Propriétaire': users.find(u => u.id === exp.userId)?.name || 'Inconnu',
                        'Exploitation': exp.name,
                        'Région': exp.location,
                        'Parcelle': p.name,
                        'Surface (ha)': p.area,
                        'Culture': cul.type,
                        'Date Semis': new Date(cul.sowingDate).toLocaleDateString(),
                        'Statut': cul.status,
                        'Validation': cul.isValidated ? 'Validée' : 'En attente',
                        'Total Charges': cha,
                        'Total Revenus': rev,
                        'Marge (CFA)': rev - cha
                    });
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Données Plateforme");
        XLSX.writeFile(wb, `Rapport_Global_${filters.region}_${new Date().toLocaleDateString()}.xlsx`);
    };

    if (loading) return <div className="flex justify-center p-24"><Loader2 className="animate-spin text-blue-600" size={50} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
                            <ShieldCheck size={40} className="text-blue-600" /> 
                            <span>Espace Visionnaire Admin</span>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">Pilotage global de la plateforme Agri-Gestion</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={exportToExcel}
                            className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 group"
                        >
                            <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> Export Excel
                        </button>
                        <button 
                            onClick={() => {
                                setFormData({ name: '', email: '', password: '', role: 'exploitant' });
                                setIsCreateModalOpen(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 group"
                        >
                            <Plus className="group-hover:rotate-90 transition-transform" /> Nouvel Utilisateur
                        </button>
                    </div>
                </header>

                {/* Filters Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                            <MapPin size={14} /> Région / Localisation
                        </label>
                        <select 
                            className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-gray-700 border-2 border-transparent focus:border-blue-500 transition-all"
                            value={filters.region}
                            onChange={e => setFilters({...filters, region: e.target.value})}
                        >
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                            <CalendarIcon size={14} /> Depuis le
                        </label>
                        <input 
                            type="date"
                            className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-gray-700 border-2 border-transparent focus:border-blue-500 transition-all"
                            value={filters.start}
                            onChange={e => setFilters({...filters, start: e.target.value})}
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                            <CalendarIcon size={14} /> Jusqu'au
                        </label>
                        <input 
                            type="date"
                            className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-gray-700 border-2 border-transparent focus:border-blue-500 transition-all"
                            value={filters.end}
                            onChange={e => setFilters({...filters, end: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={() => setFilters({ region: 'Toutes', start: '', end: '' })}
                        className="px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        Réinitialiser
                    </button>
                </div>

                {/* Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={28} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase">Utilisateurs</p>
                                <p className="text-3xl font-black text-gray-800">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Briefcase size={28} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase truncate">Exploitations</p>
                                <p className="text-3xl font-black text-gray-800">{stats.totalExploitations}</p>
                            </div>
                        </div>
                        {filters.region !== 'Toutes' && (
                            <div className="absolute top-0 right-0 p-2 text-[8px] font-black uppercase text-green-600 bg-green-50 rounded-bl-xl">Filtré</div>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={28} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase">Revenu Global</p>
                                <p className="text-2xl font-black text-emerald-700">{stats.totalRevenues.toLocaleString()} CFA</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><TrendingDown size={28} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase">Charges Globales</p>
                                <p className="text-2xl font-black text-red-700">{stats.totalCharges.toLocaleString()} CFA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-8 font-bold">{error}</div>}

                {/* Users Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-800">Gestion des Comptes</h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{users.length} Comptes actifs</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5 text-left">Utilisateur</th>
                                    <th className="px-8 py-5 text-left">Email</th>
                                    <th className="px-8 py-5 text-left">Rôle</th>
                                    <th className="px-8 py-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <UserIcon size={20} />
                                                </div>
                                                <span className="font-bold text-gray-700">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500 font-medium">{u.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                                u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center gap-4">
                                                <button 
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.id === currentUser.id}
                                                    className={`p-2 rounded-xl transition-colors ${u.id === currentUser.id ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{isCreateModalOpen ? 'Créer un compte' : 'Modifier le compte'}</h3>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="hover:rotate-90 transition-transform"><X /></button>
                        </div>
                        <form onSubmit={isCreateModalOpen ? handleCreateUser : handleUpdateUser} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Nom Complet</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                                    {isCreateModalOpen ? 'Mot de passe' : 'Nouveau Mot de passe (optionnel)'}
                                </label>
                                <input 
                                    type="password" 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium" 
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required={isCreateModalOpen}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Rôle</label>
                                    <select 
                                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-blue-600 cursor-pointer"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="exploitant">Exploitant</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all pt-6">
                                {isCreateModalOpen ? 'Créer le compte' : 'Valider les modifications'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
