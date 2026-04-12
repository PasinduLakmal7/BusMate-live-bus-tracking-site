import React, { useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import SignUp from './SignUp';

const AuthModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('login'); // 'login' or 'signup'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Glassmorphism */}
            <div 
                className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            
            {/* Modal Body */}
            <div className="relative w-full max-w-[550px] bg-white dark:bg-[#111116] rounded-[3.5rem] shadow-3xl overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 z-20 p-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-white hover:bg-blue-600 rounded-2xl transition-all active:scale-95"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* View Container */}
                <div className="max-h-[85vh] overflow-y-auto">
                    {view === 'login' ? (
                        <div className="relative">
                            <Login />
                            {/* Override the link in Login.jsx to keep it in the modal */}
                            <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                <span className="pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setView('signup'); }}
                                        className="font-black text-blue-700 dark:text-white uppercase tracking-tighter text-sm ml-1"
                                    >
                                        Register Now
                                    </button>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <SignUp />
                            {/* Override the link in SignUp.jsx to keep it in the modal */}
                            <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                <span className="pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setView('login'); }}
                                        className="font-black text-blue-700 dark:text-white uppercase tracking-tighter text-sm ml-1"
                                    >
                                        Sign In
                                    </button>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
