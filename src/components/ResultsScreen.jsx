import React, { useRef, useState } from 'react';
import { Copy, RefreshCw, Save, Share2, ArrowLeft, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';

const ColorBlock = ({ color, className, delay = 0 }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className={`group relative p-4 rounded-3xl shadow-sm border border-black/5 flex flex-col justify-end transition-all hover:shadow-md ${className}`}
        style={{ backgroundColor: color.hex }}
    >
        <div className={`space-y-0.5 ${color.isDark ? 'text-white' : 'text-black/70'}`}>
            <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer" onClick={() => navigator.clipboard.writeText(color.hex)}>
                <Copy size={12} /> {color.hex}
            </span>
            <h4 className="font-bold text-lg truncate leading-tight">{color.name}</h4>
        </div>
    </motion.div>
);

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

    if (!paletteData) return null;

    const { featured, matrix } = paletteData;
    const [mother] = featured;

    const handleExport = async () => {
        if (exportRef.current === null) return;

        setIsExporting(true);
        try {
            const element = exportRef.current;
            const width = element.scrollWidth;
            const height = element.scrollHeight;

            const dataUrl = await toPng(element, {
                cacheBust: true,
                width: width,
                height: height,
                backgroundColor: '#F9FAFB'
            });

            const link = document.createElement('a');
            link.download = `huephoria-palette-${mother.hex.replace('#', '')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
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
                <h2 className="font-bold text-xl text-slate-800">Color Palette</h2>
            </div>

            <div ref={exportRef} className="bg-gray-50 overflow-hidden">
                <div className="p-10 space-y-10">
                    {/* Top Card (Mother Color) */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full aspect-[2/1] rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col items-center justify-center text-center p-8 transition-transform"
                        style={{ backgroundColor: mother.hex }}
                    >
                        <div className={`space-y-2 ${mother.isDark ? 'text-white' : 'text-slate-900'}`}>
                            <span className="text-4xl font-black tracking-tighter sm:text-5xl">{mother.hex}</span>
                            <p className="text-lg font-medium opacity-80 uppercase tracking-widest">{mother.name}</p>
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(mother.hex)}
                            className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-lg border transition-all ${mother.isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'}`}
                        >
                            <Copy size={20} />
                        </button>
                    </motion.div>

                    {/* The 36-Color Matrix View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-slate-700">36-Color Matrix</h3>
                            <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Generated Curve</span>
                        </div>

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

                    {/* Featured Selections (Small Bento Grid) */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-700 px-1">Featured Harmony</h3>
                        <div className="grid grid-cols-2 gap-4 h-[260px]">
                            {featured.slice(1).map((color, idx) => (
                                <ColorBlock
                                    key={idx}
                                    color={color}
                                    className={idx === 0 ? "row-span-2" : idx === 3 ? "col-span-1" : ""}
                                    delay={0.5 + idx * 0.1}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={onRegenerate}
                    className="flex-1 py-5 rounded-full bg-white border border-gray-200 text-slate-600 font-bold shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <RefreshCw size={22} />
                    Regenerate
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-[2] py-5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-lg font-bold shadow-xl shadow-pink-200 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
                >
                    {isExporting ? <RefreshCw className="animate-spin" size={24} /> : <Download size={24} />}
                    {isExporting ? 'Exporting...' : 'Export as PNG'}
                </button>
            </div>
        </div>
    );
};

export default ResultsScreen;
