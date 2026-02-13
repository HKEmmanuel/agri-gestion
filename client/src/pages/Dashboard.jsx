import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, Plus, Download, ShieldCheck, Pencil, Trash2, User as UserIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';

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

import html2canvas from 'html2canvas';

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
      <header className="bg-green-700 text-white p-4 shadow-lg flex justify-between items-center">
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

      <main className="flex-grow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
             <h3 className="text-gray-500 text-sm font-medium">Total Exploitations</h3>
             <p className="text-3xl font-bold text-gray-800">{exploitations.length}</p>
           </div>
           <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
             <h3 className="text-gray-500 text-sm font-medium">Parcelles Totales</h3>
             <p className="text-3xl font-bold text-gray-800">
                {exploitations.reduce((acc, exp) => acc + (exp.parcelles?.length || 0), 0)}
             </p>
           </div>
           <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
             <h3 className="text-gray-500 text-sm font-medium">Balance Totale</h3>
             <p className={`text-3xl font-bold ${chartData.reduce((acc, d) => acc + (d.revenus - d.charges), 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {chartData.reduce((acc, d) => acc + (d.revenus - d.charges), 0).toLocaleString()} <span className="text-sm">FCFA</span>
             </p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tableau de Bord {user.role === 'admin' && <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Vue Globale Admin</span>}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {user.role === 'admin' 
                            ? "Suivi des performances de tous les exploitants" 
                            : `Bienvenue, ${user.name}. Voici un résumé de vos activités.`}
                    </p>
                </div>
                <div className="flex gap-4">
                    {user.role !== 'admin' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all hover:-translate-y-1"
                        >
                            <Plus size={20} /> Nouvelle Exploitation
                        </button>
                    )}
                    <button 
                        onClick={generatePDF}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <Download size={20} /> {user.role === 'admin' ? 'Rapport Global' : 'Télécharger Rapport'}
                    </button>
                </div>
            </div>
            
            {exploitations.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Aucune exploitation trouvée. Commencez par en créer une.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exploitations.map((exp) => (
                                <tr key={exp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{exp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{exp.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap flex gap-3">
                                        <Link to={`/exploitation/${exp.id}`} className="text-blue-600 hover:text-blue-800 transition font-bold flex items-center gap-1">
                                            Gérer
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setEditExp({ id: exp.id, name: exp.name, location: exp.location });
                                                setIsEditOpen(true);
                                            }}
                                            className="text-amber-600 hover:text-amber-800 transition flex items-center gap-1"
                                            title="Modifier"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(exp.id)}
                                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all scale-100">
              <h3 className="text-xl font-bold mb-4 text-green-700">Nouvelle Exploitation</h3>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nom de l'exploitation</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-green-500 outline-none transition" 
                    placeholder="Ex: Ferme du Nord"
                    value={newExp.name}
                    onChange={e => setNewExp({...newExp, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Localisation</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-green-500 outline-none transition" 
                    placeholder="Ex: Korhogo, Côte d'Ivoire"
                    value={newExp.location}
                    onChange={e => setNewExp({...newExp, location: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition">Créer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-amber-600">Modifier l'Exploitation</h3>
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nom de l'exploitation</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                    value={editExp.name}
                    onChange={e => setEditExp({...editExp, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Localisation</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-amber-500 outline-none transition" 
                    value={editExp.location}
                    onChange={e => setEditExp({...editExp, location: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg transition">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold shadow-md hover:bg-amber-700 transition">Sauvegarder</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-6">Performance Économique par Exploitation</h3>
                <div id="economic-chart" className="h-80 box-border p-2 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenus" name="Revenus (FCFA)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="charges" name="Charges (FCFA)" fill="#dc2626" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
