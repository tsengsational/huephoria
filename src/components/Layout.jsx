import React from 'react';
import { User } from 'lucide-react';
import AdBanner from './AdBanner';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-600">
                    Huephoria
                </h1>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden hover:ring-2 hover:ring-pink-300 transition-all cursor-pointer">
                    <User size={20} className="text-gray-500" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col w-full max-w-lg mx-auto p-6 md:p-8 pb-24">
                {children}
            </main>

            <AdBanner />
        </div>
    );
};

export default Layout;
