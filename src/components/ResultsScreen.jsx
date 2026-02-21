import React, { useRef, useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Share2, ArrowLeft, Download, Check, MoreVertical, Grid, Monitor, Pipette, Sparkles, Flame, Trophy, Droplets, Brush } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toPng } from 'html-to-image';
import { generateW3CTokens, downloadFile, generateProcreateSwatches, generateCSSVariables, generateHexList } from '../utils/exportUtils';
import UIPlayground from './UIPlayground';
import PaintMixer from './PaintMixer';

const MatrixSwatch = ({ color, delay = 0, onEdit, isCopied }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay }}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        className="aspect-square rounded-lg shadow-sm cursor-pointer relative group flex items-center justify-center border border-black/5 overflow-hidden"
        style={{ backgroundColor: color.hex }}
        title={`${color.name} (${color.hex})`}
    >
        {/* Success Overlay for Swatch */}
        <AnimatePresence>
            {isCopied && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px] ${color.isDark ? 'bg-white/10' : 'bg-black/5'}`}
                >
                    <Check size={14} className={color.isDark ? 'text-white' : 'text-slate-900'} />
                </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute inset-0 flex z-10">
            <div
                className={`flex-1 flex items-center justify-center transition-all 
                    lg:opacity-0 lg:group-hover:opacity-100 
                    opacity-60 hover:opacity-100
                    ${color.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(color.hex); }}
                title="Copy HEX"
            >
                <div className={`p-1.5 rounded-md ${color.isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                    <Copy size={14} className={color.isDark ? 'text-white' : 'text-black'} />
                </div>
            </div>
            <div
                className={`flex-1 flex items-center justify-center transition-all border-l border-white/5
                    lg:opacity-0 lg:group-hover:opacity-100 
                    opacity-60 hover:opacity-100
                    ${color.isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                title="Edit Color"
            >
                <div className={`p-1.5 rounded-md ${color.isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                    <Pipette size={14} className={color.isDark ? 'text-white' : 'text-black'} />
                </div>
            </div>
        </div>
    </motion.div>
);

const CopiedOverlay = ({ show, isDark }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-[2px] ${isDark ? 'bg-white/10' : 'bg-black/5'}`}
            >
                <motion.div
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    className={`flex flex-col items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                    <Check size={28} className="drop-shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Copied!</span>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const MotherColorCard = ({ mother, copiedHex, copyToClipboard, onEdit, isExport = false }) => {
    const CardContainer = isExport ? 'div' : motion.div;
    return (
        <CardContainer
            className={`results-screen__main-card w-full rounded-[3rem] shadow-2xl p-10 md:p-16 flex flex-col items-center text-center space-y-6 relative overflow-hidden group ${isExport ? 'shadow-none border border-black/5' : ''}`}
            style={{ backgroundColor: mother.hex }}
        >
            <div className={`results-screen__main-info space-y-2 ${mother.isDark ? 'text-white' : 'text-slate-900'}`}>
                <h3 className="results-screen__main-hex text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">{mother.hex}</h3>
                <p className="results-screen__main-name text-xl md:text-2xl font-black opacity-90">{mother.name}</p>
            </div>

            {!isExport && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={() => copyToClipboard(mother.hex)}
                        className={`results-screen__main-copy-btn flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all ${mother.isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                            }`}
                    >
                        {copiedHex === mother.hex ? <Check size={22} className="results-screen__copy-icon" /> : <Copy size={22} className="results-screen__copy-icon" />}
                        <span className="results-screen__copy-label">{copiedHex === mother.hex ? 'Copied!' : 'Copy HEX'}</span>
                    </button>

                    <button
                        onClick={onEdit}
                        className={`p-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all ${mother.isDark ? 'bg-white/10 text-white backdrop-blur-md' : 'bg-slate-900/10 text-slate-900 backdrop-blur-md'}`}
                        title="Edit Base Color"
                    >
                        <Pipette size={22} />
                    </button>
                </div>
            )}
        </CardContainer>
    );
};

const BentoGrid = ({ featured, copiedHex, copyToClipboard, onEdit, isExport = false }) => {
    const Card = isExport ? 'div' : motion.div;
    return (
        <div className="results-screen__bento-section space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="results-screen__bento-title text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Harmonious Tones</h3>
                {!isExport && (
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <span>Click Card to Copy</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="flex items-center gap-1 text-pink-400"><Pipette size={10} /> Edit</span>
                    </p>
                )}
            </div>
            <div className={`results-screen__bento-grid grid gap-4 ${isExport ? 'grid-cols-4 h-[400px]' : 'grid-cols-2 md:grid-cols-4 h-[600px] md:h-[400px]'}`}>
                {/* Highlight Card */}
                <Card
                    whileHover={!isExport ? { flex: 1.5 } : {}}
                    onClick={() => !isExport && copyToClipboard(featured[1].hex)}
                    className="results-screen__bento-card col-span-2 md:col-span-1 rounded-[2.5rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5 flex flex-col justify-end p-8"
                    style={{ backgroundColor: featured[1].hex }}
                >
                    {!isExport && <div className="results-screen__bento-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />}
                    {!isExport && <CopiedOverlay show={copiedHex === featured[1].hex} isDark={featured[1].isDark} />}

                    {!isExport && (
                        <div className="absolute top-6 left-6 transition-all lg:opacity-0 lg:group-hover:opacity-40 opacity-40 z-10">
                            <div className={`p-2 rounded-xl ${featured[1].isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                                <Copy size={16} className={featured[1].isDark ? 'text-white' : 'text-black'} />
                            </div>
                        </div>
                    )}

                    {!isExport && (
                        <div
                            className="absolute top-6 right-6 p-3 rounded-2xl transition-all lg:bg-black/0 lg:hover:bg-black/10 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 bg-white/10 backdrop-blur-sm z-20"
                            onClick={(e) => { e.stopPropagation(); onEdit(1, featured[1].hex); }}
                            title="Edit Color"
                        >
                            <Pipette size={20} className={featured[1].isDark ? 'text-white' : 'text-black'} />
                        </div>
                    )}
                    <div className={`results-screen__bento-content relative z-10 ${featured[1].isDark ? 'text-white' : 'text-slate-900'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Highlight</p>
                        <h4 className="font-black text-xl uppercase">{featured[1].hex}</h4>
                    </div>
                </Card>

                <div className="results-screen__bento-subgrid col-span-1 grid grid-rows-2 gap-4">
                    {/* Muted Card */}
                    <Card
                        onClick={() => !isExport && copyToClipboard(featured[2].hex)}
                        className="results-screen__bento-card rounded-[2rem] shadow-inner border border-black/5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-end p-6 group relative overflow-hidden"
                        style={{ backgroundColor: featured[2].hex }}
                    >
                        {!isExport && <CopiedOverlay show={copiedHex === featured[2].hex} isDark={featured[2].isDark} />}

                        {!isExport && (
                            <div className="absolute top-4 left-4 transition-all lg:opacity-0 lg:group-hover:opacity-40 opacity-40 z-10">
                                <div className={`p-1.5 rounded-lg ${featured[2].isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                                    <Copy size={12} className={featured[2].isDark ? 'text-white' : 'text-black'} />
                                </div>
                            </div>
                        )}

                        {!isExport && (
                            <div
                                className="absolute top-4 right-4 p-2 rounded-xl transition-all lg:bg-black/0 lg:hover:bg-black/10 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 bg-white/10 backdrop-blur-sm z-20"
                                onClick={(e) => { e.stopPropagation(); onEdit(2, featured[2].hex); }}
                                title="Edit Color"
                            >
                                <Pipette size={14} className={featured[2].isDark ? 'text-white' : 'text-black'} />
                            </div>
                        )}
                        <div className={`results-screen__bento-content relative z-10 ${featured[2].isDark ? 'text-white' : 'text-slate-900'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Muted</p>
                            <h4 className="font-black text-xs uppercase">{featured[2].hex}</h4>
                        </div>
                    </Card>
                    {/* Accent Card */}
                    <Card
                        onClick={() => !isExport && copyToClipboard(featured[4].hex)}
                        className="results-screen__bento-card rounded-[2rem] shadow-inner border border-black/5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-end p-6 group relative overflow-hidden"
                        style={{ backgroundColor: featured[4].hex }}
                    >
                        {!isExport && <CopiedOverlay show={copiedHex === featured[4].hex} isDark={featured[4].isDark} />}

                        {!isExport && (
                            <div className="absolute top-4 left-4 transition-all lg:opacity-0 lg:group-hover:opacity-40 opacity-40 z-10">
                                <div className={`p-1.5 rounded-lg ${featured[4].isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                                    <Copy size={12} className={featured[4].isDark ? 'text-white' : 'text-black'} />
                                </div>
                            </div>
                        )}

                        {!isExport && (
                            <div
                                className="absolute top-4 right-4 p-2 rounded-xl transition-all lg:bg-black/0 lg:hover:bg-black/10 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 bg-white/10 backdrop-blur-sm z-20"
                                onClick={(e) => { e.stopPropagation(); onEdit(4, featured[4].hex); }}
                                title="Edit Color"
                            >
                                <Pipette size={14} className={featured[4].isDark ? 'text-white' : 'text-black'} />
                            </div>
                        )}
                        <div className={`results-screen__bento-content relative z-10 ${featured[4].isDark ? 'text-white' : 'text-slate-900'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Accent</p>
                            <h4 className="font-black text-xs uppercase">{featured[4].hex}</h4>
                        </div>
                    </Card>
                </div>

                {/* Deep Shade Card */}
                <Card
                    onClick={() => !isExport && copyToClipboard(featured[3].hex)}
                    className="results-screen__bento-card col-span-1 md:col-span-2 rounded-[2.5rem] shadow-inner relative group cursor-pointer overflow-hidden border border-black/5 flex items-center justify-center p-8"
                    style={{ backgroundColor: featured[3].hex }}
                >
                    {!isExport && <div className="results-screen__bento-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />}
                    {!isExport && <CopiedOverlay show={copiedHex === featured[3].hex} isDark={featured[3].isDark} />}

                    {!isExport && (
                        <div className="absolute top-8 left-8 transition-all lg:opacity-0 lg:group-hover:opacity-40 opacity-40 z-10">
                            <div className={`p-4 rounded-[1.5rem] ${featured[3].isDark ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm lg:bg-transparent`}>
                                <Copy size={24} className={featured[3].isDark ? 'text-white' : 'text-black'} />
                            </div>
                        </div>
                    )}

                    {!isExport && (
                        <div
                            className="absolute top-8 right-8 p-4 rounded-[1.5rem] transition-all lg:bg-black/0 lg:hover:bg-black/10 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 bg-white/10 backdrop-blur-sm z-20"
                            onClick={(e) => { e.stopPropagation(); onEdit(3, featured[3].hex); }}
                            title="Edit Color"
                        >
                            <Pipette size={24} className={featured[3].isDark ? 'text-white' : 'text-black'} />
                        </div>
                    )}
                    <div className={`results-screen__bento-content text-center relative z-10 ${featured[3].isDark ? 'text-white' : 'text-slate-900'}`}>
                        <h4 className="font-black text-2xl md:text-4xl uppercase tracking-tighter mb-1">{featured[3].hex}</h4>
                        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Deep Shade</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ExtendedMatrix = ({ matrix, copiedHex, onEdit, isExport = false }) => (
    <div className={`results-screen__matrix-section space-y-6 ${isExport ? 'pt-8' : 'pt-4'}`}>
        <h3 className="results-screen__matrix-title text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-2">36-Color Extended Matrix</h3>
        <div className={`results-screen__matrix-container bg-white rounded-[3rem] border border-slate-100 ${isExport ? 'p-10 shadow-none' : 'p-6 md:p-10 shadow-sm'}`}>
            <div className={`results-screen__matrix-grid grid gap-3 ${isExport ? 'grid-cols-9' : 'grid-cols-4 md:grid-cols-9'}`}>
                {matrix.flat().map((color, idx) => {
                    const rIdx = Math.floor(idx / 9);
                    const cIdx = idx % 9;
                    return (
                        isExport ? (
                            <div
                                key={idx}
                                className="aspect-square rounded-lg border border-black/5"
                                style={{ backgroundColor: color.hex }}
                                title={color.hex}
                            />
                        ) : (
                            <MatrixSwatch
                                key={`${rIdx}-${cIdx}`}
                                color={color}
                                delay={0.1 + idx * 0.005}
                                onEdit={() => onEdit(rIdx, cIdx, color.hex)}
                                isCopied={copiedHex === color.hex}
                            />
                        )
                    );
                })}
            </div>
        </div>
    </div>
);

const ResultsScreen = ({ paletteData, currentMode, onRegenerate, onModeChange, onUpdateColor, onBack }) => {
    const exportRef = useRef(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'ui'
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedHex, setCopiedHex] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [editingColor, setEditingColor] = useState(null); // { type, index, hex }
    const { user } = useAuth();

    if (!paletteData) return null;

    const { featured, matrix } = paletteData;
    const mother = featured[0];

    const copyToClipboard = (hex) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    const handleColorChange = (newHex) => {
        if (!editingColor) return;
        setEditingColor({ ...editingColor, hex: newHex });
        onUpdateColor(editingColor.type, editingColor.index, newHex);
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
            // Increased delay to ensure the hidden DOM is fully painted and 
            // no animations are in progress
            await new Promise(resolve => setTimeout(resolve, 200));

            const dataUrl = await toPng(exportRef.current, {
                quality: 1,
                backgroundColor: '#F8FAFC',
                style: {
                    borderRadius: '0',
                },
                pixelRatio: 2,
                width: 1000,
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
                isPublic: true,
                likes: 0,
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
                            <button
                                onClick={() => setViewMode('mix')}
                                className={`results-screen__toggle-btn flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all ${viewMode === 'mix' ? 'results-screen__toggle-btn--active bg-violet-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Brush size={18} className="results-screen__toggle-icon" />
                                <span className="results-screen__toggle-label">Mix</span>
                            </button>
                        </div>
                    </div>

                    {/* Hidden Export View - Using height:0/overflow:hidden for best layout calculation */}
                    <div style={{ height: 0, overflow: 'hidden', position: 'relative', width: '1000px' }}>
                        <div
                            ref={exportRef}
                            style={{
                                width: '1000px',
                                backgroundColor: '#F8FAFC',
                                padding: '60px',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                zIndex: -100
                            }}
                        >
                            <div className="space-y-8">
                                <div className="text-center space-y-2 mb-10">
                                    <h1 className="text-4xl font-black text-slate-900 capitalize">{paletteData.mode} Palette</h1>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-500">Huephoria v2 Professional</p>
                                </div>
                                <MotherColorCard mother={mother} isExport={true} />
                                <BentoGrid featured={featured} isExport={true} />
                                <ExtendedMatrix matrix={matrix} isExport={true} />
                                <div className="pt-10 text-center opacity-30">
                                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Created with Huephoria Mixer Studio</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-8"
                                >
                                    <MotherColorCard
                                        mother={mother}
                                        copiedHex={copiedHex}
                                        copyToClipboard={copyToClipboard}
                                        onEdit={() => setEditingColor({ type: 'featured', index: 0, hex: mother.hex })}
                                    />
                                    <BentoGrid
                                        featured={featured}
                                        copiedHex={copiedHex}
                                        copyToClipboard={copyToClipboard}
                                        onEdit={(index, hex) => setEditingColor({ type: 'featured', index, hex })}
                                    />
                                </motion.div>
                            ) : viewMode === 'ui' ? (
                                <motion.div
                                    key="ui"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <UIPlayground paletteData={paletteData} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="mix"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PaintMixer paletteData={paletteData} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 36-Color Matrix (Visible only in Palette view) */}
                    {viewMode === 'grid' && (
                        <ExtendedMatrix
                            matrix={matrix}
                            copiedHex={copiedHex}
                            onEdit={(r, c, hex) => setEditingColor({ type: 'matrix', index: [r, c], hex })}
                        />
                    )}
                </div>

                {/* Sidebar Column: Actions */}
                <aside className="results-screen__sidebar lg:col-span-4 space-y-8 mt-12 lg:mt-0 lg:sticky lg:top-8">
                    <div className="results-screen__sidebar-card bg-white rounded-[3rem] p-8 shadow-xl border border-slate-50 space-y-6">
                        <div className="results-screen__sidebar-header space-y-1">
                            <h4 className="results-screen__sidebar-title font-black text-xl text-slate-800">Palette Actions</h4>
                            <p className="results-screen__sidebar-desc text-slate-400 text-sm font-bold">Save or export your creation</p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="results-screen__mode-switcher space-y-3 pb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Harmony Logic</p>
                            <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {[
                                    { id: 'vibrant', icon: Sparkles },
                                    { id: 'monochrome', icon: Droplets },
                                    { id: 'analogous', icon: Flame },
                                    { id: 'tetradic', icon: Trophy },
                                    { id: 'quadratic', icon: Sparkles },
                                ].map((m) => {
                                    const Icon = m.icon;
                                    const isActive = currentMode === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => onModeChange(m.id)}
                                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-300 hover:text-slate-500'}`}
                                            title={m.id.charAt(0).toUpperCase() + m.id.slice(1)}
                                        >
                                            <Icon size={18} />
                                        </button>
                                    );
                                })}
                            </div>
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
                            <div
                                className="results-screen__mother-box flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all group"
                                onClick={() => copyToClipboard(mother.hex)}
                            >
                                <div
                                    className="results-screen__mother-swatch w-12 h-12 rounded-2xl shadow-sm border border-black/5"
                                    style={{ backgroundColor: mother.hex }}
                                />
                                <div className="results-screen__mother-info flex-1">
                                    <p className="results-screen__mother-label text-[10px] font-black uppercase tracking-widest text-slate-400">Current Base</p>
                                    <p className="results-screen__mother-hex font-black text-slate-700 uppercase">{mother.hex}</p>
                                </div>
                                <div
                                    className="p-2 rounded-xl hover:bg-slate-200 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setEditingColor({ type: 'featured', index: 0, hex: mother.hex }); }}
                                >
                                    <Pipette className="results-screen__mother-icon text-slate-400 hover:text-pink-500 transition-colors" size={20} />
                                </div>
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

            {/* Color Picker Modal */}
            <AnimatePresence>
                {editingColor && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingColor(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-[280px] bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 flex flex-col items-center"
                        >
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Refine Color</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Adjustment</p>
                            </div>

                            <div className="custom-color-picker w-full">
                                <HexColorPicker
                                    color={editingColor.hex}
                                    onChange={handleColorChange}
                                    style={{ width: '100%', height: '200px' }}
                                />
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: editingColor.hex }} />
                                    <input
                                        type="text"
                                        value={editingColor.hex.toUpperCase()}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className="bg-transparent font-black text-slate-700 uppercase w-full outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setEditingColor(null)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-colors shadow-xl active:scale-95"
                                >
                                    Done Adjusting
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultsScreen;
