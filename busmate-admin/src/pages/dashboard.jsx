import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { 
    Users, UserCheck, Clock, Bus, 
    ArrowUpRight, ArrowDownRight, Activity, 
    ShieldCheck, Zap, BarChart3, TrendingUp
} from 'lucide-react'

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalDrivers: 0,
        pendingApprovals: 0,
        activeBuses: 42, // Mock for health
        avgUptime: '99.8%'
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [allResp, pendingResp] = await Promise.all([
                    axios.get('http://localhost:4000/drivers/all'),
                    axios.get('http://localhost:4000/drivers/pending')
                ])
                setStats(prev => ({
                    ...prev,
                    totalDrivers: allResp.data.data?.length || 0,
                    pendingApprovals: pendingResp.data.data?.length || 0
                }))
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className='p-6 sm:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700'>
            
            {/* Hero Welcome */}
            <div className='relative overflow-hidden bg-blue-600 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-500/20'>
                <div className='absolute top-0 right-0 -m-20 w-80 h-80 bg-white/10 rounded-full blur-3xl'></div>
                <div className='relative z-10'>
                    <h2 className='text-4xl font-black tracking-tight'>Command Intelligence</h2>
                    <p className='text-blue-100 font-medium mt-2 max-w-2xl'>
                        Welcome back, Commander. Your transit operations are currently running within optimal parameters. 
                        Review pending deployments and fleet health below.
                    </p>
                    <div className='flex gap-4 mt-8'>
                        <div className='flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest'>
                            <Activity size={14} /> System Online
                        </div>
                        <div className='flex items-center gap-2 bg-green-500/30 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest'>
                            <Zap size={14} /> Real-time Sync Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <StatCard 
                    icon={<Users className='text-blue-600' />} 
                    label="Active Personnel" 
                    value={stats.totalDrivers} 
                    trend="+12%" 
                    isUp={true}
                />
                <StatCard 
                    icon={<Clock className='text-amber-500' />} 
                    label="Pending Review" 
                    value={stats.pendingApprovals} 
                    trend="Action Required" 
                    isUp={false}
                    isWarning={stats.pendingApprovals > 0}
                />
                <StatCard 
                    icon={<Bus className='text-purple-500' />} 
                    label="Managed Fleet" 
                    value={stats.activeBuses} 
                    trend="+3" 
                    isUp={true}
                />
                <StatCard 
                    icon={<ShieldCheck className='text-green-500' />} 
                    label="Service Health" 
                    value={stats.avgUptime} 
                    trend="Stable" 
                    isUp={true}
                />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Operations Status */}
                <div className='lg:col-span-2 bg-white dark:bg-gray-950 rounded-[40px] border border-gray-100 dark:border-gray-800 p-10 shadow-xl shadow-gray-200/50 dark:shadow-none'>
                    <div className='flex items-center justify-between mb-10'>
                        <div>
                            <h3 className='text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3'>
                                <BarChart3 className='text-blue-600' /> Fleet Intelligence
                            </h3>
                            <p className='text-gray-500 text-sm mt-1'>Logistical throughput analysis</p>
                        </div>
                        <div className='flex gap-2'>
                            <button className='p-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400 hover:text-blue-600 transition-colors'>
                                <TrendingUp size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Robust SVG-based Mock Graph */}
                    <div className='h-64 relative mt-4'>
                        <svg className='w-full h-full' preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75].map((h, i, arr) => {
                                const width = 100 / arr.length;
                                const x = i * width;
                                return (
                                    <g key={i} className='group cursor-pointer'>
                                        <rect 
                                            x={`${x + 0.5}%`} 
                                            y={`${100 - h}%`} 
                                            width={`${width - 1}%`} 
                                            height={`${h}%`} 
                                            fill="url(#barGradient)"
                                            rx="8"
                                            className='transition-all duration-300 hover:brightness-125'
                                        />
                                        <text 
                                            x={`${x + width/2}%`} 
                                            y={`${100 - h - 5}%`} 
                                            textAnchor="middle" 
                                            className='text-[8px] font-black fill-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                                        >
                                            {h}%
                                        </text>
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                    <div className='flex justify-between mt-6 px-2 text-[10px] font-black text-gray-400 uppercase tracking-[4px] border-t border-gray-100 dark:border-gray-800 pt-4'>
                        <span>Jan</span>
                        <span>May</span>
                        <span>Sep</span>
                        <span>Dec</span>
                    </div>
                </div>

                {/* Right Panel - System Alerts */}
                <div className='bg-white dark:bg-gray-950 rounded-[40px] border border-gray-100 dark:border-gray-800 p-10 shadow-xl shadow-gray-200/50 dark:shadow-none'>
                    <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8'>System Nexus</h3>
                    <div className='space-y-6'>
                        <AlertItem 
                            title="Database Sync" 
                            desc="Fleet data updated 2m ago" 
                            type="success"
                        />
                        <AlertItem 
                            title="Verification Alert" 
                            desc={`${stats.pendingApprovals} applicants awaiting review`} 
                            type={stats.pendingApprovals > 0 ? "warning" : "info"}
                        />
                        <AlertItem 
                            title="Network Load" 
                            desc="Global latency: 14ms" 
                            type="success"
                        />
                        <AlertItem 
                            title="Maintenance" 
                            desc="Backup scheduled for 03:00" 
                            type="info"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ icon, label, value, trend, isUp, isWarning }) => (
    <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/30 dark:shadow-none transition-transform hover:-translate-y-1 duration-300'>
        <div className='flex items-center justify-between mb-6'>
            <div className='p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl'>
                {icon}
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                isWarning ? 'bg-amber-100 text-amber-700' : 
                isUp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2'>{label}</p>
        <h4 className='text-3xl font-black text-gray-900 dark:text-white leading-none'>{value}</h4>
    </div>
)

const AlertItem = ({ title, desc, type }) => {
    const colors = {
        success: 'bg-green-500 text-green-500',
        warning: 'bg-amber-500 text-amber-500',
        info: 'bg-blue-500 text-blue-500'
    }
    return (
        <div className='flex gap-4 group cursor-default'>
            <div className={`w-1 h-10 rounded-full ${colors[type].split(' ')[0]} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
            <div>
                <p className='text-xs font-black text-gray-900 dark:text-white tracking-widest uppercase'>{title}</p>
                <p className='text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1'>{desc}</p>
            </div>
        </div>
    )
}

export default Dashboard
