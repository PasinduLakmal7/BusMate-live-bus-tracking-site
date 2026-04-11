import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Users, UserPlus, Shield, LayoutDashboard } from 'lucide-react'

const Sidebar = () => {
    return (
        <div className='w-20 sm:w-64 bg-white dark:bg-gray-950 min-h-screen border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-50'>
            
            {/* Logo Section */}
            <div className='h-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-900'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20'>
                        <img src={assets.logo} className='w-6 invert brightness-200' alt="Logo" />
                    </div>
                    <h1 className='hidden sm:block text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase'>
                        Bus<span className='text-blue-600'>Mate</span>
                    </h1>
                </div>
            </div>

            {/* Navigation Section */}
            <div className='flex-1 py-6 px-3 flex flex-col gap-2'>
                <p className='hidden sm:block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-4'>
                    Management
                </p>

                <SidebarItem 
                    to='/add-driver' 
                    icon={<UserPlus size={20} />} 
                    label="Pending Drivers" 
                />
                
                <SidebarItem 
                    to='/list-all-drivers' 
                    icon={<Users size={20} />} 
                    label="All Drivers" 
                />

                <div className='mt-auto'>
                    <SidebarItem 
                        to='/dashboard' 
                        icon={<LayoutDashboard size={20} />} 
                        label="System Health" 
                    />
                </div>
            </div>

            {/* User Profile Mini */}
            <div className='p-4 border-t border-gray-100 dark:border-gray-900'>
                <div className='flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800'>
                    <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600'>
                        <Shield size={16} />
                    </div>
                    <div className='hidden sm:block overflow-hidden'>
                        <p className='text-xs font-bold text-gray-900 dark:text-white truncate'>Admin User</p>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate'>Super Admin</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SidebarItem = ({ to, icon, label }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `
            flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all duration-200
            ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'}
        `}
    >
        <span className='flex-shrink-0'>{icon}</span>
        <span className='hidden sm:block'>{label}</span>
    </NavLink>
)

export default Sidebar
