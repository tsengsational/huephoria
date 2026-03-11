import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Sparkles, Trophy, Flame, Pipette, Droplets, Palette, User, ChevronDown, Check, X, Loader2, Camera } from 'lucide-react';
import { FastAverageColor } from 'fast-average-color';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { generatePalette } from '../utils/colorLogic';

const HomeScreen = ({ motherColor, setMotherColor, onGenerate, onSelect, mode, setMode }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [palettes, setPalettes] = useState([]);
    const [loadingPalettes, setLoadingPalettes] = useState(true);
    const [isExtracting, setIsExtracting] = useState(false);
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const fac = new FastAverageColor();

    // Calculate preview colors based on current selection
    const previewColors = useMemo(() => {
        try {
            const data = generatePalette(motherColor, mode);
            return {
                highlight: data.featured[1].hex,
                highlightIsDark: data.featured[1].isDark,
                lowlight: data.featured[3].hex,
                lowlightIsDark: data.featured[3].isDark,
                motherIsDark: data.featured[0].isDark
            };
        } catch (e) {
            return {
                highlight: '#86EFAC',
                highlightIsDark: false,
                lowlight: '#FDE047',
                lowlightIsDark: false,
                motherIsDark: false
            }; // Fallbacks
        }
    }, [motherColor, mode]);

    const modes = [
        { id: 'vibrant', label: 'Vibrant', icon: Sparkles },
        { id: 'monochrome', label: 'Mono', icon: Droplets },
        { id: 'analogous', label: 'Analog', icon: Flame },
        { id: 'tetradic', label: 'Tetrad', icon: Trophy },
        { id: 'quadratic', label: 'Quad', icon: Sparkles },
    ];

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const q = query(
                    collection(db, 'palettes'),
                    where('isPublic', '==', true),
                    orderBy('likes', 'desc'),
                    limit(6)
                );
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    colors: doc.data().data.featured.map(c => c.hex)
                }));
                setPalettes(fetched);
            } catch (err) {
                console.error('Error fetching trending palettes:', err);
            } finally {
                setLoadingPalettes(false);
            }
        };

        fetchTrending();
    }, []);

    const handleLike = async (paletteId, e) => {
        e.stopPropagation();
        if (!user) {
            alert('Please sign in to upvote palettes!');
            return;
        }

        try {
            const likeRef = doc(db, 'palettes', paletteId, 'likes', user.uid);
            const paletteRef = doc(db, 'palettes', paletteId);

            await setDoc(likeRef, { likedAt: new Date() });
            await updateDoc(paletteRef, {
                likes: increment(1)
            });

            // Optimistic update
            setPalettes(prev => prev.map(p =>
                p.id === paletteId ? { ...p, likes: (p.likes || 0) + 1 } : p
            ));
        } catch (err) {
            console.error('Error liking palette:', err);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        try {
            const url = URL.createObjectURL(file);
            const color = await fac.getColorAsync(url);

            // Set the extracted color as mother color
            setMotherColor(color.hex);

            // Small delay to ensure state is set before navigating
            setTimeout(() => {
                onGenerate();
                setIsExtracting(false);
                URL.revokeObjectURL(url);
            }, 500);
        } catch (err) {
            console.error('Extraction failed:', err);
            alert('Could not extract color from this image. Please try another one!');
            setIsExtracting(false);
        }
    };

    return (
        <div className="home-screen flex-1 flex flex-col space-y-12">
            <div className="home-screen__grid grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                {/* Left Column: Hero & Mode & CTA */}
                <div className="home-screen__left-col space-y-12 flex flex-col items-center">
                    {/* Hero Section */}
                    <div className="home-screen__hero relative flex flex-col items-center">
                        <div className="home-screen__hero-deco-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-pink-100/50 rounded-full blur-3xl -z-10" />
                        <div className="home-screen__hero-deco-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] bg-pink-50 rounded-full -z-10 border border-pink-100" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="home-screen__picker-container relative w-48 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full bg-white shadow-2xl flex items-center justify-center p-4 border-8 border-white"
                        >
                            <motion.div
                                animate={{ backgroundColor: previewColors.lowlight }}
                                className="home-screen__picker-bubble-sm absolute -bottom-2 -left-2 w-12 h-12 lg:w-20 lg:h-20 rounded-full border-4 border-white shadow-lg transition-colors duration-500"
                            />

                            {/* Image Extraction Bubble */}
                            <motion.div
                                animate={{ backgroundColor: previewColors.highlight }}
                                className="home-screen__picker-bubble-lg absolute -top-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 rounded-full hover:scale-110 border-4 border-white shadow-lg transition-colors duration-500 overflow-hidden flex items-center justify-center p-0"
                            >
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isExtracting}
                                    className="w-full h-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform bg-transparent outline-none group"
                                    title="Extract color from image"
                                >
                                    {isExtracting ? (
                                        <Loader2 size={24} className={`${previewColors.highlightIsDark ? 'text-white' : 'text-slate-900'} animate-spin`} />
                                    ) : (
                                        <Camera size={24} className={`${previewColors.highlightIsDark ? 'text-white' : 'text-slate-900'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPicker(true)}
                                className="home-screen__picker-trigger w-full h-full rounded-full cursor-pointer shadow-inner relative group flex items-center justify-center overflow-hidden"
                                style={{ backgroundColor: motherColor }}
                            >
                                <div
                                    className="home-screen__picker-icon-box absolute inset-x-0 bottom-0 top-0 m-auto w-12 h-12 lg:w-16 lg:h-16 rounded-full shadow-lg flex items-center justify-center border-2 border-white transform group-hover:scale-110 transition-all duration-500"
                                    style={{ backgroundColor: motherColor }}
                                >
                                    <Pipette className={previewColors.motherIsDark ? 'text-white' : 'text-slate-900'} size={20} />
                                </div>
                                <div className="home-screen__picker-overlay absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Mode Selection */}
                    <div className="home-screen__modes w-full max-w-sm lg:max-w-md space-y-4 px-4">
                        <p className="home-screen__modes-label text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Generation Mode</p>
                        <div className="home-screen__modes-header bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-1.5">
                            {modes.map((m) => {
                                const Icon = m.icon;
                                const isActive = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`home-screen__mode-btn flex-1 py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${isActive ? 'home-screen__mode-btn--active bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        <Icon size={18} className="home-screen__mode-icon" />
                                        <span className={`home-screen__mode-btn-label text-[10px] font-black uppercase ${isActive ? 'text-white' : 'text-slate-50'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <div className="home-screen__cta-section w-full max-w-sm lg:max-w-md space-y-4 px-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onGenerate}
                            className="home-screen__cta-btn w-full py-6 rounded-[2rem] bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xl font-black shadow-2xl shadow-pink-100 flex items-center justify-center gap-4 transition-all"
                        >
                            <Sparkles size={24} className="home-screen__cta-icon" />
                            Generate Palette
                        </motion.button>
                        <p className="home-screen__cta-desc text-center text-slate-400 text-sm font-bold opacity-60">
                            Create custom harmonies in one click
                        </p>
                    </div>
                </div>

                {/* Right Column: Trending */}
                <div className="home-screen__trending space-y-8 px-4 lg:px-0">
                    <div className="home-screen__trending-header flex items-center justify-between">
                        <h3 className="home-screen__trending-title font-black text-2xl text-slate-800 tracking-tight">Trending Palettes</h3>
                        <button className="home-screen__trending-link text-pink-500 text-sm font-black uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div className="home-screen__trending-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        {loadingPalettes ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-slate-300" size={32} />
                            </div>
                        ) : palettes.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-medium">
                                No public palettes yet. Be the first!
                            </div>
                        ) : (
                            palettes.map((palette, idx) => (
                                <motion.div
                                    key={palette.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => onSelect(palette.data)}
                                    className="home-screen__palette-card bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col"
                                >
                                    <div className="home-screen__palette-card-header p-5 flex items-center justify-between">
                                        <div className="home-screen__palette-user-box flex items-center gap-4">
                                            <div className="home-screen__palette-avatar w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm overflow-hidden text-pink-500">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="home-screen__palette-name font-black text-slate-700 leading-tight">
                                                    {palette.title || palette.motherName || 'Untitled'}
                                                </h4>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                    {palette.data.mode} • {palette.motherHex}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleLike(palette.id, e)}
                                            className="home-screen__palette-like-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-400 group/like hover:bg-pink-50 hover:text-pink-500 transition-all"
                                        >
                                            <Flame size={16} className="group-hover/like:scale-125 transition-transform" />
                                            <span className="text-xs font-black">{palette.likes || 0}</span>
                                        </button>
                                    </div>
                                    <div className="home-screen__palette-swatches flex h-16 w-full mt-auto">
                                        {palette.colors.map((c, i) => (
                                            <div
                                                key={i}
                                                className="home-screen__palette-swatch flex-1 h-full hover:flex-[1.5] transition-all duration-500"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Color Picker Modal */}
            <AnimatePresence>
                {showPicker && (
                    <div className="home-screen__modal fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPicker(false)}
                            className="home-screen__modal-overlay absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="home-screen__modal-container relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 custom-color-picker"
                        >
                            <div className="home-screen__modal-header flex items-center justify-between">
                                <h3 className="home-screen__modal-title text-2xl font-black text-slate-800">Select Color</h3>
                                <button
                                    onClick={() => setShowPicker(false)}
                                    className="home-screen__modal-close p-2 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <HexColorPicker color={motherColor} onChange={setMotherColor} className="home-screen__picker" />

                            <div className="home-screen__modal-body space-y-4">
                                <div className="home-screen__modal-input-box flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <div
                                        className="home-screen__modal-input-preview w-12 h-12 rounded-2xl shadow-sm border border-black/5"
                                        style={{ backgroundColor: motherColor }}
                                    />
                                    <div className="home-screen__modal-input-wrapper flex-1">
                                        <p className="home-screen__modal-input-label text-[10px] font-black uppercase tracking-widest text-slate-400">Hex Code</p>
                                        <input
                                            type="text"
                                            value={motherColor}
                                            onChange={(e) => setMotherColor(e.target.value)}
                                            className="home-screen__modal-input w-full bg-transparent font-bold text-lg text-slate-700 outline-none"
                                        />
                                    </div>
                                    <Check className="home-screen__modal-input-check text-pink-500" size={20} />
                                </div>

                                <button
                                    onClick={() => setShowPicker(false)}
                                    className="home-screen__modal-confirm w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                                >
                                    Confirm Selection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Enrichment for AdSense & SEO */}
            <div className="home-screen__info-sections grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 mt-12 border-t border-slate-100">
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800">About Palettable</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Palettable is a high-performance color palette generator designed for modern creators. Whether you are building a brand identity or a web application, our engine provides scientifically backed color harmonies in seconds. We combine traditional color theory with modern digital design standards to ensure every palette you create is balanced, accessible, and stunning.
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Our tool allows you to extract inspiration directly from the world around you using our image-to-color extraction technology. Simply upload an image, and Palettable will find the dominant color and build a professional design system around it.
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800">Advanced Harmony Logic</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Vibrant & Analogous</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">Create high-energy palettes using sibling colors on the wheel or high-contrast combinations for maximum impact.</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Monochrome & Minimal</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">Perfect for sleek, modern interfaces that require depth without the noise of multiple hues.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
