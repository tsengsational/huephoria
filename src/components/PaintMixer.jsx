import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, Trash2, Copy, Check, Grid, Brush, ChevronDown, ChevronUp, Hand, Paintbrush } from 'lucide-react';
import * as spectral from 'spectral.js';

// --- Helpers ---
const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
};

const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
};

const getLuminance = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
};

const isDarkColor = (hex) => getLuminance(hex) < 0.5;

// Spectral physics-accurate pigment mix
const mixColors = (hex1, hex2, t = 0.5) => {
    try {
        const result = spectral.mix(hex1, hex2, t, spectral.HEX);
        return result;
    } catch {
        // Fallback to simple linear blend if spectral fails
        const c1 = hexToRgb(hex1);
        const c2 = hexToRgb(hex2);
        return rgbToHex(
            c1.r + (c2.r - c1.r) * t,
            c1.g + (c2.g - c1.g) * t,
            c1.b + (c2.b - c1.b) * t
        );
    }
};

// Read pixel color from canvas
const sampleCanvasColor = (canvas, x, y) => {
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] === 0) return null; // transparent
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
};

// --- Palette Swatch Component (color source selector) ---
const PaletteSwatch = ({ color, label, isSelected, onClick }) => {
    const dark = isDarkColor(color);
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative flex-shrink-0 rounded-2xl shadow-md transition-all border-2 ${isSelected ? 'border-pink-400 scale-110 shadow-pink-200' : 'border-transparent'}`}
            style={{ backgroundColor: color, width: 52, height: 52 }}
            title={label}
        >
            {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${dark ? 'bg-white' : 'bg-slate-900'}`} />
                </div>
            )}
        </motion.button>
    );
};

