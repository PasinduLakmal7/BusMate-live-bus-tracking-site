import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

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
            toast.error("Failed to fetch driver details")
            navigate('/add-driver')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDriverDetails()
    }, [id])

    const handleApprove = async () => {
        const toastId = toast.loading("Processing approval...");
        try {
            const response = await axios.post(`http://localhost:4000/drivers/approve/${id}`);

            if (response.data.success) {
                toast.update(toastId, {
                    render: "Driver approved successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });
                navigate('/add-driver');
            } else {
                toast.update(toastId, {
                    render: response.data.error || "Approval failed",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error("❌ Approval error:", error);
            const errorMsg = error.response?.data?.error || error.message || "Error approving driver";
            toast.update(toastId, {
                render: errorMsg,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    }

    if (loading) return <div className="p-10 dark:text-white">Loading registration details...</div>
    if (!driver) return null

    return (
        <div className='p-2 sm:p-5 w-full'>
            <div className='flex items-center justify-between mb-8'>
                <h2 className='text-2xl font-bold dark:text-white'>Driver Registration Details</h2>
                <button
                    onClick={() => navigate('/add-driver')}
                    className='bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold transition-all'
                >
                    &larr; Back to List
                </button>
            </div>

            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 overflow-hidden'>
                {/* Detail Content */}
                <div className='p-6 md:p-8 space-y-10'>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        {/* Personal Info */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Personal Information</h3>
                            <div className='grid grid-cols-1 gap-3 text-sm'>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Full Name</span> {driver.full_name}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Email Address</span> {driver.email}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Phone Number</span> {driver.phone}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>NIC Number</span> {driver.nic}</p>
                            </div>
                        </div>

                        {/* License & Vehicle */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>License & Vehicle</h3>
                            <div className='grid grid-cols-1 gap-3 text-sm'>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>License Number</span> {driver.license_number}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>License Expiry</span> {driver.license_expiry}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Bus Number</span> <span className='font-mono font-bold'>{driver.bus_number}</span></p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Bus Type</span> {driver.bus_type || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Conductor Info */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Conductor Info</h3>
                            <div className='grid grid-cols-1 gap-3 text-sm'>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor Name</span> {driver.conductor_name || 'N/A'}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor Phone</span> {driver.conductor_phone || 'N/A'}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Conductor NIC</span> {driver.conductor_nic || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Route Information</h3>
                            <div className='grid grid-cols-1 gap-3 text-sm'>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Assigned Route</span> {driver.route_number} - {driver.route_name}</p>
                                <p className='dark:text-gray-300'><span className='text-gray-500 font-medium block text-xs uppercase'>Depot / Company</span> {driver.depot_name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className='space-y-4'>
                        <h3 className='text-lg font-bold text-[#2563EB] border-b-2 dark:border-gray-700 pb-2'>Verification Documents</h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed dark:border-gray-600'>
                                <p className='text-xs font-bold text-gray-400 uppercase mb-3'>Driver Identity Photo</p>
                                {driver.driver_photo_url ? (
                                    <img src={driver.driver_photo_url} className='w-full h-48 object-contain' alt="Driver" />
                                ) : <div className='h-48 flex items-center justify-center text-gray-400 italic'>No photo uploaded</div>}
                            </div>
                            <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed dark:border-gray-600'>
                                <p className='text-xs font-bold text-gray-400 uppercase mb-3'>License Document</p>
                                {driver.license_photo_url ? (
                                    <img src={driver.license_photo_url} className='w-full h-48 object-contain' alt="License" />
                                ) : <div className='h-48 flex items-center justify-center text-gray-400 italic'>No photo uploaded</div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='pt-10 flex justify-center'>
                        <button
                            onClick={handleApprove}
                            className='bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-12 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95'
                        >
                            Approve & Make Driver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PendingDriverDetails
