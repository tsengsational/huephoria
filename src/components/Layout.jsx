import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import AdBanner from './AdBanner';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Layout = ({ children, onNavigateSaved }) => {
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-600">
                    Palletable
                </h1>

                <div className="relative">
                    {user ? (
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        >
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-pink-300 transition-all">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-pink-600" />
                                )}
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Sign In
                        </button>
                    )}

                    {/* Account Dropdown */}
                    {isAccountMenuOpen && user && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsAccountMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                    <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                                </div>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => {
                                        setIsAccountMenuOpen(false);
                                        onNavigateSaved();
                                    }}
                                >
                                    Saved Palettes
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
            <main className="flex-1 flex flex-col w-full max-w-lg mx-auto p-6 md:p-8 pb-24">
                {children}
            </main>

            <AdBanner slot="YOUR_STICKY_FOOTER_AD_SLOT_ID" />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
