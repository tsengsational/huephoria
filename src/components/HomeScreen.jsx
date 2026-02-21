import React, { useState, useRef, useMemo } from 'react';
import { Sparkles, Trophy, Flame, Pipette, Droplets, Palette, User, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { generatePalette } from '../utils/colorLogic';

const HomeScreen = ({ motherColor, setMotherColor, onGenerate, mode, setMode }) => {
    const [showPicker, setShowPicker] = useState(false);
    const fileInputRef = useRef(null);

    // Calculate preview colors based on current selection
    const previewColors = useMemo(() => {
        try {
            const data = generatePalette(motherColor, mode);
            return {
                highlight: data.featured[1].hex,
                lowlight: data.featured[3].hex
            };
        } catch (e) {
            return { highlight: '#86EFAC', lowlight: '#FDE047' }; // Fallbacks
        }
    }, [motherColor, mode]);

    const modes = [
        { id: 'vibrant', label: 'Vibrant', icon: Sparkles },
        { id: 'monochrome', label: 'Mono', icon: Droplets },
        { id: 'analogous', label: 'Analog', icon: Flame },
        { id: 'tetradic', label: 'Tetrad', icon: Trophy },
        { id: 'quadratic', label: 'Quad', icon: Sparkles },
    ];

    const trendingPalettes = [
        { id: 1, name: "Sunset Dreams", colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#F47C7C"] },
        { id: 2, name: "Minty Fresh", colors: ["#00F5FF", "#7161EF", "#FF595E", "#FFCA3A", "#8AC926"] },
        { id: 3, name: "Candy Crush", colors: ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"] },
    ];

    return (
        <div className="flex-1 flex flex-col space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* Left Column: Hero & Mode & CTA */}
                <div className="space-y-12 flex flex-col items-center">
                    {/* Hero Section */}
                    <div className="relative flex flex-col items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-pink-100/50 rounded-full blur-3xl -z-10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] bg-pink-50 rounded-full -z-10 border border-pink-100" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-48 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full bg-white shadow-2xl flex items-center justify-center p-4 border-8 border-white"
                        >
                            <motion.div
                                animate={{ backgroundColor: previewColors.lowlight }}
                                className="absolute -bottom-2 -left-2 w-12 h-12 lg:w-20 lg:h-20 rounded-full border-4 border-white shadow-lg transition-colors duration-500"
                            />
                            <motion.div
                                animate={{ backgroundColor: previewColors.highlight }}
                                className="absolute -top-2 -right-2 w-8 h-8 lg:w-16 lg:h-16 rounded-full border-4 border-white shadow-lg transition-colors duration-500"
                            />

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPicker(true)}
                                className="w-full h-full rounded-full cursor-pointer shadow-inner relative group flex items-center justify-center overflow-hidden"
                                style={{ backgroundColor: motherColor }}
                            >
                                <div className="absolute inset-x-0 bottom-0 top-0 m-auto w-12 h-12 lg:w-16 lg:h-16 bg-pink-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white transform group-hover:scale-110 transition-transform">
                                    <Pipette className="text-white" size={20} />
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Mode Selection */}
                    <div className="w-full max-w-sm lg:max-w-md space-y-4 px-4">
                        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Generation Mode</p>
                        <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-1.5">
                            {modes.map((m) => {
                                const Icon = m.icon;
                                const isActive = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${isActive ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Icon size={18} />
                                        <span className={`text-[10px] font-black uppercase ${isActive ? 'text-white' : 'text-slate-500'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <div className="w-full max-w-sm lg:max-w-md space-y-4 px-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onGenerate}
                            className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xl font-black shadow-2xl shadow-pink-100 flex items-center justify-center gap-4 transition-all"
                        >
                            <Sparkles size={24} />
                            Generate Palette
                        </motion.button>
                        <p className="text-center text-slate-400 text-sm font-bold opacity-60">
                            Create custom harmonies in one click
                        </p>
                    </div>
                </div>

                {/* Right Column: Trending */}
                <div className="space-y-8 px-4 lg:px-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight">Trending Palettes</h3>
                        <button className="text-pink-500 text-sm font-black uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        {trendingPalettes.map((palette) => (
                            <motion.div
                                key={palette.id}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: palette.id * 0.1 }}
                                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col"
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm overflow-hidden text-pink-500">
                                            <User size={16} />
                                        </div>
                                        <h4 className="font-black text-slate-700">{palette.name}</h4>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-gray-50 transition-colors">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                <div className="flex h-16 w-full mt-auto">
                                    {palette.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 h-full hover:flex-[1.5] transition-all duration-500"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Color Picker Modal */}
            <AnimatePresence>
                {showPicker && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPicker(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 custom-color-picker"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-slate-800">Select Color</h3>
                                <button
                                    onClick={() => setShowPicker(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <HexColorPicker color={motherColor} onChange={setMotherColor} />

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <div
                                        className="w-12 h-12 rounded-2xl shadow-sm border border-black/5"
                                        style={{ backgroundColor: motherColor }}
                                    />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hex Code</p>
                                        <input
                                            type="text"
                                            value={motherColor}
                                            onChange={(e) => setMotherColor(e.target.value)}
                                            className="w-full bg-transparent font-bold text-lg text-slate-700 outline-none"
                                        />
                                    </div>
                                    <Check className="text-pink-500" size={20} />
                                </div>

                                <button
                                    onClick={() => setShowPicker(false)}
                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                                >
                                    Confirm Selection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomeScreen;
