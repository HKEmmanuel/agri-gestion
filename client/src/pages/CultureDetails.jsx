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
        <div className="min-h-screen bg-gray-50 p-8">
            <Link to={`/parcelle/${culture.parcelleId}`} className="flex items-center gap-2 text-green-700 font-medium mb-6 hover:underline">
                <ArrowLeft size={18} /> Retour à la parcelle
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-800">Suivi : {culture.type} ({new Date(culture.sowingDate).getFullYear()})</h1>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Coût de Production</p>
                            <p className="text-2xl font-bold text-gray-800">{totalCharges.toLocaleString()} FCFA</p>
                        </div>
                        <TrendingDown className="text-red-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Chiffre d'Affaires</p>
                            <p className="text-2xl font-bold text-gray-800">{totalRevenus.toLocaleString()} FCFA</p>
                        </div>
                        <TrendingUp className="text-green-500" />
                    </div>
                </div>
                <div className={`bg-white p-6 rounded-lg shadow-sm border-t-4 ${benefice >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Bénéfice Net</p>
                            <p className={`text-2xl font-bold ${benefice >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{benefice.toLocaleString()} FCFA</p>
                        </div>
                        <DollarSign className={benefice >= 0 ? 'text-blue-500' : 'text-orange-500'} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Analysis */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-6">Comparaison Économique</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations */}
                <div className="space-y-6">
                    {/* Charges Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Dépenses (Charges)</h3>
                            <button onClick={() => setChargeModal(true)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><Plus size={20} /></button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {charges.map(c => (
                                <div key={c.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{c.type}</span>
                                        <span className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-red-600">-{c.amount.toLocaleString()}</span>
                                        <button 
                                            onClick={() => {
                                                setEditCharge({ id: c.id, type: c.type, amount: c.amount, date: new Date(c.date).toISOString().split('T')[0] });
                                                setIsEditChargeOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-amber-500 transition"
                                            title="Modifier"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteCharge(c.id)} className="text-gray-400 hover:text-red-500 transition" title="Supprimer la dépense">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {charges.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Aucune dépense.</p>}
                        </div>
                    </div>

                    {/* Recoltes Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Récoltes & Ventes</h3>
                            <button onClick={() => setRecolteModal(true)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Plus size={20} /></button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {recoltes.map(r => (
                                <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{r.quantity} kg @ {r.price}</span>
                                        <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-600">+{ (r.quantity * r.price).toLocaleString() }</span>
                                        <button 
                                            onClick={() => {
                                                setEditRecolte({ id: r.id, quantity: r.quantity, price: r.price, date: new Date(r.date).toISOString().split('T')[0] });
                                                setIsEditRecolteOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-amber-500 transition"
                                            title="Modifier"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteRecolte(r.id)} className="text-gray-400 hover:text-red-500 transition" title="Supprimer la vente">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {recoltes.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Aucune vente.</p>}
                        </div>
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
