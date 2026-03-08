import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

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

    if (loading) return <div className="p-10 dark:text-white text-center">Loading driver details...</div>
    if (!driver) return null

    return (
        <div className='p-2 sm:p-5 w-full'>
            <div className='flex items-center justify-between mb-8'>
                <h2 className='text-2xl font-bold dark:text-white'>Approved Driver Details</h2>
                <button
                    onClick={() => navigate('/list-all-drivers')}
                    className='bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold transition-all'
                >
                    &larr; Back to List
                </button>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden'>
                <div className='p-6 md:p-8 space-y-10'>
                    {/* Header Section */}
                    <div className='flex flex-col md:flex-row gap-10 border-b dark:border-gray-700 pb-8'>
                        <div className='w-48 h-48 rounded-2xl overflow-hidden border-4 border-[#2563EB]/10 dark:border-[#2563EB]/30 shadow-xl self-center md:self-start'>
                            {driver.photo_url ? (
                                <img src={driver.photo_url} alt={driver.full_name} className='w-full h-full object-cover' />
                            ) : (
                                <div className='w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400'>
                                    <i className='fas fa-user text-6xl'></i>
                                </div>
                            )}
                        </div>
                        <div className='flex-1 space-y-4 text-center md:text-left'>
                            <div>
                                <h3 className='text-3xl font-bold dark:text-white'>{driver.full_name}</h3>
                                <p className='text-[#2563EB] font-semibold text-lg'>Verified BusMate Driver</p>
                            </div>
                            <div className='flex flex-wrap justify-center md:justify-start gap-3'>
                                <span className='px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium'>
                                    ID: #{driver.driver_id}
                                </span>
                                <span className='px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full text-sm font-medium'>
                                    Status: Active
                                </span>
                                <span className='px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 rounded-full text-sm font-medium'>
                                    Member since: {new Date(driver.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        {/* Personal & Contact */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Personal & Contact</h3>
                            <div className='grid grid-cols-1 gap-4 text-sm'>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Email</span> <p className='dark:text-gray-200'>{driver.email || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Phone</span> <p className='dark:text-gray-200'>{driver.phone}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>NIC Number</span> <p className='dark:text-gray-200 font-mono'>{driver.nic}</p></div>
                            </div>
                        </div>

                        {/* License & Vehicle */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>License & Vehicle</h3>
                            <div className='grid grid-cols-1 gap-4 text-sm'>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>License Number</span> <p className='dark:text-gray-200'>{driver.license_number || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>License Expiry</span> <p className='dark:text-gray-200'>{driver.license_expiry || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Bus Number</span> <p className='dark:text-gray-200 font-bold'>{driver.bus_number || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Bus Type</span> <p className='dark:text-gray-200'>{driver.bus_type || 'N/A'}</p></div>
                            </div>
                        </div>

                        {/* Conductor Info */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Conductor Info</h3>
                            <div className='grid grid-cols-1 gap-4 text-sm'>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor Name</span> <p className='dark:text-gray-200'>{driver.conductor_name || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor Phone</span> <p className='dark:text-gray-200'>{driver.conductor_phone || 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor NIC</span> <p className='dark:text-gray-200'>{driver.conductor_nic || 'N/A'}</p></div>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Route Information</h3>
                            <div className='grid grid-cols-1 gap-4 text-sm'>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Assigned Route</span> <p className='dark:text-gray-200'>{driver.route_number ? `${driver.route_number} - ${driver.route_name}` : 'N/A'}</p></div>
                                <div><span className='text-gray-500 font-medium block text-xs uppercase'>Depot / Company</span> <p className='dark:text-gray-200'>{driver.depot_name || 'N/A'}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className='space-y-6 pt-6'>
                        <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Verification Documents</h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                            <div className='space-y-3'>
                                <p className='text-xs font-bold text-gray-400 uppercase'>Driver Identity Photo</p>
                                <div className='aspect-video bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-dashed dark:border-gray-600 flex items-center justify-center'>
                                    {driver.photo_url ? (
                                        <img src={driver.photo_url} className='w-full h-full object-contain' alt="Identity" />
                                    ) : <span className='text-gray-400 italic text-sm'>No photo uploaded</span>}
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <p className='text-xs font-bold text-gray-400 uppercase'>License Document</p>
                                <div className='aspect-video bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-dashed dark:border-gray-600 flex items-center justify-center'>
                                    {driver.license_photo_url ? (
                                        <img src={driver.license_photo_url} className='w-full h-full object-contain' alt="License" />
                                    ) : <span className='text-gray-400 italic text-sm'>No photo uploaded</span>}
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <p className='text-xs font-bold text-gray-400 uppercase'>Conductor Identity Photo</p>
                                <div className='aspect-video bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-dashed dark:border-gray-600 flex items-center justify-center'>
                                    {driver.conductor_photo_url ? (
                                        <img src={driver.conductor_photo_url} className='w-full h-full object-contain' alt="Conductor" />
                                    ) : <span className='text-gray-400 italic text-sm'>No photo uploaded</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {driver.trips_json && (
                        <div className='space-y-4 pt-6'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Trip Schedule</h3>
                            <div className='bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border dark:border-gray-700'>
                                <pre className='text-xs font-mono dark:text-gray-300 overflow-x-auto whitespace-pre-wrap'>
                                    {JSON.stringify(driver.trips_json, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DriverDetails
