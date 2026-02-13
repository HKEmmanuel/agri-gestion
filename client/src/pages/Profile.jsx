import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Save, ArrowLeft, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-bold mb-6 hover:text-green-800 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-sm">Retour au tableau de bord</span>
            </Link>

            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    <div className="bg-green-700 p-8 md:p-12 text-white relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
                            <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-md border border-white/30">
                                <User size={56} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">{formData.name}</h1>
                                <p className="opacity-90 flex items-center justify-center md:justify-start gap-2 font-medium mt-1">
                                    <Shield size={16} /> Compte {user.role === 'admin' ? 'Administrateur' : 'Exploitant'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                        {message.text && (
                            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                                    Nom Complet
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-600 transition-all font-medium text-gray-700 shadow-sm"
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                                    Adresse Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-600 transition-all font-medium text-gray-700 shadow-sm"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full bg-green-700 text-white rounded-2xl py-5 font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-800 hover:shadow-green-200/50 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none active:scale-[0.98]"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Mise à jour...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Sauvegarder les Changements
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
