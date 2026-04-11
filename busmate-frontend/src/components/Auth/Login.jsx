import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, Bus, Shield, Map, Zap, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { formSchema } from "@busmate/common";
import Card from '../common/Card';
import Button from '../common/Button';

const Login = () => {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] flex items-center justify-center p-6 py-32 relative overflow-hidden transition-colors duration-500">
            {/* Ambient Dynamics */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 dark:bg-[#3b0764]/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
                {/* Visual Context */}
                <div className="hidden lg:block space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full w-fit">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Security Node: Active</span>
                        </div>
                        <h1 className="text-7xl font-black text-gray-900 dark:text-white leading-none tracking-tighter uppercase">
                            Your <span className="text-blue-600">Transit</span> <br/> Hub Awaits
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-sm leading-relaxed">
                            Synchronize your favorites and unlock predictive road analytics for your morning commute.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
                           <Zap className="w-8 h-8 text-blue-500 mb-3" />
                           <h4 className="text-white font-black uppercase tracking-tight mb-1">Accelerated Search</h4>
                           <p className="text-gray-500 text-xs font-semibold">One-tap favorites reach you 2.5x faster than guest searches.</p>
                        </div>
                    </div>
                </div>

                {/* Form Logic */}
                <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={formSchema}
                    onSubmit={async (values, action) => {
                        setLoginError(null);
                        try {
                            // Ensure we use the API prefix that matches the Vite proxy
                            const res = await fetch("/api/auth/login", {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(values),
                            });
                            const data = await res.json();
                            if (res.ok) {
                                navigate('/dashboard');
                            } else {
                                setLoginError(data.error || "Authentication failed: Check credentials");
                            }
                        } catch (error) {
                            console.error("Login Connection Error:", error);
                            setLoginError("Could not connect to authentication server. Check your network.");
                        } finally {
                            action.setSubmitting(false);
                        }
                    }}
                >
                    {(formik) => (
                        <Card className="p-12 bg-white/5 border-white/[0.05] rounded-[3.5rem] shadow-3xl backdrop-blur-[40px] relative overflow-hidden group border-white/10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/0 via-blue-600/50 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="text-center lg:text-left mb-10">
                                <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 mx-auto lg:mx-0">
                                   <Bus className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Login Profile</h2>
                                <p className="text-gray-400 dark:text-gray-500 font-bold mt-1 uppercase tracking-tighter text-[10px]">Initiating data synchronization session...</p>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-2">Email Identity</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 inset-y-0 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
                                           <Mail className="w-5 h-5" />
                                        </div>
                                        <input 
                                            name="email"
                                            onChange={formik.handleChange}
                                            value={formik.values.email}
                                            placeholder="operatve@busmate.lk"
                                            className="w-full bg-white dark:bg-[#0a0a0c]/50 border border-gray-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 shadow-sm" 
                                        />
                                    </div>
                                    {formik.errors.email && formik.touched.email && <p className="text-rose-500 text-[10px] uppercase font-black tracking-widest ml-4">{formik.errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-2">Security Key</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 inset-y-0 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">
                                           <Lock className="w-5 h-5" />
                                        </div>
                                        <input 
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            onChange={formik.handleChange}
                                            value={formik.values.password}
                                            placeholder="••••••••"
                                            className="w-full bg-white dark:bg-[#0a0a0c]/50 border border-gray-200 dark:border-white/10 rounded-2xl py-5 pl-14 pr-14 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 shadow-sm" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 inset-y-0 flex items-center p-2 text-gray-400 hover:text-white transition-all z-10"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {formik.errors.password && formik.touched.password && <p className="text-rose-500 text-[10px] uppercase font-black tracking-widest ml-4">{formik.errors.password}</p>}
                                </div>

                                {loginError && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">
                                        {loginError}
                                    </div>
                                )}

                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 text-white transition-all active:scale-[0.98]"
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? 'Authenticating...' : 'Establish Connection'}
                                    <ChevronRight className="w-5 h-5" />
                                </Button>

                                <div className="pt-4 text-center">
                                    <p className="text-gray-500 font-bold mb-4">New operative to the network?</p>
                                    <Link to="/register" className="inline-flex items-center gap-2 text-blue-500 hover:text-white font-black uppercase tracking-tighter transition-colors">
                                        Register Now <CheckCircle2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            </form>
                        </Card>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default Login;