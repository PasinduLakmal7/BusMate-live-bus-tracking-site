import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
    ArrowLeft, Mail, Phone, Fingerprint, CreditCard, 
    Bus, MapPin, Calendar, User, ShieldCheck, 
    FileText, Briefcase, Info, List
} from 'lucide-react'

const DriverDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchDriverDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/drivers/${id}`)
            if (response.data.success) {
                setDriver(response.data.data)
            } else {
                toast.error("Driver not found")
                navigate('/list-all-drivers')
            }
        } catch (error) {
            console.error("Error fetching driver details:", error)
            toast.error("Failed to fetch driver details")
            navigate('/list-all-drivers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDriverDetails()
    }, [id])

    if (loading) return (
        <div className="p-10 flex items-center justify-center min-h-[70vh]">
            <div className='flex flex-col items-center gap-4'>
                <div className='w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <p className='text-gray-500 font-bold tracking-tight'>Aggregating driver profile...</p>
            </div>
        </div>
    )
    
    if (!driver) return null

    return (
        <div className='p-4 sm:p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500'>
            
            {/* Action Bar */}
            <div className='flex items-center justify-between mb-10'>
                <button
                    onClick={() => navigate('/list-all-drivers')}
                    className='group flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all'
                >
                    <div className='p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all'>
                        <ArrowLeft size={18} />
                    </div>
                    <span className='text-sm uppercase tracking-widest ml-1'>Back to Fleet</span>
                </button>
                <div className='flex items-center gap-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 px-4 py-2 rounded-2xl'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                    <span className='text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest'>Status: Active</span>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className='bg-white dark:bg-gray-950 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-500/5 overflow-hidden mb-12'>
                <div className='relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700'>
                    <div className='absolute -bottom-16 left-10'>
                        <div className='w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-950 overflow-hidden shadow-2xl bg-white dark:bg-gray-800 ring-2 ring-blue-500/20'>
                            {driver.photo_url ? (
                                <img src={driver.photo_url} alt={driver.full_name} className='w-full h-full object-cover' />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-gray-300'>
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className='pt-20 pb-10 px-10'>
                    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                        <div>
                            <h2 className='text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3'>
                                {driver.full_name}
                                <ShieldCheck size={28} className='text-blue-600' />
                            </h2>
                            <p className='text-gray-500 font-medium text-lg mt-1 italic'>
                                Professional Fleet Driver • ID: 1024{driver.driver_id}
                            </p>
                        </div>
                        <div className='flex gap-2 underline-offset-4'>
                            <div className='px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-400'>
                                Member since {new Date(driver.created_at).getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Information */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
                
                {/* Left Column: Personal Data */}
                <div className='lg:col-span-2 space-y-8'>
                    <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none'>
                        <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8 flex items-center gap-2'>
                            <Info size={14} /> Critical Information
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12'>
                            <DataPoint icon={<Mail size={16} />} label="Email Address" value={driver.email || "Private Registry"} />
                            <DataPoint icon={<Phone size={16} />} label="Operational Line" value={driver.phone} />
                            <DataPoint icon={<Fingerprint size={16} />} label="Verified ID (NIC)" value={driver.nic} isMono />
                            <DataPoint icon={<CreditCard size={16} />} label="License Registry" value={driver.license_number} isMono />
                            <DataPoint icon={<Calendar size={16} />} label="License Expiry" value={driver.license_expiry} />
                            <DataPoint icon={<Briefcase size={16} />} label="Operating Depot" value={driver.depot_name || "Regional Headquarters"} />
                        </div>
                    </div>

                    <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none'>
                        <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8 flex items-center gap-2'>
                            <Bus size={14} /> Assigned Assets
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            <div className='p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30'>
                                <p className='text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4'>Vehicle Specs</p>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-xs text-gray-500'>Bus Number</span>
                                    <span className='font-black font-mono text-gray-900 dark:text-white uppercase tracking-widest'>{driver.bus_number}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-xs text-gray-500'>Chassis Type</span>
                                    <span className='font-bold text-gray-900 dark:text-white'>{driver.bus_type}</span>
                                </div>
                            </div>
                            <div className='p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30'>
                                <p className='text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4'>Logistics Route</p>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className='text-xs text-gray-500'>Service Code</span>
                                    <span className='font-black text-gray-900 dark:text-white'>{driver.route_number}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-xs text-gray-500'>Route Name</span>
                                    <span className='font-bold text-gray-900 dark:text-white truncate max-w-[120px]'>{driver.route_name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Support Personnel & Docs */}
                <div className='space-y-8'>
                    <div className='bg-gray-900 p-8 rounded-[32px] text-white shadow-2xl shadow-blue-900/10'>
                        <h3 className='text-[10px] font-black text-blue-400 uppercase tracking-[4px] mb-6'>Ground Support</h3>
                        <div className='flex items-center gap-4 mb-6 border-b border-gray-800 pb-6'>
                            <div className='w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-blue-400'>
                                <User size={24} />
                            </div>
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase'>Conductor</p>
                                <p className='text-lg font-black'>{driver.conductor_name}</p>
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>Phone</span>
                                <span className='font-bold'>{driver.conductor_phone}</span>
                            </div>
                            <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-500'>ID No</span>
                                <span className='font-bold font-mono tracking-tighter'>{driver.conductor_nic}</span>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden'>
                        <h3 className='text-[10px] font-black text-blue-600 uppercase tracking-[4px] mb-6 flex items-center gap-2'>
                            <FileText size={14} /> Legal Registries
                        </h3>
                        <div className='space-y-4'>
                            <DocCard label="Identity Verification" url={driver.photo_url} />
                            <DocCard label="License Documentation" url={driver.license_photo_url} />
                            <DocCard label="Conductor Registry" url={driver.conductor_photo_url} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Schedule Data */}
            {driver.trips_json && (
                <div className='bg-white dark:bg-gray-950 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl'>
                    <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8 flex items-center gap-2'>
                        <List size={14} /> Service Schedule
                    </h3>
                    <div className='bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border dark:border-gray-800 overflow-x-auto'>
                        <pre className='text-[10px] font-mono dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                            {JSON.stringify(driver.trips_json, null, 4)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}

const DataPoint = ({ icon, label, value, isMono = false }) => (
    <div className='flex items-start gap-4'>
        <div className='mt-1 p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-lg'>
            {icon}
        </div>
        <div>
            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{label}</p>
            <p className={`text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 ${isMono ? 'font-mono tracking-tighter' : ''}`}>
                {value || "Not available"}
            </p>
        </div>
    </div>
)

const DocCard = ({ label, url }) => (
    <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-blue-500 transition-colors'>
        <div className='flex items-center gap-3 overflow-hidden'>
            <div className='w-10 h-10 rounded-xl bg-white dark:bg-gray-800 overflow-hidden border dark:border-gray-700 flex-shrink-0'>
                {url ? <img src={url} className='w-full h-full object-cover' /> : <div className='w-full h-full bg-gray-100 dark:bg-gray-800' />}
            </div>
            <p className='text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate'>{label}</p>
        </div>
        <button 
            onClick={() => url && window.open(url, '_blank')}
            className='p-1.5 text-gray-400 hover:text-blue-600 transition-colors'
        >
            <ArrowLeft size={14} className='rotate-180' />
        </button>
    </div>
)

export default DriverDetails
