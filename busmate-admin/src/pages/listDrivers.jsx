import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

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

  if (loading) return <div className="p-5 dark:text-white">Loading drivers...</div>

  return (
    <div className='p-2 sm:p-5 w-full'>
      <h2 className='text-2xl font-bold mb-6 dark:text-white'>All Approved Drivers</h2>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-xs font-bold'>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Photo</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Name</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Phone</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>NIC</th>
                <th className='px-6 py-4 border-b dark:border-gray-600'>Joined At</th>
                <th className='px-6 py-4 border-b dark:border-gray-600 text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y dark:divide-gray-700'>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr key={driver.driver_id} className='hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors dark:text-gray-300'>
                    <td className='px-6 py-4'>
                      {driver.photo_url ? (
                        <div className='w-10 h-10 rounded-full overflow-hidden border dark:border-gray-600 shadow-sm'>
                          <img src={driver.photo_url} alt={driver.full_name} className='w-full h-full object-cover' />
                        </div>
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400'>
                          <i className='fas fa-user'></i>
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 font-medium'>{driver.full_name}</td>
                    <td className='px-6 py-4'>{driver.phone}</td>
                    <td className='px-6 py-4 font-mono text-sm'>{driver.nic}</td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={() => navigate(`/driver/${driver.driver_id}`)}
                        className='bg-gray-800 hover:bg-black dark:bg-[#2563EB] dark:hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm'
                      >
                        See Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className='px-4 py-10 text-center text-gray-500 dark:text-gray-400 italic'>
                    No drivers found.
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
