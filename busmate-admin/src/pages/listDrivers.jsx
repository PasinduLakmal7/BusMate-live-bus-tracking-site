import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { User, Users, Phone, IdCard, Calendar, ChevronRight, Filter, Download } from 'lucide-react'

const ListDrivers = () => {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchDrivers = async () => {
        try {
            const response = await axios.get('http://localhost:4000/drivers/all')
            if (response.data.success) {
                setDrivers(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching drivers:", error)
            toast.error("Failed to fetch drivers list")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrivers()
    }, [])

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className='flex flex-col items-center gap-4'>
                <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <p className='text-gray-500 font-medium animate-pulse'>Fetching drivers...</p>
            </div>
        </div>
    )

    return (
        <div className='p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500'>
            
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                    <h2 className='text-3xl font-black text-gray-900 dark:text-white tracking-tight'>
                        Verified Drivers
                    </h2>
                    <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
                        Manage and monitor all active transit personnel
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <button className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-all'>
                        <Filter size={16} /> Filter
                    </button>
                    <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95'>
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className='bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead>
                            <tr className='bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-widest'>
                                <th className='px-8 py-5'>Identity</th>
                                <th className='px-8 py-5'>Contact Info</th>
                                <th className='px-8 py-5'>Verified NIC</th>
                                <th className='px-8 py-5 text-right'>Joined Date</th>
                                <th className='px-8 py-5 text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y border-t border-gray-100 dark:border-gray-900'>
                            {drivers.length > 0 ? (
                                drivers.map((driver) => (
                                    <tr key={driver.driver_id} className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all duration-300'>
                                        <td className='px-8 py-5'>
                                            <div className='flex items-center gap-4'>
                                                <div className='w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-md group-hover:scale-110 transition-transform duration-300'>
                                                    {driver.photo_url ? (
                                                        <img src={driver.photo_url} alt={driver.full_name} className='w-full h-full object-cover' />
                                                    ) : (
                                                        <div className='w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600'>
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className='text-sm font-black text-gray-900 dark:text-white leading-tight'>
                                                        {driver.full_name}
                                                    </p>
                                                    <p className='text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-0.5'>
                                                        ID: 1024{driver.driver_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5'>
                                            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                                                <Phone size={14} className='text-gray-400' />
                                                <span className='text-xs font-semibold'>{driver.phone}</span>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5'>
                                            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                                                <IdCard size={14} className='text-gray-400' />
                                                <span className='text-xs font-mono font-bold tracking-tight bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md'>{driver.nic}</span>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5 text-right'>
                                            <div className='flex items-center justify-end gap-2 text-gray-500 dark:text-gray-400'>
                                                <Calendar size={14} />
                                                <span className='text-xs font-medium'>
                                                    {new Date(driver.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-8 py-5 text-right'>
                                            <button
                                                onClick={() => navigate(`/driver/${driver.driver_id}`)}
                                                className='inline-flex items-center gap-2 bg-gray-100 hover:bg-blue-600 dark:bg-gray-900 dark:hover:bg-blue-600 text-gray-600 hover:text-white dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95'
                                            >
                                                Details <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className='px-8 py-20 text-center'>
                                        <div className='flex flex-col items-center gap-3'>
                                            <Users size={48} className='text-gray-200 dark:text-gray-800' />
                                            <p className='text-gray-500 dark:text-gray-400 font-medium italic'>
                                                No active personnel registered in the database.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ListDrivers
