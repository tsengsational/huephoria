import React, { useRef, useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Share2, ArrowLeft, Download, Check, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
import { generateW3CTokens, downloadFile, generateProcreateSwatches, generateCSSVariables, generateHexList } from '../utils/exportUtils';

const MatrixSwatch = ({ color, delay = 0 }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        className="aspect-square rounded-lg shadow-sm cursor-pointer relative group flex items-center justify-center border border-black/5"
        style={{ backgroundColor: color.hex }}
        title={`${color.name} (${color.hex})`}
        onClick={() => navigator.clipboard.writeText(color.hex)}
    >
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg`}>
            <Copy size={12} className={color.isDark ? 'text-white' : 'text-black'} />
        </div>
    </motion.div>
);

const ResultsScreen = ({ paletteData, onRegenerate, onBack }) => {
    const exportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedHex, setCopiedHex] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { user } = useAuth();

    if (!paletteData) return null;

    const { featured, matrix } = paletteData;
    const mother = featured[0];

    const copyToClipboard = (hex) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    const handleExport = (format) => {
        const baseName = `palettable-${mother.hex.replace('#', '')}`;
        let content, fileName, type;

        switch (format) {
            case 'w3c':
                content = generateW3CTokens(paletteData);
                fileName = `${baseName}.tokens.json`;
                type = 'application/json';
                break;
            case 'procreate':
                content = generateProcreateSwatches(paletteData);
                fileName = `${baseName}.swatches`;
                type = 'application/json';
                break;
            case 'css':
                content = generateCSSVariables(paletteData);
                fileName = `${baseName}.css`;
                type = 'text/css';
                break;
            case 'hex':
                content = generateHexList(paletteData);
                fileName = `${baseName}.txt`;
                type = 'text/plain';
                break;
            default:
                console.warn('Unknown export format:', format);
                return;
        }

        if (content) {
            downloadFile(content, fileName, type);
            setShowExportMenu(false);
        }
    };

    const handleImageExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            const dataUrl = await toPng(exportRef.current, {
                quality: 0.95,
                backgroundColor: '#F8FAFC',
                style: { borderRadius: '0' }
            });
            const link = document.createElement('a');
            link.download = `palettable-${mother.hex.replace('#', '')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export image', err);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            alert('Please sign in to save palettes!');
            return;
        }
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'palettes'), {
                userId: user.uid,
                data: { ...paletteData, matrix: paletteData.matrix.flat() },
                motherHex: mother.hex,
                motherName: mother.name,
                createdAt: serverTimestamp(),
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save palette', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between p-2">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-800 capitalize">{paletteData.mode} Palette</h2>
                <button className="p-2 rounded-full hover:bg-white transition-colors">
                    <MoreVertical size={24} />
                </button>
            </header>

            <div ref={exportRef} className="space-y-6">
                {/* MOTHER COLOR Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center text-center space-y-4 relative overflow-hidden"
                    style={{ backgroundColor: mother.hex }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-black/5 opacity-0 hover:opacity-100 transition-opacity" />

                    <div className={`space-y-1 ${mother.isDark ? 'text-white' : 'text-slate-900'}`}>
                        <h3 className="text-4xl font-black tracking-tighter uppercase">{mother.hex}</h3>
                        <p className="text-lg font-bold opacity-80">{mother.name}</p>
                    </div>

                    <button
                        onClick={() => copyToClipboard(mother.hex)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-lg transition-all active:scale-95 ${mother.isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            }`}
                    >
                        {copiedHex === mother.hex ? <Check size={18} /> : <Copy size={18} />}
                        {copiedHex === mother.hex ? 'Copied!' : 'Copy'}
                    </button>
                </motion.div>

                {/* HARMONIOUS TONES Bento Grid */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Harmonious Tones</h3>
                    <div className="grid grid-cols-2 gap-3 h-[400px]">
                        {/* Column 1 (Left) */}
                        <div className="grid grid-rows-3 gap-3">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => copyToClipboard(featured[1].hex)}
                                className="row-span-2 rounded-[2rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5"
                                style={{ backgroundColor: featured[1].hex }}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                <div className={`absolute bottom-4 left-4 font-bold text-sm ${featured[1].isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {featured[1].hex}
                                </div>
                            </motion.div>
                            <div className="grid grid-cols-2 gap-3">
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => copyToClipboard(featured[2].hex)}
                                    className="rounded-2xl shadow-inner border border-black/5"
                                    style={{ backgroundColor: featured[2].hex }}
                                />
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => copyToClipboard(featured[4].hex)}
                                    className="rounded-2xl shadow-inner border border-black/5"
                                    style={{ backgroundColor: featured[4].hex }}
                                />
                            </div>
                        </div>

                        {/* Column 2 (Right) */}
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => copyToClipboard(featured[3].hex)}
                            className="rounded-[2rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5"
                            style={{ backgroundColor: featured[3].hex }}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap font-black text-2xl uppercase opacity-20 ${featured[3].isDark ? 'text-white' : 'text-slate-900'}`}>
                                Highlight
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 36-Color Matrix */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">36-Color Extended Matrix</h3>
                    <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-black/5">
                        <div className="flex flex-col gap-2">
                            {matrix.map((row, rIdx) => (
                                <div key={rIdx} className="grid grid-cols-9 gap-2">
                                    {row.map((color, cIdx) => (
                                        <MatrixSwatch
                                            key={`${rIdx}-${cIdx}`}
                                            color={color}
                                            delay={0.1 + (rIdx * 9 + cIdx) * 0.005}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="space-y-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving || saveSuccess}
                    className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-pink-100 transition-all active:scale-[0.98] ${saveSuccess ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                >
                    {isSaving ? <RefreshCw className="animate-spin" /> : saveSuccess ? <Check /> : 'Save to Collection'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowExportMenu(true)}
                        className="py-4 border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-white transition-colors active:scale-95"
                    >
                        <Share2 size={20} /> Export
                    </button>
                    <button
                        onClick={onRegenerate}
                        className="py-4 border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-white transition-colors"
                    >
                        <RefreshCw size={20} /> Regenerate
                    </button>
                </div>
            </div>

            {/* Export Menu Modal */}
            <AnimatePresence>
                {showExportMenu && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExportMenu(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-slate-800">Export Palette</h3>
                                <p className="text-slate-400 text-sm font-medium">Select your preferred format</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => handleExport('w3c')}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors group"
                                >
                                    <span className="font-bold text-slate-700">W3C Design Tokens</span>
                                    <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-slate-500">JSON</span>
                                </button>
                                <button
                                    onClick={() => handleExport('procreate')}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors group"
                                >
                                    <span className="font-bold text-slate-700">Procreate Swatches</span>
                                    <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-slate-500">JSON</span>
                                </button>
                                <button
                                    onClick={() => handleExport('css')}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors group"
                                >
                                    <span className="font-bold text-slate-700">CSS / Sass Variables</span>
                                    <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-slate-500">CSS</span>
                                </button>
                                <button
                                    onClick={() => handleExport('hex')}
                                    className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors group"
                                >
                                    <span className="font-bold text-slate-700">Adobe Hex List</span>
                                    <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-slate-500">TXT</span>
                                </button>
                                <button
                                    onClick={handleImageExport}
                                    className="w-full py-4 px-6 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-between hover:bg-pink-100 transition-colors group"
                                >
                                    <span className="font-bold text-pink-600">Download Image</span>
                                    <Download size={18} className="text-pink-300 group-hover:text-pink-500" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowExportMenu(false)}
                                className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 outline-none"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultsScreen;
