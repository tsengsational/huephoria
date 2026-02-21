import React, { useMemo } from 'react';
import { Layout, Users, BarChart3, Settings, Bell, Search, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const UIPlayground = ({ paletteData }) => {
    const { featured } = paletteData;

    // Dynamic Theme Mapping
    const themeStyles = useMemo(() => {
        const mother = featured[0].hex;
        const highlight = featured[3].hex;
        const lowlight = featured[1].hex;
        const accent = featured[4].hex;
        const neutral = featured[2].hex;

        return {
            '--mock-primary': mother,
            '--mock-primary-soft': `${mother}20`, // 12% opacity
            '--mock-bg': '#F8FAFC',
            '--mock-surface': '#FFFFFF',
            '--mock-text': lowlight,
            '--mock-muted': `${lowlight}80`,
            '--mock-accent': accent,
            '--mock-accent-soft': `${accent}15`,
            '--mock-highlight': highlight,
            '--mock-neutral': neutral,
            '--mock-border': 'rgba(0,0,0,0.06)'
        };
    }, [featured]);

    return (
        <div style={themeStyles} className="w-full bg-[var(--mock-bg)] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--mock-border)] relative">
            <div className="flex h-[500px] md:h-[650px] lg:h-[700px]">
                {/* Mock Sidebar */}
                <div className="w-16 md:w-20 bg-[var(--mock-surface)] border-r border-[var(--mock-border)] flex flex-col items-center py-6 gap-8">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--mock-primary)] flex items-center justify-center text-white shadow-lg">
                        <Layout size={20} />
                    </div>

                    <div className="flex flex-col gap-6 text-[var(--mock-muted)]">
                        <Users size={20} className="hover:text-[var(--mock-primary)] cursor-pointer transition-colors" />
                        <BarChart3 size={20} className="text-[var(--mock-primary)]" />
                        <Bell size={20} className="hover:text-[var(--mock-primary)] cursor-pointer transition-colors" />
                        <Settings size={20} className="hover:text-[var(--mock-primary)] cursor-pointer transition-colors" />
                    </div>

                    <div className="mt-auto w-10 h-10 rounded-full border-2 border-[var(--mock-border)] p-0.5 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover rounded-full" />
                    </div>
                </div>

                {/* Mock Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mock Header */}
                    <header className="h-20 bg-[var(--mock-surface)] border-b border-[var(--mock-border)] flex items-center justify-between px-6 md:px-8">
                        <div>
                            <h4 className="font-black text-[var(--mock-text)] text-lg">Analytics</h4>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[var(--mock-muted)]">Real-time overview</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center bg-[var(--mock-bg)] px-3 py-2 rounded-xl border border-[var(--mock-border)] gap-2">
                                <Search size={14} className="text-[var(--mock-muted)]" />
                                <span className="text-[10px] font-bold text-[var(--mock-muted)]">Search...</span>
                            </div>
                            <button className="bg-[var(--mock-primary)] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all text-sm">
                                <Plus size={16} />
                                <span className="hidden sm:inline">Add Widget</span>
                            </button>
                        </div>
                    </header>

                    {/* Mock Dashboard Body */}
                    <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-[var(--mock-surface)] p-5 rounded-3xl border border-[var(--mock-border)] shadow-sm space-y-3">
                                <div className="flex justify-between items-start text-[var(--mock-muted)]">
                                    <div className="p-2 rounded-xl bg-[var(--mock-primary-soft)] text-[var(--mock-primary)]">
                                        <Users size={18} />
                                    </div>
                                    <ArrowUpRight size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-[var(--mock-text)]">2,854</span>
                                    <p className="text-[10px] font-black uppercase text-[var(--mock-muted)]">Active Users</p>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--mock-bg)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--mock-primary)] w-[65%]" />
                                </div>
                            </div>

                            <div className="bg-[var(--mock-surface)] p-5 rounded-3xl border border-[var(--mock-border)] shadow-sm space-y-3">
                                <div className="flex justify-between items-start text-[var(--mock-muted)]">
                                    <div className="p-2 rounded-xl bg-[var(--mock-accent-soft)] text-[var(--mock-accent)]">
                                        <BarChart3 size={18} />
                                    </div>
                                    <ArrowDownRight size={18} className="text-rose-500" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-[var(--mock-text)]">$48.2k</span>
                                    <p className="text-[10px] font-black uppercase text-[var(--mock-muted)]">Avg. Revenue</p>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--mock-bg)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--mock-accent)] w-[42%]" />
                                </div>
                            </div>

                            <div className="bg-[var(--mock-surface)] p-5 rounded-3xl border border-[var(--mock-border)] shadow-sm space-y-3 hidden lg:block">
                                <div className="flex justify-between items-start text-[var(--mock-muted)]">
                                    <div className="p-2 rounded-xl bg-[var(--mock-neutral)]/20 text-[var(--mock-text)]">
                                        <Bell size={18} />
                                    </div>
                                    <Check size={18} className="text-blue-500" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-[var(--mock-text)]">94%</span>
                                    <p className="text-[10px] font-black uppercase text-[var(--mock-muted)]">Uptime Score</p>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--mock-bg)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--mock-text)] w-[94%]" />
                                </div>
                            </div>
                        </div>

                        {/* Large Action Card */}
                        <div className="bg-[var(--mock-highlight)] p-8 md:p-10 rounded-[2.5rem] text-white flex flex-col justify-between h-56 md:h-64 relative overflow-hidden shadow-2xl shadow-[var(--mock-highlight)]/30 group">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />

                            <div className="relative">
                                <h5 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">Professional <br />Design Matrix Engine</h5>
                                <p className="text-sm font-semibold opacity-80 mt-2 max-w-[200px]">Export in multiple high-fidelity formats for any software.</p>
                            </div>

                            <div className="relative flex justify-between items-center">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--mock-highlight)] bg-white/20 backdrop-blur-md shadow-lg" />
                                    ))}
                                </div>
                                <button className="bg-white text-[var(--mock-highlight)] text-xs md:text-sm font-black px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">
                                    Launch Matrix
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity Table View */}
                        <div className="bg-[var(--mock-surface)] p-6 md:p-8 rounded-[2rem] border border-[var(--mock-border)] shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-black uppercase tracking-widest text-[var(--mock-text)]">Team Activity</span>
                                <MoreHorizontal size={16} className="text-[var(--mock-muted)]" />
                            </div>
                            <div className="space-y-5">
                                {[
                                    { name: 'Matrix Exported', time: '2m ago', color: '--mock-primary', user: 'Alex' },
                                    { name: 'Palette Saved', time: '15m ago', color: '--mock-accent', user: 'Sam' },
                                    { name: 'Colors Refined', time: '1h ago', color: '--mock-neutral', user: 'Jordan' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: `var(${item.color})` }} />
                                            <div>
                                                <span className="text-sm font-black text-[var(--mock-text)] block">{item.name}</span>
                                                <span className="text-[10px] font-bold text-[var(--mock-muted)]">by {item.user}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-[var(--mock-muted)] uppercase bg-[var(--mock-bg)] px-2 py-1 rounded-lg">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UIPlayground;
