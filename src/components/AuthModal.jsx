import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, signInWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="auth-modal__overlay fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="auth-modal__container fixed z-[101] bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="auth-modal__content p-8">
                            <div className="auth-modal__header flex justify-between items-center mb-6">
                                <h2 className="auth-modal__title text-2xl font-bold text-slate-900">
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <button onClick={onClose} className="auth-modal__close-btn p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={20} className="auth-modal__close-icon text-slate-500" />
                                </button>
                            </div>

                            {error && (
                                <div className="auth-modal__error mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-modal__form space-y-4">
                                <div className="auth-modal__input-group space-y-2">
                                    <label className="auth-modal__label text-sm font-medium text-slate-700 ml-1">Email</label>
                                    <div className="auth-modal__input-wrapper relative">
                                        <Mail className="auth-modal__input-icon absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-modal__input w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="auth-modal__input-group space-y-2">
                                    <label className="auth-modal__label text-sm font-medium text-slate-700 ml-1">Password</label>
                                    <div className="auth-modal__input-wrapper relative">
                                        <Lock className="auth-modal__input-icon absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="auth-modal__input w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="auth-modal__submit-btn w-full py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-2xl shadow-lg shadow-pink-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                                </button>
                            </form>

                            <div className="auth-modal__divider relative my-8">
                                <div className="auth-modal__divider-line absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="auth-modal__divider-text relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-400">or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="auth-modal__social-btn w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                <Chrome size={20} className="auth-modal__social-icon text-slate-600" />
                                <span className="auth-modal__social-label">Google</span>
                            </button>

                            <div className="auth-modal__footer mt-8 text-center">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="auth-modal__toggle-btn text-sm text-pink-600 font-medium hover:text-pink-700 transition-colors"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
