import React, { useRef, useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Share2, ArrowLeft, Download, Check, MoreVertical, Grid, Monitor, Pipette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
import { generateW3CTokens, downloadFile, generateProcreateSwatches, generateCSSVariables, generateHexList } from '../utils/exportUtils';
import UIPlayground from './UIPlayground';

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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'ui'
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
        const baseName = `palettable-${mother.hex.replace('#', '')}-${viewMode}`;
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
        <div className="results-screen flex-1 flex flex-col space-y-8">
            {/* Header */}
            <header className="results-screen__header flex items-center justify-between">
                <button onClick={onBack} className="results-screen__back-btn p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 flex items-center gap-2 font-bold text-slate-500">
                    <ArrowLeft size={20} className="results-screen__back-icon" />
                    <span className="results-screen__back-label hidden sm:inline">Back</span>
                </button>
                <div className="results-screen__title-box text-center">
                    <h2 className="results-screen__title text-2xl font-black text-slate-900 tracking-tight capitalize">{paletteData.mode} Palette</h2>
                    <p className="results-screen__subtitle text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Huephoria Engine v2</p>
                </div>
                <div className="results-screen__header-right flex gap-2">
                    <button className="results-screen__action-trigger p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                        <Share2 size={20} className="text-slate-400" />
                    </button>
                    <button className="results-screen__action-trigger p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                        <MoreVertical size={20} className="text-slate-400" />
                    </button>
                </div>
            </header>

            <div className="results-screen__main-layout lg:grid lg:grid-cols-12 lg:gap-12 items-start">
                {/* Main Content Area */}
                <div className="results-screen__content-area lg:col-span-8 space-y-8">
                    {/* View Mode Toggle */}
                    <div className="results-screen__view-toggle flex justify-center lg:justify-start">
                        <div className="results-screen__toggle-container bg-slate-100 p-1.5 rounded-[2rem] flex gap-1 shadow-inner border border-slate-200/50">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`results-screen__toggle-btn flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all ${viewMode === 'grid' ? 'results-screen__toggle-btn--active bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid size={18} className="results-screen__toggle-icon" />
                                <span className="results-screen__toggle-label">Palette</span>
                            </button>
                            <button
                                onClick={() => setViewMode('ui')}
                                className={`results-screen__toggle-btn flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all ${viewMode === 'ui' ? 'results-screen__toggle-btn--active bg-pink-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Monitor size={18} className="results-screen__toggle-icon" />
                                <span className="results-screen__toggle-label">UI Preview</span>
                            </button>
                        </div>
                    </div>

                    <div ref={exportRef}>
                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    {/* MOTHER COLOR Card */}
                                    <motion.div
                                        className="results-screen__main-card w-full rounded-[3rem] shadow-2xl p-10 md:p-16 flex flex-col items-center text-center space-y-6 relative overflow-hidden group"
                                        style={{ backgroundColor: mother.hex }}
                                    >
                                        <div className="results-screen__main-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-700" />

                                        <div className={`results-screen__main-info space-y-2 ${mother.isDark ? 'text-white' : 'text-slate-900'}`}>
                                            <h3 className="results-screen__main-hex text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">{mother.hex}</h3>
                                            <p className="results-screen__main-name text-xl md:text-2xl font-black opacity-90">{mother.name}</p>
                                        </div>

                                        <button
                                            onClick={() => copyToClipboard(mother.hex)}
                                            className={`results-screen__main-copy-btn flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all ${mother.isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                                                }`}
                                        >
                                            {copiedHex === mother.hex ? <Check size={22} className="results-screen__copy-icon" /> : <Copy size={22} className="results-screen__copy-icon" />}
                                            <span className="results-screen__copy-label">{copiedHex === mother.hex ? 'Copied!' : 'Copy HEX'}</span>
                                        </button>
                                    </motion.div>

                                    {/* HARMONIOUS TONES Bento Grid */}
                                    <div className="results-screen__bento-section space-y-6">
                                        <h3 className="results-screen__bento-title text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-2">Harmonious Tones</h3>
                                        <div className="results-screen__bento-grid grid grid-cols-2 md:grid-cols-4 gap-4 h-[500px] md:h-[300px]">
                                            <motion.div
                                                whileHover={{ flex: 1.5 }}
                                                onClick={() => copyToClipboard(featured[1].hex)}
                                                className="results-screen__bento-card col-span-2 md:col-span-1 rounded-[2.5rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5"
                                                style={{ backgroundColor: featured[1].hex }}
                                            >
                                                <div className="results-screen__bento-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                <div className={`results-screen__bento-hex absolute bottom-6 left-6 font-black text-sm ${featured[1].isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {featured[1].hex}
                                                </div>
                                            </motion.div>

                                            <div className="results-screen__bento-subgrid col-span-1 grid grid-rows-2 gap-4">
                                                <motion.div
                                                    onClick={() => copyToClipboard(featured[2].hex)}
                                                    className="results-screen__bento-card rounded-[2rem] shadow-inner border border-black/5 cursor-pointer hover:scale-[1.02] transition-transform"
                                                    style={{ backgroundColor: featured[2].hex }}
                                                />
                                                <motion.div
                                                    onClick={() => copyToClipboard(featured[4].hex)}
                                                    className="results-screen__bento-card rounded-[2rem] shadow-inner border border-black/5 cursor-pointer hover:scale-[1.02] transition-transform"
                                                    style={{ backgroundColor: featured[4].hex }}
                                                />
                                            </div>

                                            <motion.div
                                                onClick={() => copyToClipboard(featured[3].hex)}
                                                className="results-screen__bento-card col-span-1 md:col-span-2 rounded-[2.5rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5"
                                                style={{ backgroundColor: featured[3].hex }}
                                            >
                                                <div className="results-screen__bento-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                <div className={`results-screen__bento-label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-3xl md:text-5xl uppercase tracking-tighter opacity-15 ${featured[3].isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    Highlight
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ui"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <UIPlayground paletteData={paletteData} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 36-Color Matrix */}
                    <div className="results-screen__matrix-section space-y-6 pt-4">
                        <h3 className="results-screen__matrix-title text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-2">36-Color Extended Matrix</h3>
                        <div className="results-screen__matrix-container bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
                            <div className="results-screen__matrix-grid flex flex-col gap-3">
                                {matrix.map((row, rIdx) => (
                                    <div key={rIdx} className="results-screen__matrix-row grid grid-cols-9 gap-3">
                                        {row.map((color, cIdx) => (
                                            <MatrixSwatch
                                                key={`${rIdx}-${cIdx}`}
                                                color={color}
                                                delay={0.1 + (rIdx * 9 + cIdx) * 0.005}
                                                className="results-screen__matrix-swatch"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column: Actions */}
                <aside className="results-screen__sidebar lg:col-span-4 space-y-8 mt-12 lg:mt-0 lg:sticky lg:top-8">
                    <div className="results-screen__sidebar-card bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50 space-y-6">
                        <div className="results-screen__sidebar-header space-y-1">
                            <h4 className="results-screen__sidebar-title font-black text-xl text-slate-800">Palette Actions</h4>
                            <p className="results-screen__sidebar-desc text-slate-400 text-sm font-bold">Save or export your creation</p>
                        </div>

                        <div className="results-screen__action-group space-y-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || saveSuccess}
                                className={`results-screen__action-btn w-full py-6 rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${saveSuccess ? 'results-screen__action-btn--success bg-green-500 text-white shadow-green-100' : 'results-screen__action-btn--primary bg-pink-500 text-white hover:bg-pink-600 shadow-pink-100'
                                    }`}
                            >
                                {isSaving ? <RefreshCw className="results-screen__action-icon animate-spin" /> : saveSuccess ? <Check size={24} className="results-screen__action-icon" /> : <Save size={24} className="results-screen__action-icon" />}
                                <span className="results-screen__action-label">{isSaving ? 'Saving...' : saveSuccess ? 'Saved to collection' : 'Save to Collection'}</span>
                            </button>

                            <button
                                onClick={() => setShowExportMenu(true)}
                                className="results-screen__action-btn results-screen__action-btn--secondary w-full py-5 rounded-[2rem] border-2 border-slate-100 flex items-center justify-center gap-3 font-black text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                            >
                                <Download size={24} className="results-screen__action-icon text-pink-500" />
                                <span className="results-screen__action-label">Professional Export</span>
                            </button>

                            <button
                                onClick={onRegenerate}
                                className="results-screen__action-btn results-screen__action-btn--secondary w-full py-5 rounded-[2rem] border-2 border-slate-100 flex items-center justify-center gap-3 font-black text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                            >
                                <RefreshCw size={24} className="results-screen__action-icon text-slate-300" />
                                <span className="results-screen__action-label">Generate New</span>
                            </button>
                        </div>

                        <div className="results-screen__mother-preview pt-6 border-t border-slate-100">
                            <div className="results-screen__mother-box flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <div
                                    className="results-screen__mother-swatch w-12 h-12 rounded-2xl shadow-sm border border-black/5"
                                    style={{ backgroundColor: mother.hex }}
                                />
                                <div className="results-screen__mother-info flex-1">
                                    <p className="results-screen__mother-label text-[10px] font-black uppercase tracking-widest text-slate-400">Current Base</p>
                                    <p className="results-screen__mother-hex font-black text-slate-700 uppercase">{mother.hex}</p>
                                </div>
                                <Pipette className="results-screen__mother-icon text-slate-300" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="results-screen__protip-card bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 text-white space-y-4 shadow-2xl">
                        <div className="results-screen__protip-icon-box w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Sparkles className="results-screen__protip-icon text-pink-400" size={24} />
                        </div>
                        <div className="results-screen__protip-content space-y-2">
                            <h5 className="results-screen__protip-title font-black text-xl">Pro Tip</h5>
                            <p className="results-screen__protip-text text-slate-400 text-sm font-medium leading-relaxed">
                                Use the <span className="results-screen__protip-highlight text-pink-400 font-bold">UI Preview</span> mode to see how this exact palette adapts to buttons, typography, and card headers in a real dashboard.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Export Menu Modal */}
            <AnimatePresence>
                {showExportMenu && (
                    <div className="results-screen__export-modal fixed inset-0 z-[60] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExportMenu(false)}
                            className="results-screen__export-overlay absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="results-screen__export-container relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6"
                        >
                            <div className="results-screen__export-header text-center space-y-2">
                                <h3 className="results-screen__export-title text-2xl font-black text-slate-800">Export Palette</h3>
                                <p className="results-screen__export-subtitle text-slate-400 text-sm font-medium">Select your preferred format</p>
                            </div>

                            <div className="results-screen__export-list grid grid-cols-1 gap-3">
                                {[
                                    { id: 'w3c', label: 'W3C Design Tokens', format: 'JSON' },
                                    { id: 'procreate', label: 'Procreate Swatches', format: 'JSON' },
                                    { id: 'css', label: 'CSS / Sass Variables', format: 'CSS' },
                                    { id: 'hex', label: 'Adobe Hex List', format: 'TXT' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleExport(option.id)}
                                        className="results-screen__export-option w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors group"
                                    >
                                        <span className="results-screen__export-label font-bold text-slate-700">{option.label}</span>
                                        <span className="results-screen__export-format text-[10px] font-black uppercase text-slate-300 group-hover:text-slate-500">{option.format}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleImageExport}
                                    className="results-screen__export-option results-screen__export-option--image w-full py-4 px-6 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-between hover:bg-pink-100 transition-colors group"
                                >
                                    <span className="results-screen__export-label font-bold text-pink-600">Download Image</span>
                                    <Download size={18} className="results-screen__export-icon text-pink-300 group-hover:text-pink-500" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowExportMenu(false)}
                                className="results-screen__export-cancel w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 outline-none"
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
