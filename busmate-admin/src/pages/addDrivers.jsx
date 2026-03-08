import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AddDrivers = () => {
  const [pendingDrivers, setPendingDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchPendingDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/drivers/pending')
      if (response.data.success) {
        setPendingDrivers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching pending drivers:", error)
      toast.error("Failed to fetch pending drivers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDrivers()
  }, [])

  if (loading) return <div className="p-5 dark:text-white">Loading pending registrations...</div>

  return (
    <div className='p-2 sm:p-5 w-full'>
      <h2 className='text-2xl font-bold mb-6 dark:text-white'>Pending Driver Approvals</h2>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs font-bold'>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Name</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Phone</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Bus No</th>
                <th className='px-6 py-4 border-b dark:border-gray-600 text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y dark:divide-gray-700'>
              {pendingDrivers.length > 0 ? (
                pendingDrivers.map((driver) => (
                  <tr key={driver.pending_id} className='hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors dark:text-gray-300'>
                    <td className='px-6 py-4 font-medium'>{driver.full_name}</td>
                    <td className='px-6 py-4'>{driver.phone}</td>
                    <td className='px-6 py-4 font-mono'>{driver.bus_number}</td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={() => navigate(`/pending-driver/${driver.pending_id}`)}
                        className='bg-gray-800 hover:bg-black dark:bg-[#2563EB] dark:hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm'
                      >
                        See Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className='px-4 py-10 text-center text-gray-500 dark:text-gray-400 italic'>
                    No pending registrations found.
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

export default AddDrivers
