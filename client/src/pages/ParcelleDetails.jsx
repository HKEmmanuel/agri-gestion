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
        <div className="min-h-screen bg-gray-50 p-8">
            <Link to={`/exploitation/${parcelle.exploitationId}`} className="flex items-center gap-2 text-green-700 font-medium mb-6 hover:underline">
                <ArrowLeft size={18} /> Retour à l'exploitation
            </Link>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wheat size={120} />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Parcelle : {parcelle.name}</h1>
                <p className="text-gray-600">Superficie : {parcelle.area} ha</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="text-amber-600" /> Cultures en cours
                    </h2>
                    {user?.role !== 'admin' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
                        >
                            <Plus size={18} /> Lancer une Culture
                        </button>
                    )}
                </div>

                {cultures.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">Aucune culture enregistrée sur cette parcelle.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Semis</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cultures.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 font-medium">{c.type}</td>
                                        <td className="px-6 py-4">{new Date(c.sowingDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                c.status === 'Récoltée' ? 'bg-blue-100 text-blue-800' : 
                                                c.status === 'Abandonnée' ? 'bg-red-100 text-red-800' : 
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {c.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.isValidated ? (
                                                <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                                    <ShieldCheck size={16} /> Validée
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                                                    <ShieldAlert size={16} /> En attente
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex gap-3 items-center">
                                            <Link to={`/culture/${c.id}`} className="text-blue-600 hover:underline font-bold">Suivi</Link>
                                            
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
                                                    className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition"
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
                                                className="text-amber-500 hover:text-amber-700"
                                                title="Modifier"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCulture(c.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
