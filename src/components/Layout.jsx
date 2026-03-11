import React, { useState } from 'react';
import { User, LogOut, ChevronDown, Palette, Sparkles, Heart, Compass, Settings } from 'lucide-react';
import AdBanner from './AdBanner';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Layout = ({ children, onNavigateSaved }) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    return (
        <div className="layout min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="layout__header px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <h1 className="layout__logo text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-600">
                    Palettable
                </h1>

                <div className="layout__header-right relative">
                    {user ? (
                        <div
                            className="layout__account-trigger flex items-center gap-2 cursor-pointer group"
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        >
                            <div className="layout__account-avatar w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-pink-300 transition-all">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-pink-600" />
                                )}
                            </div>
                            <ChevronDown size={16} className={`layout__account-chevron text-gray-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="layout__auth-toggle px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Sign In
                        </button>
                    )}

                    {/* Account Dropdown */}
                    {isAccountMenuOpen && user && (
                        <>
                            <div
                                className="layout__account-menu-overlay fixed inset-0 z-10"
                                onClick={() => setIsAccountMenuOpen(false)}
                            />
                            <div className="layout__account-menu absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
                                <div className="layout__account-menu-header px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                    <p className="layout__account-email text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                </div>
                                <button
                                    className="layout__account-menu-item w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => {
                                        setIsAccountMenuOpen(false);
                                        onNavigateSaved();
                                    }}
                                >
                                    Saved Palettes
                                </button>
                                <button
                                    className="layout__account-menu-item layout__account-menu-item--logout w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    onClick={() => {
                                        logout();
                                        setIsAccountMenuOpen(false);
                                    }}
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="layout__main flex-1 flex flex-col w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto p-6 md:p-12 pb-48 md:pb-48">
                {children}
            </main>

            <AdBanner />

            {/* Bottom Navigation */}
            <nav className="layout__nav-bottom fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-3 flex justify-around items-center z-50 lg:hidden">
                <button className="layout__nav-item layout__nav-item--active group flex flex-col items-center gap-1 text-pink-500">
                    <div className="layout__nav-icon-circle w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
                        <Palette size={20} />
                    </div>
                    <span className="layout__nav-label text-[10px] font-bold uppercase tracking-tighter">Home</span>
                </button>
                <button
                    className="layout__nav-item group flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors"
                    onClick={onNavigateSaved}
                >
                    <div className="layout__nav-icon-circle w-10 h-10 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
                        <Heart size={20} />
                    </div>
                    <span className="layout__nav-label text-[10px] font-bold uppercase tracking-tighter">Saved</span>
                </button>
                <button className="layout__nav-item group flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors">
                    <div className="layout__nav-icon-circle w-10 h-10 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
                        <Compass size={20} />
                    </div>
                    <span className="layout__nav-label text-[10px] font-bold uppercase tracking-tighter">Explore</span>
                </button>
                <button className="layout__nav-item group flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors">
                    <div className="layout__nav-icon-circle w-10 h-10 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
                        <Settings size={20} />
                    </div>
                    <span className="layout__nav-label text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                </button>
            </nav>

            {/* Desktop & SEO Footer */}
            <footer className="layout__footer bg-white border-t border-gray-100 px-8 py-12 mt-12 hidden lg:block">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-slate-900">Palettable</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            The ultimate design companion for creating beautiful, balanced, and accessible color palettes. Powered by advanced color theory and built for the modern web.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Resources</h4>
                        <ul className="space-y-2 text-sm font-medium text-slate-600">
                            <li><button className="hover:text-pink-500 transition-colors">Color Theory Guide</button></li>
                            <li><button className="hover:text-pink-500 transition-colors">API Documentation</button></li>
                            <li><button className="hover:text-pink-500 transition-colors">Design System Tips</button></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Legal</h4>
                        <ul className="space-y-2 text-sm font-medium text-slate-600">
                            <li><button className="hover:text-pink-500 transition-colors">Privacy Policy</button></li>
                            <li><button className="hover:text-pink-500 transition-colors">Terms of Service</button></li>
                            <li><button className="hover:text-pink-500 transition-colors">Cookie Policy</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto pt-8 mt-8 border-t border-slate-50 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        © 2026 Palettable Studio. All rights reserved.
                    </p>
                </div>
            </footer>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
