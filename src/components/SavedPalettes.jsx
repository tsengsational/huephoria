import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, ArrowLeft, Loader2, Palette, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const SavedPalettes = ({ onBack, onSelect }) => {
    const [palettes, setPalettes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchPalettes = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, 'palettes'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPalettes(fetched);
            } catch (err) {
                console.error('Error fetching palettes', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPalettes();
    }, [user]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this palette?')) return;

        try {
            await deleteDoc(doc(db, 'palettes', id));
            setPalettes(palettes.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting palette', err);
        }
    };

    const startEditing = (palette, e) => {
        e.stopPropagation();
        setEditingId(palette.id);
        setEditValue(palette.title || palette.motherName || '');
    };

    const cancelEditing = (e) => {
        e.stopPropagation();
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (id, motherName, e) => {
        e.stopPropagation();
        const finalTitle = editValue.trim() || motherName;
        try {
            await updateDoc(doc(db, 'palettes', id), {
                title: finalTitle
            });
            setPalettes(palettes.map(p => p.id === id ? { ...p, title: finalTitle } : p));
            setEditingId(null);
        } catch (err) {
            console.error('Error updating title', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-8 pb-12">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-slate-600 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-bold text-xl text-slate-800">Saved Palettes</h2>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="font-medium">Loading your collection...</p>
                </div>
            ) : palettes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                        <Palette size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-600">No saved palettes yet</p>
                        <p className="text-sm">Generate some magic and save them here!</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors"
                    >
                        Start Generating
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {palettes.map((palette, idx) => (
                            <motion.div
                                key={palette.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => editingId !== palette.id && onSelect({ ...palette.data, title: palette.title })}
                                className={`bg-white rounded-[2rem] shadow-sm border transition-all group relative overflow-hidden flex flex-col ${editingId === palette.id ? 'border-pink-300 ring-4 ring-pink-500/5' : 'border-slate-100 hover:shadow-2xl hover:scale-[1.02] cursor-pointer'}`}
                            >
                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            {editingId === palette.id ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') saveEdit(palette.id, palette.motherName, e);
                                                            if (e.key === 'Escape') cancelEditing(e);
                                                        }}
                                                        className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                                                    />
                                                    <button
                                                        onClick={e => saveEdit(palette.id, palette.motherName, e)}
                                                        className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                                                    >
                                                        <CloseIcon size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-black text-slate-800 truncate text-lg">
                                                        {palette.title || palette.motherName || palette.motherHex}
                                                    </h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {palette.motherHex} • {palette.data.mode}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        <div className={`flex items-center gap-1 transition-opacity ${editingId === palette.id ? 'opacity-100' : 'opacity-0 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                                            {editingId !== palette.id && (
                                                <>
                                                    <button
                                                        onClick={(e) => startEditing(palette, e)}
                                                        className="p-2 rounded-xl text-slate-300 hover:text-pink-500 hover:bg-pink-50 transition-colors"
                                                        title="Rename"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(palette.id, e)}
                                                        className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Swatches Row */}
                                    <div className="flex h-12 w-full rounded-2xl overflow-hidden shadow-inner border border-black/5">
                                        {palette.data.featured.slice(0, 5).map((color, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 h-full hover:flex-[1.5] transition-all duration-300"
                                                style={{ backgroundColor: color.hex }}
                                                title={color.hex}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white">
                                        <ExternalLink size={14} className="text-pink-500" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SavedPalettes;