// --- Main PaintMixer Component ---
const PaintMixer = ({ paletteData }) => {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null); // for sampling cursor
    const [selectedColor, setSelectedColor] = useState(paletteData?.featured?.[0]?.hex || '#ff0000');
    const [brushSize, setBrushSize] = useState(24);
    const [opacity, setOpacity] = useState(80);
    const [showMatrix, setShowMatrix] = useState(false);
    const [sampledColor, setSampledColor] = useState(null);
    const [copiedSample, setCopiedSample] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSampling, setIsSampling] = useState(false);
    const [brushMode, setBrushMode] = useState('paint'); // 'paint' | 'smudge'
    const [usePressure, setUsePressure] = useState(true);
    const lastPos = useRef(null);
    const draggedColor = useRef(null); // Used for smudge logic
    const canvasInitialized = useRef(false);

    const featured = paletteData?.featured || [];
    const matrix = paletteData?.matrix || [];
    const allMatrixColors = matrix.flat();

    // Initialize canvas with a warm off-white background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasInitialized.current) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FAFAF8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvasInitialized.current = true;
    }, []);

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // PointerEvents have clientX/Y directly
        const clientX = e.clientX;
        const clientY = e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
            pressure: e.pressure || 0.5 // Default to 0.5 for devices without pressure
        };
    };

    const drawStroke = useCallback((ctx, from, to, color, size, alpha, pressure = 1) => {
        const effectiveSize = usePressure ? size * (0.4 + 1.2 * pressure) : size;
        const effectiveAlpha = usePressure ? (alpha / 100) * (0.3 + 0.7 * pressure) : alpha / 100;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = effectiveSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = effectiveAlpha;
        // Use 'source-over' for natural layering/blending
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke();
        ctx.globalAlpha = 1;
    }, [usePressure]);

    const startDrawing = useCallback((e) => {
        if (isSampling) return;
        // Don't preventDefault here to allow scrolling on non-canvas areas, 
        // pointer-events: none on container if needed.
        const canvas = canvasRef.current;
        const pos = getPos(e, canvas);
        setIsDrawing(true);
        lastPos.current = pos;

        const ctx = canvas.getContext('2d');
        const existingHex = sampleCanvasColor(canvas, Math.round(pos.x), Math.round(pos.y)) || '#fafaf8';

        if (brushMode === 'smudge') {
            // Pick up color from current spot
            draggedColor.current = existingHex;
        } else {
            // Standard paint mode: blend selected color with local surface
            const paintColor = existingHex !== '#fafaf8'
                ? mixColors(selectedColor, existingHex, 0.6)
                : selectedColor;
            drawStroke(ctx, pos, pos, paintColor, brushSize, opacity, pos.pressure);
        }
    }, [isSampling, selectedColor, brushSize, opacity, drawStroke, brushMode]);

    const updateCursor = useCallback((e) => {
        if (isSampling) return;
        const cursor = document.getElementById('paint-cursor');
        if (!cursor) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        // Check if mouse is within canvas bounds
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            cursor.style.display = 'block';
            cursor.style.left = `${clientX - rect.left - brushSize / 2}px`;
            cursor.style.top = `${clientY - rect.top - brushSize / 2}px`;

            // Optionally scale cursor by pressure if drawing
            if (isDrawing && usePressure) {
                const p = e.pressure || 0.5;
                const s = brushSize * (0.4 + 1.2 * p);
                cursor.style.width = `${s}px`;
                cursor.style.height = `${s}px`;
                cursor.style.left = `${clientX - rect.left - s / 2}px`;
                cursor.style.top = `${clientY - rect.top - s / 2}px`;
            } else {
                cursor.style.width = `${brushSize}px`;
                cursor.style.height = `${brushSize}px`;
            }
        } else {
            cursor.style.display = 'none';
        }
    }, [isSampling, brushSize, isDrawing, usePressure]);

    const draw = useCallback((e) => {
        updateCursor(e);
        if (!isDrawing || isSampling) return;

        const canvas = canvasRef.current;
        const pos = getPos(e, canvas);
        const from = lastPos.current || pos;
        const ctx = canvas.getContext('2d');

        if (brushMode === 'smudge') {
            // Sample local color at NEW position to blend into
            const localHex = sampleCanvasColor(canvas, Math.round(pos.x), Math.round(pos.y)) || '#fafaf8';

            // Smudge logic: result = blend(what we're carrying, what we're hitting)
            const smudgedHex = mixColors(draggedColor.current, localHex, 0.2);

            drawStroke(ctx, from, pos, smudgedHex, brushSize, opacity * 0.8, pos.pressure);
            draggedColor.current = smudgedHex;
        } else {
            // Standard Paint
            const existingHex = sampleCanvasColor(canvas, Math.round(pos.x), Math.round(pos.y));
            const paintColor = existingHex && existingHex.toLowerCase() !== '#fafaf8'
                ? mixColors(selectedColor, existingHex, 0.65)
                : selectedColor;

            drawStroke(ctx, from, pos, paintColor, brushSize, opacity, pos.pressure);
        }

        lastPos.current = pos;
    }, [isDrawing, isSampling, selectedColor, brushSize, opacity, drawStroke, updateCursor, brushMode]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        lastPos.current = null;
        draggedColor.current = null;
        const cursor = document.getElementById('paint-cursor');
        if (cursor) cursor.style.display = 'none';
    }, []);

    const handleSampleClick = useCallback((e) => {
        if (!isSampling) return;
        const canvas = canvasRef.current;
        const pos = getPos(e, canvas);
        const hex = sampleCanvasColor(canvas, Math.round(pos.x), Math.round(pos.y));
        if (hex) setSampledColor(hex);
        setIsSampling(false);
    }, [isSampling]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FAFAF8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setSampledColor(null);
    };

    const copySample = () => {
        if (!sampledColor) return;
        navigator.clipboard.writeText(sampledColor);
        setCopiedSample(true);
        setTimeout(() => setCopiedSample(false), 2000);
    };

    const dark = isDarkColor(selectedColor);

    return (
        <div className="paint-mixer space-y-6">
            {/* Palette Picker */}
            <div className="paint-mixer__palette bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Choose Paint Color</p>
                    <button
                        onClick={() => setShowMatrix(v => !v)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-pink-500 transition-colors"
                    >
                        <Grid size={10} />
                        {showMatrix ? 'Hide Matrix' : 'Show Full Matrix'}
                        {showMatrix ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                </div>

                {/* Featured colors */}
                <div className="flex flex-wrap gap-3">
                    {featured.map((color, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <PaletteSwatch
                                color={color.hex}
                                label={`${color.name} (${color.hex})`}
                                isSelected={selectedColor === color.hex}
                                onClick={() => setSelectedColor(color.hex)}
                            />
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                                {i === 0 ? 'Base' : color.name?.split(' ')[0] || `C${i}`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Matrix colors (expandable) */}
                <AnimatePresence>
                    {showMatrix && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 border-t border-slate-100">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-3">36-Color Matrix</p>
                                <div className="grid grid-cols-9 gap-1.5">
                                    {allMatrixColors.map((color, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.2, zIndex: 10 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setSelectedColor(color.hex)}
                                            className={`aspect-square rounded-lg border-2 transition-all ${selectedColor === color.hex ? 'border-pink-400 shadow-md' : 'border-transparent'}`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.hex}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="paint-mixer__controls bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Active Color Preview */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl shadow-md border border-black/5 flex-shrink-0"
                            style={{ backgroundColor: selectedColor }}
                        />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active</p>
                            <p className="font-black text-slate-700 uppercase text-sm">{selectedColor}</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 min-w-[200px]">
                        {/* Brush Size */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <Brush size={9} /> Brush Size
                                </label>
                                <span className="text-[9px] font-black text-slate-500">{brushSize}px</span>
                            </div>
                            <input
                                type="range" min={4} max={80} value={brushSize}
                                onChange={e => setBrushSize(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full accent-pink-500 cursor-pointer"
                            />
                        </div>

                        {/* Opacity */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Opacity</label>
                                <span className="text-[9px] font-black text-slate-500">{opacity}%</span>
                            </div>
                            <input
                                type="range" min={10} max={100} value={opacity}
                                onChange={e => setOpacity(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full accent-pink-500 cursor-pointer"
                            />
                        </div>

                        {/* Pressure Toggle */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pressure Sensitivity</label>
                            <button
                                onClick={() => setUsePressure(!usePressure)}
                                className={`w-8 h-4 rounded-full relative transition-colors ${usePressure ? 'bg-pink-500' : 'bg-slate-200'}`}
                            >
                                <motion.div
                                    animate={{ x: usePressure ? 16 : 0 }}
                                    className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Tool Switcher */}
                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setBrushMode('paint')}
                                className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${brushMode === 'paint' ? 'bg-white shadow-sm text-pink-500' : 'text-slate-400'}`}
                                title="Paint Brush"
                            >
                                <Paintbrush size={16} />
                            </button>
                            <button
                                onClick={() => setBrushMode('smudge')}
                                className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${brushMode === 'smudge' ? 'bg-white shadow-sm text-pink-500' : 'text-slate-400'}`}
                                title="Smudge Tool"
                            >
                                <Hand size={16} />
                            </button>
                        </div>

                        {/* Sample mode toggle */}
                        <button
                            onClick={() => setIsSampling(v => !v)}
                            className={`p-3 rounded-2xl transition-all font-black text-xs flex items-center gap-2 ${isSampling ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title="Sample Color"
                        >
                            <Pipette size={16} />
                            {isSampling ? 'Click Canvas' : 'Sample'}
                        </button>

                        {/* Clear canvas */}
                        <button
                            onClick={clearCanvas}
                            className="p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-400 transition-all flex items-center gap-2 font-black text-xs"
                            title="Clear Canvas"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="paint-mixer__canvas-wrap relative bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {isSampling && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-pink-500/80 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                            Click anywhere to sample color
                        </div>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={600}
                    className={`w-full h-auto block touch-none ${isSampling ? 'cursor-crosshair' : 'cursor-none'}`}
                    onPointerDown={isSampling ? handleSampleClick : startDrawing}
                    onPointerMove={isDrawing ? draw : updateCursor}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                />

                {/* Custom cursor preview */}
                {!isSampling && (
                    <div
                        className="absolute pointer-events-none rounded-full border-2 border-white shadow-lg mix-blend-normal"
                        style={{
                            width: brushSize,
                            height: brushSize,
                            backgroundColor: selectedColor,
                            opacity: opacity / 100,
                            display: 'none', // shown via JS below
                        }}
                        id="paint-cursor"
                    />
                )}
            </div>

            {/* Sampled Color Result */}
            <AnimatePresence>
                {sampledColor && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="paint-mixer__result bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Discovered Mix Color</p>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl shadow-md flex-shrink-0 border border-black/5"
                                style={{ backgroundColor: sampledColor }}
                            />
                            <div className="flex-1">
                                <p className="font-black text-slate-800 uppercase text-2xl tracking-tight">{sampledColor}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">Pigment-blended via Kubelka-Munk</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={copySample}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${copiedSample ? 'bg-green-500 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                                >
                                    {copiedSample ? <Check size={16} /> : <Copy size={16} />}
                                    {copiedSample ? 'Copied!' : 'Copy HEX'}
                                </button>
                                <button
                                    onClick={() => setSelectedColor(sampledColor)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    <Brush size={14} />
                                    Paint with this
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaintMixer;
