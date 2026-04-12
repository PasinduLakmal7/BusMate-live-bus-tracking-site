import React from 'react';
import { X, LogIn, UserPlus, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const AuthSelectionModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAction = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Elite Backdrop */}
            <div 
                className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            
            <Card className="relative w-full max-w-[450px] p-10 bg-[#111116] border-white/10 rounded-[3rem] shadow-4xl animate-in zoom-in-95 duration-300 ring-1 ring-white/5">
                {/* Close Node */}
                <button 
                   onClick={onClose}
                   className="absolute top-8 right-8 p-3 bg-white/5 text-gray-500 hover:text-white hover:bg-blue-600 rounded-2xl transition-all"
                >
                   <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto">
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Access Authorization</h2>
                    <p className="text-gray-500 font-bold text-sm tracking-tight">Please select your authentication protocol.</p>
                </div>

                <div className="space-y-4">
                    <button 
                       onClick={() => handleAction('/login')}
                       className="w-full flex items-center justify-between p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.75rem] transition-all group active:scale-95 shadow-xl shadow-blue-500/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <LogIn className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-[10px]">Session Start</p>
                                <p className="text-lg font-black uppercase tracking-tighter">Sign In Identity</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>

                    <button 
                       onClick={() => handleAction('/register')}
                       className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 text-white rounded-[1.75rem] border border-white/5 transition-all group active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-[10px] text-gray-500">Registry Gateway</p>
                                <p className="text-lg font-black uppercase tracking-tighter">New Operative</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>
                </div>

                <p className="mt-10 text-center text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">
                   BusMate Node Intelligence Center
                </p>
            </Card>
        </div>
    );
};

export default AuthSelectionModal;
