import React, { useState, useRef, useMemo } from 'react';
import { Sparkles, Trophy, Flame, Pipette, Droplets, Palette, User, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePalette } from '../utils/colorLogic';

const HomeScreen = ({ motherColor, setMotherColor, onGenerate, mode, setMode }) => {
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
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-8">
            {/* Hero Section */}
            <div className="relative flex flex-col items-center">
                {/* Massive decorative pink circular container */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-pink-100/50 rounded-full blur-2xl -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-pink-50 rounded-full -z-10 border border-pink-100" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-white shadow-xl flex items-center justify-center p-4 border-8 border-white"
                >
                    {/* Floating accent circles (Dynamic) */}
                    <motion.div
                        animate={{ backgroundColor: previewColors.lowlight }}
                        className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full border-4 border-white shadow-sm transition-colors duration-500"
                    />
                    <motion.div
                        animate={{ backgroundColor: previewColors.highlight }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-sm transition-colors duration-500"
                    />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current.click()}
                        className="w-full h-full rounded-full cursor-pointer shadow-inner relative group flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: motherColor }}
                    >
                        <input
                            type="color"
                            ref={fileInputRef}
                            className="sr-only"
                            value={motherColor}
                            onChange={(e) => setMotherColor(e.target.value)}
                        />
                        {/* Smaller pink circle with white eyedropper icon as trigger */}
                        <div className="absolute inset-x-0 bottom-0 top-0 m-auto w-12 h-12 bg-pink-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white transform group-hover:scale-110 transition-transform">
                            <Pipette className="text-white" size={20} />
                        </div>

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Mode Selection */}
            <div className="w-full px-4 space-y-3">
                <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Generation Mode</p>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                    {modes.map((m) => {
                        const Icon = m.icon;
                        const isActive = mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-gray-50'}`}
                            >
                                <Icon size={18} />
                                <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{m.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Primary CTA */}
            <div className="w-full space-y-4 px-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGenerate}
                    className="w-full py-5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xl font-bold shadow-xl shadow-pink-200 flex items-center justify-center gap-3"
                >
                    <Sparkles size={24} />
                    Generate Palette
                </motion.button>
                <p className="text-center text-slate-400 text-sm font-medium">
                    Create custom harmonies in one click
                </p>
            </div>

            {/* Trending Section */}
            <div className="w-full space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-lg text-slate-800">Trending Palettes</h3>
                    <button className="text-pink-500 text-sm font-semibold hover:underline">View All</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {trendingPalettes.map((palette) => (
                        <motion.div
                            key={palette.id}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: palette.id * 0.1 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                        >
                            {/* Card Header (Avatar + Title + Menu) */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 shadow-sm overflow-hidden">
                                        <User size={14} className="text-pink-600" />
                                    </div>
                                    <h4 className="font-bold text-slate-700 text-sm">{palette.name}</h4>
                                </div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-gray-50 transition-colors">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Horizontal Swatches */}
                            <div className="flex h-16 w-full mt-auto">
                                {palette.colors.map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 h-full hover:flex-[1.5] transition-all duration-300"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
