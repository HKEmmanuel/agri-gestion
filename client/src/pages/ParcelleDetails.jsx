import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, ArrowLeft, Trash2, Wheat, Calendar, Pencil, ShieldCheck, ShieldAlert } from 'lucide-react';

const ParcelleDetails = () => {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [parcelle, setParcelle] = useState(null);
    const [cultures, setCultures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newCulture, setNewCulture] = useState({ type: '', sowingDate: new Date().toISOString().split('T')[0] });
    const [editCulture, setEditCulture] = useState({ id: '', type: '', sowingDate: '', status: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const parRes = await api.get(`/parcelles/${id}`);
            if (parRes.data) {
                setParcelle(parRes.data);
                setCultures(parRes.data.cultures || []);
            }
        } catch (error) {
            console.error("Error fetching parcelle data", error);
            alert("Erreur lors du chargement de la parcelle");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cultures', { ...newCulture, parcelleId: id });
            setNewCulture({ type: '', sowingDate: new Date().toISOString().split('T')[0] });
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error creating culture", error);
            alert("Erreur lors de la création de la culture : " + (error.response?.data?.error || error.message));
        }
    };

    const handleUpdateCulture = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/cultures/${editCulture.id}`, editCulture);
            setIsEditOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error updating culture", error);
            alert("Erreur lors de la modification : " + (error.response?.data?.message || error.response?.data?.error || error.message));
        }
    };

    const handleDeleteCulture = async (cultureId) => {
        if (!window.confirm('Supprimer cette culture ?')) return;
        try {
            await api.delete(`/cultures/${cultureId}`);
            fetchData();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!parcelle) return <div className="p-8 text-center text-red-500">Parcelle non trouvée.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Link to={`/exploitation/${parcelle.exploitationId}`} className="inline-flex items-center gap-2 text-green-700 font-bold mb-6 hover:text-green-800 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-sm">Retour à l'exploitation</span>
            </Link>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm mb-8 relative overflow-hidden border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Wheat size={180} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Parcelle : {parcelle.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-amber-50 text-amber-700 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-100">
                            {parcelle.area} Hectares
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-100">
                             {cultures.length} Cultures
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        Suivi des Cultures
                    </h2>
                    {user?.role !== 'admin' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95"
                        >
                            <Plus size={18} /> Lancer une Culture
                        </button>
                    )}
                </div>

                {cultures.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="font-bold text-gray-400">Aucune culture enregistrée sur cette parcelle.</p>
                        {user?.role !== 'admin' && <p className="text-xs text-gray-400 mt-1">Préparez votre saison en ajoutant une nouvelle culture.</p>}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="px-6 py-4 text-left">Culture</th>
                                        <th className="px-6 py-4 text-left">Date Semis</th>
                                        <th className="px-6 py-4 text-left">Statut</th>
                                        <th className="px-6 py-4 text-left">Validation</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cultures.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5 font-black text-gray-800">{c.type}</td>
                                            <td className="px-6 py-5 text-gray-500 font-medium">{new Date(c.sowingDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                                    c.status === 'Récoltée' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                                                    c.status === 'Abandonnée' ? 'bg-red-50 text-red-700 border border-red-100' : 
                                                    'bg-green-50 text-green-700 border border-green-100'
                                                }`}>
                                                    {c.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {c.isValidated ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                        <ShieldCheck size={12} /> Validée
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                                        <ShieldAlert size={12} /> En attente
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end items-center gap-3">
                                                    <Link to={`/culture/${c.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                                                        Suivi
                                                    </Link>
                                                    
                                                    {user?.role === 'admin' && !c.isValidated && (
                                                        <button 
                                                            onClick={async () => {
                                                                try {
                                                                    await api.put(`/cultures/${c.id}`, { isValidated: true });
                                                                    fetchData();
                                                                } catch (err) {
                                                                    alert('Erreur lors de la validation');
                                                                }
                                                            }} 
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                            title="Valider cette culture"
                                                        >
                                                            <ShieldCheck size={18} />
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => {
                                                            setEditCulture({ 
                                                                id: c.id, 
                                                                type: c.type, 
                                                                sowingDate: new Date(c.sowingDate).toISOString().split('T')[0],
                                                                status: c.status || 'Active'
                                                            });
                                                            setIsEditOpen(true);
                                                        }}
                                                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteCulture(c.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
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

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {cultures.map(c => (
                                <div key={c.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{c.type}</h3>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Semis: {new Date(c.sowingDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                                            c.status === 'Récoltée' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                            c.status === 'Abandonnée' ? 'bg-red-50 text-red-700 border-red-100' : 
                                            'bg-green-50 text-green-700 border-green-100'
                                        }`}>
                                            {c.status || 'Active'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {c.isValidated ? (
                                            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                <ShieldCheck size={12} /> Validée
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                                <ShieldAlert size={12} /> En attente
                                            </div>
                                        )}
                                        {user?.role === 'admin' && !c.isValidated && (
                                            <button 
                                                onClick={() => {/* validation logic already in table, but keep card functional */}}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg"
                                            >
                                                Valider
                                            </button>
                                        )}
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <Link to={`/culture/${c.id}`} className="flex-grow text-center py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-100">
                                            Suivi de Production
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setEditCulture({ 
                                                    id: c.id, 
                                                    type: c.type, 
                                                    sowingDate: new Date(c.sowingDate).toISOString().split('T')[0],
                                                    status: c.status || 'Active'
                                                });
                                                setIsEditOpen(true);
                                            }}
                                            className="p-2.5 bg-white text-amber-500 border border-gray-100 rounded-xl"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCulture(c.id)}
                                            className="p-2.5 bg-white text-red-500 border border-gray-100 rounded-xl"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-amber-700">Nouvelle Culture</h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Type de culture (ex: Maïs)</label>
                                <input 
                                    type="text" 
                                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                                    value={newCulture.type}
                                    onChange={e => setNewCulture({...newCulture, type: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Date de semis</label>
                                <input 
                                    type="date" 
                                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                                    value={newCulture.sowingDate}
                                    onChange={e => setNewCulture({...newCulture, sowingDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition">Annuler</button>
                                <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-md hover:bg-amber-700 transition">Confirmer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-amber-600">Modifier la Culture</h3>
                        <form onSubmit={handleUpdateCulture}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Type de culture</label>
                                <input 
                                    type="text" 
                                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                                    value={editCulture.type}
                                    onChange={e => setEditCulture({...editCulture, type: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Date de semis</label>
                                <input 
                                    type="date" 
                                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                                    value={editCulture.sowingDate}
                                    onChange={e => setEditCulture({...editCulture, sowingDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                                <select 
                                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition"
                                    value={editCulture.status}
                                    onChange={e => setEditCulture({...editCulture, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Récoltée">Récoltée</option>
                                    <option value="Abandonnée">Abandonnée</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition">Annuler</button>
                                <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-md hover:bg-amber-700 transition">Sauvegarder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParcelleDetails;
