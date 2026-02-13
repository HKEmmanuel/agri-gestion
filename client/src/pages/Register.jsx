import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Loader2, Leaf } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(email, password, name, 'exploitant');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Échec de l\'inscription';
      if (err.response) {
        errorMessage = err.response.data.message || 'Le serveur a refusé l\'inscription';
      } else if (err.request) {
        errorMessage = 'Erreur réseau : Le serveur ne répond pas';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-green-600 rounded-2xl shadow-xl shadow-green-100 mb-4">
            <Leaf className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Espace Agricole</h1>
          <p className="text-gray-500 font-medium mt-2">Rejoignez la communauté Agri-Gestion</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Nom Complet</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-600 transition-all font-medium text-gray-700"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Adresse Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-600 transition-all font-medium text-gray-700"
                  placeholder="jean.dupont@exemple.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Mot de Passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-600 transition-all font-medium text-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Créer mon Compte
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
