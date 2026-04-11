import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
    ArrowLeft, Mail, Phone, Fingerprint, CreditCard, 
    Bus, MapPin, Calendar, UserCheck, ShieldAlert,
    FileText, User, Info, CircleCheck, AlertCircle, Briefcase
} from 'lucide-react'

const PendingDriverDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchDriverDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/drivers/pending/${id}`)
            if (response.data.success) {
                setDriver(response.data.data)
            } else {
                toast.error("Driver not found")
                navigate('/add-driver')
            }
        } catch (error) {
            console.error("Error fetching driver details:", error)
            toast.error("Failed to load driver details")
            navigate('/add-driver')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchDriverDetails()
        }
    }, [id])

    const handleApprove = async () => {
        const toastId = toast.loading("Processing approval Dossier...");
        try {
            const response = await axios.post(`http://localhost:4000/drivers/approve/${id}`);

            if (response.data.success) {
                toast.update(toastId, {
                    render: "Personnel verified and added to fleet!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
                navigate('/add-driver');
            } else {
                toast.update(toastId, {
                    render: response.data.error || "Verification failed",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error("❌ Approval error:", error);
            const errorMsg = error.response?.data?.error || error.message || "Error finalizing registration";
            toast.update(toastId, {
                render: errorMsg,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    }

    if (loading) return (
        <div className="p-10 flex items-center justify-center min-h-[70vh]">
            <div className='flex flex-col items-center gap-4'>
                <div className='w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <p className='text-gray-500 font-bold tracking-tight text-center animate-pulse'>Aggregating applicant dossiers...</p>
            </div>
        </div>
    )

    if (!driver) return (
        <div className='p-20 text-center'>
            <p className='text-gray-500 font-bold'>Data Unavailable</p>
            <button onClick={() => navigate('/add-driver')} className='mt-4 text-blue-600 font-bold underline'>Return to Queue</button>
        </div>
    )

    // Fallback for photo property names
    const mainPhoto = driver.photo_url || driver.driver_photo_url;

    return (
        <div className='p-4 sm:p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500'>
            
            {/* Action Bar */}
            <div className='flex items-center justify-between mb-10'>
                <button
                    onClick={() => navigate('/add-driver')}
                    className='group flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all'
                >
                    <div className='p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all'>
                        <ArrowLeft size={18} />
                    </div>
                    <span className='text-sm uppercase tracking-widest ml-1'>Queue Registry</span>
                </button>
                <div className='flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-4 py-2 rounded-2xl'>
                    <ShieldAlert size={16} className='text-amber-600' />
                    <span className='text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest'>Verification Pending</span>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className='bg-white dark:bg-gray-950 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-500/5 overflow-hidden mb-12'>
                <div className='relative h-32 bg-gradient-to-r from-amber-500 to-orange-600'>
                    <div className='absolute -bottom-16 left-10'>
                        <div className='w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-950 overflow-hidden shadow-2xl bg-white dark:bg-gray-800 ring-2 ring-amber-500/20'>
                            {mainPhoto ? (
                                <img src={mainPhoto} alt={driver.full_name} className='w-full h-full object-cover' />
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
                                <AlertCircle size={28} className='text-amber-500' />
                            </h2>
                            <p className='text-gray-500 font-medium text-lg mt-1 italic'>
                                New Applicant Dossier • Ref: APP-900{id}
                            </p>
                        </div>
                        <div className='flex gap-4'>
                            <button
                                onClick={handleApprove}
                                className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all active:scale-95'
                            >
                                <CircleCheck size={16} /> Finalize Approval
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Information */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
                {/* Personal Info */}
                <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl'>
                    <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8 flex items-center gap-2'>
                        <Info size={14} /> Applicant Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 text-sm'>
                        <DataPoint icon={<Mail size={16} />} label="Email Address" value={driver.email} />
                        <DataPoint icon={<Phone size={16} />} label="Contact Line" value={driver.phone} />
                        <DataPoint icon={<Fingerprint size={16} />} label="NIC Identity" value={driver.nic} isMono />
                        <DataPoint icon={<CreditCard size={16} />} label="License No" value={driver.license_number} isMono />
                        <DataPoint icon={<Calendar size={16} />} label="License Expiry" value={driver.license_expiry} />
                        <DataPoint icon={<Bus size={16} />} label="Bus Designation" value={driver.bus_number} />
                    </div>
                </div>

                {/* Service Info */}
                <div className='bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl'>
                    <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-8 flex items-center gap-2'>
                        <MapPin size={14} /> Service Deployment
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 text-sm'>
                        <DataPoint icon={<MapPin size={16} />} label="Assigned Route" value={`${driver.route_number || 'N/A'} - ${driver.route_name || 'Unassigned'}`} />
                        <DataPoint icon={<Briefcase size={16} />} label="Depot Unit" value={driver.depot_name || "Regional Headquarters"} />
                        <DataPoint icon={<UserCheck size={16} />} label="Conductor Name" value={driver.conductor_name} />
                        <DataPoint icon={<Phone size={16} />} label="Conductor Contact" value={driver.conductor_phone} />
                        <DataPoint icon={<Fingerprint size={16} />} label="Conductor NIC" value={driver.conductor_nic} isMono />
                    </div>
                </div>
            </div>

            {/* Document Verification Gallery */}
            <div className='bg-white dark:bg-gray-950 p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl mb-12'>
                <h3 className='text-xs font-black text-blue-600 uppercase tracking-[4px] mb-10 flex items-center gap-2 justify-center'>
                    <FileText size={16} /> Forensic Document Verification
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    <DocPreview label="Applicant Portrait" url={mainPhoto} />
                    <DocPreview label="Primary Driving License" url={driver.license_photo_url} />
                    <DocPreview label="Supporting Personnel Identity" url={driver.conductor_photo_url} />
                </div>
            </div>
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
                {value || "Registry Null"}
            </p>
        </div>
    </div>
)

const DocPreview = ({ label, url }) => (
    <div className='space-y-4 group'>
        <p className='text-[10px] font-black text-center text-gray-400 uppercase tracking-widest'>{label}</p>
        <div className='aspect-video bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 overflow-hidden relative cursor-zoom-in'>
            {url ? (
                <img src={url} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' alt={label} onClick={() => window.open(url, '_blank')} />
            ) : (
                <div className='w-full h-full flex items-center justify-center text-gray-300 italic text-xs'>
                    Attachment unavailable
                </div>
            )}
        </div>
    </div>
)

export default PendingDriverDetails
