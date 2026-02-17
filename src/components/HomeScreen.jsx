import React, { useState, useRef } from 'react';
import { Sparkles, Trophy, Flame, Pipette } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeScreen = ({ motherColor, setMotherColor, onGenerate }) => {
    const fileInputRef = useRef(null);

    const trendingPalettes = [
        { id: 1, name: "Sunset Dreams", colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#F47C7C"] },
        { id: 2, name: "Minty Fresh", colors: ["#00F5FF", "#7161EF", "#FF595E", "#FFCA3A", "#8AC926"] },
        { id: 3, name: "Candy Crush", colors: ["#F94144", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D"] },
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-8">
            {/* Hero Interaction */}
            <div className="relative">
                {/* Massive circular container decoration */}
                <div className="absolute inset-0 bg-pink-100 rounded-full scale-150 blur-3xl opacity-30 -z-10" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-2xl flex items-center justify-center p-8 border-4 border-white"
                >
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Pipette className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" size={48} />
                        </div>
                        {/* Visual indicator when not hovered */}
                        <div className="absolute bottom-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/30">
                            Mother Color
                        </div>
                    </motion.div>
                </motion.div>
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
            <div className="w-full space-y-6 pt-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-lg text-slate-800">Trending Palettes</h3>
                    <button className="text-pink-500 text-sm font-semibold hover:underline">View All</button>
                </div>

                <div className="space-y-4">
                    {trendingPalettes.map((palette) => (
                        <motion.div
                            key={palette.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: palette.id * 0.1 }}
                            className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex -space-x-2">
                                {palette.colors.slice(0, 3).map((col, idx) => (
                                    <div
                                        key={idx}
                                        className="w-10 h-10 rounded-full border-2 border-white"
                                        style={{ backgroundColor: col }}
                                    />
                                ))}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-700 text-sm">{palette.name}</h4>
                                <div className="flex gap-1 mt-1">
                                    {palette.colors.map((c, i) => (
                                        <div key={i} className="w-3 h-1 rounded-full bg-gray-200" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                <Pipette size={14} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
