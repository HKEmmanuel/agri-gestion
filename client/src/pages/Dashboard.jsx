import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, Plus, Download, ShieldCheck, Pencil, Trash2, User as UserIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';


const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [exploitations, setExploitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [newExp, setNewExp] = useState({ name: '', location: '' });
  const [editExp, setEditExp] = useState({ id: '', name: '', location: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exploitations');
      setExploitations(res.data);
      
      // Calculate real chart data
      const aggregatedData = res.data.map(exp => {
        let totalExpCharges = 0;
        let totalExpRevenus = 0;
        exp.parcelles?.forEach(parc => {
          parc.cultures?.forEach(cul => {
            cul.charges?.forEach(ch => totalExpCharges += ch.amount);
            cul.recoltes?.forEach(re => totalExpRevenus += (re.quantity * re.price));
          });
        });
        return { name: exp.name, charges: totalExpCharges, revenus: totalExpRevenus };
      });
      setChartData(aggregatedData);

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exploitations', newExp);
      setNewExp({ name: '', location: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating exploitation", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/exploitations/${editExp.id}`, editExp);
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating exploitation", error);
      alert("Erreur lors de la modification : " + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette exploitation ainsi que toutes ses parcelles ?')) return;
    try {
        await api.delete(`/exploitations/${id}`);
        fetchData();
    } catch (error) {
        alert("Erreur lors de la suppression");
    }
  };



  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Header & Title
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green
    doc.text('Rapport Détaillé - Agri-Gestion', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Généré par : ${user?.name}`, 14, 35);
    doc.text(`Date : ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 42);
    doc.line(14, 45, pageWidth - 14, 45); // Horizontal line

    let finalY = 50;

    // 2. Capture Chart
    const chartElement = document.getElementById('economic-chart');
    if (chartElement) {
        try {
            const canvas = await html2canvas(chartElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * 180) / canvas.width;
            
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('1. Analyse Graphique', 14, finalY);
            doc.addImage(imgData, 'PNG', 15, finalY + 5, 180, 100); // 180 width, fixed height approx
            finalY += 115;
        } catch (err) {
            console.error("Chart capture failed", err);
        }
    }

    // 3. Detailed Data
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('2. Détails par Exploitation', 14, finalY);
    finalY += 10;

    for (const exp of exploitations) {
        // Check functionality for page break
        if (finalY > 250) { doc.addPage(); finalY = 20; }

        // Exploitation Header
        doc.setFillColor(240, 253, 244); // Light Green bg
        doc.rect(14, finalY, pageWidth - 28, 10, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 103, 34); // Dark Green
        doc.text(`Exploitation : ${exp.name} (${exp.location})`, 16, finalY + 7);
        finalY += 15;

        // Parcelles
        if (!exp.parcelles || exp.parcelles.length === 0) {
           doc.setFont('helvetica', 'italic');
           doc.setFontSize(10);
           doc.setTextColor(150);
           doc.text("Aucune parcelle enregistrée.", 20, finalY);
           finalY += 10;
        } else {
            for (const parc of exp.parcelles) {
                if (finalY > 250) { doc.addPage(); finalY = 20; }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(50);
                doc.text(`- Parcelle : ${parc.name} (${parc.area} ha)`, 20, finalY);
                finalY += 8;

                // Cultures
                if (!parc.cultures || parc.cultures.length === 0) {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(10);
                    doc.text("  (Aucune culture)", 25, finalY);
                    finalY += 8;
                } else {
                    for (const cult of parc.cultures) {
                        if (finalY > 260) { doc.addPage(); finalY = 20; }

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(80);
                        doc.text(`  > Culture : ${cult.type} (Semis: ${new Date(cult.sowingDate).toLocaleDateString()})`, 25, finalY);
                        
                        // Prepare table data for Charges & Recoltes combined or separate
                        // Let's do a summary table for this culture
                        
                        const chargesRows = cult.charges?.map(c => [
                            new Date(c.date).toLocaleDateString(), 
                            c.type, 
                            `${c.amount.toLocaleString()} FCFA`
                        ]) || [];

                        if (chargesRows.length > 0) {
                            autoTable(doc, {
                                head: [['Date', 'Type de Charge', 'Montant']],
                                body: chargesRows,
                                startY: finalY + 2,
                                margin: { left: 30 },
                                theme: 'grid',
                                headStyles: { fillColor: [220, 38, 38], fontSize: 8 }, // Red for charges
                                styles: { fontSize: 8 },
                                tableWidth: 150
                            });
                            finalY = doc.lastAutoTable.finalY + 5;
                        }

                        const recoltesRows = cult.recoltes?.map(r => [
                            new Date(r.date).toLocaleDateString(), 
                            `${r.quantity} kg`, 
                            `${r.price} FCFA/kg`,
                            `${(r.quantity * r.price).toLocaleString()} FCFA`
                        ]) || [];

                        if (recoltesRows.length > 0) {
                            autoTable(doc, {
                                head: [['Date', 'Quantité', 'Prix Unit.', 'Total Revenu']],
                                body: recoltesRows,
                                startY: finalY + 2,
                                margin: { left: 30 },
                                theme: 'grid',
                                headStyles: { fillColor: [22, 163, 74], fontSize: 8 }, // Green for revenue
                                styles: { fontSize: 8 },
                                tableWidth: 150
                            });
                            finalY = doc.lastAutoTable.finalY + 5;
                        }

                        // Financial Summary for Culture
                        const totalCharges = cult.charges?.reduce((s, c) => s + c.amount, 0) || 0;
                        const totalRevenus = cult.recoltes?.reduce((s, r) => s + (r.quantity * r.price), 0) || 0;
                        const resultat = totalRevenus - totalCharges;

                        if (finalY > 270) { doc.addPage(); finalY = 20; }
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(resultat >= 0 ? 22 : 220, resultat >= 0 ? 163 : 38, resultat >= 0 ? 74 : 38);
                        doc.text(`  Bilan Culture : ${resultat >= 0 ? '+' : ''}${resultat.toLocaleString()} FCFA`, 120, finalY);
                        finalY += 10;
                    }
                }
            }
        }
        finalY += 5; // Spacing between exploitations
    }

    doc.save(`Rapport_Complet_Agri_${user?.name}.pdf`);
  };

  useEffect(() => {
    fetchData();
  }, []); // Only on mount

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setIsModalOpen(true);
      window.history.replaceState({}, '', '/');
    }
    if (params.get('report') === 'true' && !loading && exploitations.length > 0) {
      // Generate PDF when data is loaded
      setTimeout(() => {
        generatePDF();
        window.history.replaceState({}, '', '/');
      }, 500); // Small delay to ensure everything is rendered
    }
  }, [loading, exploitations.length]); // Re-run when loading state changes or data is loaded

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-700 text-white p-4 shadow-lg hidden md:flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agri-Gestion Dashboard</h1>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Link to="/admin" className="bg-blue-600/20 text-white border border-blue-400/30 px-4 py-2 rounded-lg hover:bg-blue-600/40 transition flex items-center gap-2 backdrop-blur-sm">
              <ShieldCheck size={18} /> Admin
            </Link>
          )}
          <div className="h-8 w-[1px] bg-white/20 mx-2"></div>
          <span className="text-sm font-medium opacity-90">Session : {user?.name}</span>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Exploitations</h3>
             <p className="text-3xl font-black text-gray-800 tracking-tight">{exploitations.length}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Parcelles Totales</h3>
             <p className="text-3xl font-black text-gray-800 tracking-tight">
                {exploitations.reduce((acc, exp) => acc + (exp.parcelles?.length || 0), 0)}
             </p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500 hover:shadow-md transition-shadow">
             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Balance Totale</h3>
             <p className={`text-3xl font-black tracking-tight ${chartData.reduce((acc, d) => acc + (d.revenus - d.charges), 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {chartData.reduce((acc, d) => acc + (d.revenus - d.charges), 0).toLocaleString()} <span className="text-sm">FCFA</span>
             </p>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                        Tableau de Bord {user.role === 'admin' && <span className="block md:inline-block mt-2 md:mt-0 md:ml-3 text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest font-black">Vue Globale Admin</span>}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        {user.role === 'admin' 
                            ? "Suivi des performances de tous les exploitants" 
                            : `Bienvenue, ${user.name}. Voici un résumé de vos activités.`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                    {user.role !== 'admin' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <Plus size={20} /> <span className="whitespace-nowrap">Nouvelle Exploitation</span>
                        </button>
                    )}
                    <button 
                        onClick={generatePDF}
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <Download size={20} /> <span className="whitespace-nowrap">{user.role === 'admin' ? 'Rapport Global' : 'Télécharger Rapport'}</span>
                    </button>
                </div>
            </div>
            
            {exploitations.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="font-bold text-lg">Aucune exploitation trouvée.</p>
                    <p className="text-sm mt-1">Commencez par en créer une pour voir vos statistiques.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <th className="px-6 py-4 text-left">Nom de l'exploitation</th>
                                    <th className="px-6 py-4 text-left">Localisation</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {exploitations.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap font-bold text-gray-800">{exp.name}</td>
                                        <td className="px-6 py-5 whitespace-nowrap text-gray-500 font-medium">{exp.location}</td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/exploitation/${exp.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">
                                                    Gérer
                                                </Link>
                                                <button 
                                                    onClick={() => {
                                                        setEditExp({ id: exp.id, name: exp.name, location: exp.location });
                                                        setIsEditOpen(true);
                                                    }}
                                                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(exp.id)}
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

                    {/* Mobile View Cards */}
                    <div className="md:hidden space-y-4">
                        {exploitations.map((exp) => (
                            <div key={exp.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">{exp.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium flex items-center gap-1 mt-1">
                                        {exp.location}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                                    <Link to={`/exploitation/${exp.id}`} className="flex-grow text-center py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100">
                                        Gérer
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setEditExp({ id: exp.id, name: exp.name, location: exp.location });
                                            setIsEditOpen(true);
                                        }}
                                        className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(exp.id)}
                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl"
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

        {/* Economic Chart Area */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                    <TrendingUp size={22} />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Analyse Économique Globale</h3>
            </div>
            <div id="economic-chart" className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Bar dataKey="revenus" name="Revenus" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={24} />
                        <Bar dataKey="charges" name="Charges" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Modals */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-green-700 tracking-tight">Nouvelle Exploitation</h3>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'exploitation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium" 
                    placeholder="Ex: Ferme du Nord"
                    value={newExp.name}
                    onChange={e => setNewExp({...newExp, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Localisation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium" 
                    placeholder="Ex: Korhogo, Côte d'Ivoire"
                    value={newExp.location}
                    onChange={e => setNewExp({...newExp, location: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Annuler</button>
                  <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-green-100 hover:bg-green-700 transition">Créer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-amber-600 tracking-tight">Modifier l'Exploitation</h3>
              <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'exploitation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium" 
                    value={editExp.name}
                    onChange={e => setEditExp({...editExp, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Localisation</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium" 
                    value={editExp.location}
                    onChange={e => setEditExp({...editExp, location: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Annuler</button>
                  <button type="submit" className="px-8 py-3 bg-amber-600 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-amber-100 hover:bg-amber-700 transition">Sauvegarder</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


export default Dashboard;
