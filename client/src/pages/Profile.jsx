import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setFormData({ name: res.data.name, email: res.data.email });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile", error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.put('/users/me', formData);
            setUser({ ...user, ...res.data });
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour : ' + (error.response?.data?.message || error.response?.data?.error || error.message) });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-green-700">Chargement du profil...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Link to="/" className="flex items-center gap-2 text-green-700 font-medium mb-6 hover:underline">
                <ArrowLeft size={18} /> Retour au tableau de bord
            </Link>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-green-700 p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <User size={48} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{formData.name}</h1>
                                <p className="opacity-80 flex items-center gap-2">
                                    <Shield size={16} /> Compte {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {message.text && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                                    <User size={16} /> Nom Complet
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                                    <Mail size={16} /> Adresse Email
                                </label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full bg-green-700 text-white rounded-xl py-4 font-bold shadow-lg hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                            >
                                <Save size={20} />
                                {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
