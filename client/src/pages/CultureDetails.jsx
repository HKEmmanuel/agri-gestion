import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Scale, Plus, Trash2, Pencil } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CultureDetails = () => {
    const { id } = useParams();
    const [culture, setCulture] = useState(null);
    const [charges, setCharges] = useState([]);
    const [recoltes, setRecoltes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [chargeModal, setChargeModal] = useState(false);
    const [recolteModal, setRecolteModal] = useState(false);
    const [isEditChargeOpen, setIsEditChargeOpen] = useState(false);
    const [isEditRecolteOpen, setIsEditRecolteOpen] = useState(false);

    const [newCharge, setNewCharge] = useState({ type: 'Intrant', amount: '', date: new Date().toISOString().split('T')[0] });
    const [newRecolte, setNewRecolte] = useState({ quantity: '', price: '', date: new Date().toISOString().split('T')[0] });
    const [editCharge, setEditCharge] = useState({ id: '', type: '', amount: '', date: '' });
    const [editRecolte, setEditRecolte] = useState({ id: '', quantity: '', price: '', date: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const culRes = await api.get(`/cultures/${id}`);
            if (culRes.data) {
                setCulture(culRes.data);
                setCharges(culRes.data.charges || []);
                setRecoltes(culRes.data.recoltes || []);
            }
        } catch (error) {
            console.error("Error fetching culture data", error);
            alert("Erreur lors du chargement des données économiques");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCharge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/charges', { ...newCharge, cultureId: id });
            setChargeModal(false);
            setNewCharge({ type: 'Intrant', amount: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) { 
            console.error(error); 
            alert("Erreur lors de l'enregistrement de la charge : " + (error.response?.data?.error || error.message));
        }
    };

    const handleRecolte = async (e) => {
        e.preventDefault();
        try {
            await api.post('/recoltes', { ...newRecolte, cultureId: id });
            setRecolteModal(false);
            setNewRecolte({ quantity: '', price: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) { 
            console.error(error); 
            alert("Erreur lors de l'enregistrement de la récolte : " + (error.response?.data?.error || error.message));
        }
    };

    const handleUpdateCharge = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/charges/${editCharge.id}`, editCharge);
            setIsEditChargeOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error updating charge", error);
            alert("Erreur lors de la modification : " + (error.response?.data?.message || error.response?.data?.error || error.message));
        }
    };

    const handleUpdateRecolte = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/recoltes/${editRecolte.id}`, editRecolte);
            setIsEditRecolteOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error updating recolte", error);
            alert("Erreur lors de la modification : " + (error.response?.data?.message || error.response?.data?.error || error.message));
        }
    };

    const handleDeleteCharge = async (chargeId) => {
        if (!window.confirm('Supprimer cette charge ?')) return;
        await api.delete(`/charges/${chargeId}`);
        fetchData();
    };

    const handleDeleteRecolte = async (recolteId) => {
        if (!window.confirm('Supprimer cette récolte ?')) return;
        await api.delete(`/recoltes/${recolteId}`);
        fetchData();
    };

    if (loading) return <div className="p-8 text-center text-green-700 font-bold">Chargement du suivi économique...</div>;
    if (!culture) return <div className="p-8 text-center text-red-500">Culture non trouvée.</div>;

    const totalCharges = charges.reduce((acc, c) => acc + c.amount, 0);
    const totalRevenus = recoltes.reduce((acc, r) => acc + (r.quantity * r.price), 0);
    const benefice = totalRevenus - totalCharges;

    const chartData = [
        { name: 'Charges', value: totalCharges, color: '#dc2626' },
        { name: 'Revenus', value: totalRevenus, color: '#16a34a' },
        { name: 'Bénéfice', value: benefice, color: '#2563eb' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Link to={`/parcelle/${culture.parcelleId}`} className="inline-flex items-center gap-2 text-green-700 font-bold mb-6 hover:text-green-800 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-sm">Retour à la parcelle</span>
            </Link>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm mb-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-green-100">
                            Culture Active
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Suivi : {culture.type}</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <Scale size={16} /> Semis le {new Date(culture.sowingDate).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Coût de Production</p>
                    <p className="text-2xl font-black text-gray-800">{totalCharges.toLocaleString()} <span className="text-xs">FCFA</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                    <p className="text-2xl font-black text-gray-800">{totalRevenus.toLocaleString()} <span className="text-xs">FCFA</span></p>
                </div>
                <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${benefice >= 0 ? 'border-blue-500' : 'border-amber-500'}`}>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bénéfice Net</p>
                    <p className={`text-2xl font-black ${benefice >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{benefice.toLocaleString()} <span className="text-xs">FCFA</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                {/* Charges Section */}
                <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                                <TrendingDown size={20} />
                            </div>
                            Dépenses
                        </h2>
                        <button onClick={() => setChargeModal(true)} className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-all"><Plus size={20} /></button>
                    </div>

                    <div className="space-y-3">
                        {charges.map(c => (
                            <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center group">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{new Date(c.date).toLocaleDateString()}</p>
                                    <p className="font-bold text-gray-800">{c.type}</p>
                                    <p className="text-red-600 font-black text-sm">{c.amount.toLocaleString()} FCFA</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditCharge({ id: c.id, type: c.type, amount: c.amount, date: new Date(c.date).toISOString().split('T')[0] });
                                            setIsEditChargeOpen(true);
                                        }}
                                        className="p-2 bg-white text-amber-500 rounded-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteCharge(c.id)} className="p-2 bg-white text-red-500 rounded-lg border border-gray-100 shadow-sm"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                        {charges.length === 0 && <p className="text-center text-gray-400 py-8 font-medium">Aucune dépense enregistrée.</p>}
                    </div>
                </div>

                {/* Recoltes Section */}
                <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                                <TrendingUp size={20} />
                            </div>
                            Récoltes
                        </h2>
                        <button onClick={() => setRecolteModal(true)} className="p-2 bg-green-600 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all"><Plus size={20} /></button>
                    </div>

                    <div className="space-y-3">
                        {recoltes.map(r => (
                            <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center group">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{new Date(r.date).toLocaleDateString()}</p>
                                    <p className="font-bold text-gray-800">{r.quantity} kg</p>
                                    <p className="text-green-600 font-black text-sm">{(r.quantity * r.price).toLocaleString()} FCFA</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditRecolte({ id: r.id, quantity: r.quantity, price: r.price, date: new Date(r.date).toISOString().split('T')[0] });
                                            setIsEditRecolteOpen(true);
                                        }}
                                        className="p-2 bg-white text-amber-500 rounded-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteRecolte(r.id)} className="p-2 bg-white text-red-500 rounded-lg border border-gray-100 shadow-sm"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                        {recoltes.length === 0 && <p className="text-center text-gray-400 py-8 font-medium">Aucune récolte enregistrée.</p>}
                    </div>
                </div>
            </div>

            {/* Create & Edit Modals */}
            {chargeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600"><Plus size={20}/> Ajouter une Charge</h3>
                        <form onSubmit={handleCharge}>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Type de dépense</label>
                                <input type="text" placeholder="ex: Engrais, Semences" className="w-full border rounded p-2" value={newCharge.type} onChange={e => setNewCharge({...newCharge, type: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Montant (FCFA)</label>
                                <input type="number" placeholder="0" className="w-full border rounded p-2" value={newCharge.amount} onChange={e => setNewCharge({...newCharge, amount: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Date</label>
                                <input type="date" className="w-full border rounded p-2" value={newCharge.date} onChange={e => setNewCharge({...newCharge, date: e.target.value})} required />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setChargeModal(false)} className="px-4 py-2 text-gray-500">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded font-medium shadow-md">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditChargeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-600"><Pencil size={20}/> Modifier la Charge</h3>
                        <form onSubmit={handleUpdateCharge}>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Type de dépense</label>
                                <input type="text" className="w-full border rounded p-2" value={editCharge.type} onChange={e => setEditCharge({...editCharge, type: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Montant (FCFA)</label>
                                <input type="number" className="w-full border rounded p-2" value={editCharge.amount} onChange={e => setEditCharge({...editCharge, amount: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Date</label>
                                <input type="date" className="w-full border rounded p-2" value={editCharge.date} onChange={e => setEditCharge({...editCharge, date: e.target.value})} required />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditChargeOpen(false)} className="px-4 py-2 text-gray-500">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-medium shadow-md">Sauvegarder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {recolteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-600"><Plus size={20}/> Enregistrer Récolte</h3>
                        <form onSubmit={handleRecolte}>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Quantité (kg)</label>
                                <input type="number" step="0.1" placeholder="0.0" className="w-full border rounded p-2" value={newRecolte.quantity} onChange={e => setNewRecolte({...newRecolte, quantity: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Prix unitaire (FCFA/kg)</label>
                                <input type="number" placeholder="0" className="w-full border rounded p-2" value={newRecolte.price} onChange={e => setNewRecolte({...newRecolte, price: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Date</label>
                                <input type="date" className="w-full border rounded p-2" value={newRecolte.date} onChange={e => setNewRecolte({...newRecolte, date: e.target.value})} required />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setRecolteModal(false)} className="px-4 py-2 text-gray-500">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-medium shadow-md">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditRecolteOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-600"><Pencil size={20}/> Modifier la Récolte</h3>
                        <form onSubmit={handleUpdateRecolte}>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Quantité (kg)</label>
                                <input type="number" step="0.1" className="w-full border rounded p-2" value={editRecolte.quantity} onChange={e => setEditRecolte({...editRecolte, quantity: e.target.value})} required />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Prix unitaire (FCFA/kg)</label>
                                <input type="number" className="w-full border rounded p-2" value={editRecolte.price} onChange={e => setEditRecolte({...editRecolte, price: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Date</label>
                                <input type="date" className="w-full border rounded p-2" value={editRecolte.date} onChange={e => setEditRecolte({...editRecolte, date: e.target.value})} required />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditRecolteOpen(false)} className="px-4 py-2 text-gray-500">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded font-medium shadow-md">Sauvegarder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CultureDetails;
