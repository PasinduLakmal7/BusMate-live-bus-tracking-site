import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { UserCheck, Phone, Bus, ChevronRight, Inbox, Clock } from 'lucide-react'

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

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className='flex flex-col items-center gap-4'>
        <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        <p className='text-gray-500 font-medium animate-pulse'>Loading applications...</p>
      </div>
    </div>
  )

  return (
    <div className='p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500'>
      
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div>
          <h2 className='text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3'>
            Verification Queue <span className='bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full'>{pendingDrivers.length}</span>
          </h2>
          <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
            Review and approve new driver registrations
          </p>
        </div>
        <div className='bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-4 py-2 rounded-xl flex items-center gap-2'>
          <Clock size={16} className='text-amber-600' />
          <span className='text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tighter'>Action Required</span>
        </div>
      </div>

      {/* Table Container */}
      <div className='bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-widest'>
                <th className='px-8 py-5'>Applicant Name</th>
                <th className='px-8 py-5'>Contact Number</th>
                <th className='px-8 py-5'>Assigned Vehicle</th>
                <th className='px-8 py-5 text-right'>Process</th>
              </tr>
            </thead>
            <tbody className='divide-y border-t border-gray-100 dark:border-gray-900'>
              {pendingDrivers.length > 0 ? (
                pendingDrivers.map((driver) => (
                  <tr key={driver.pending_id} className='group hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-all duration-300'>
                    <td className='px-8 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors'>
                          <UserCheck size={18} />
                        </div>
                        <p className='text-sm font-black text-gray-900 dark:text-white capitalize'>
                          {driver.full_name}
                        </p>
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
                        <Bus size={14} className='text-gray-400' />
                        <span className='text-xs font-mono font-black tracking-widest uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full'>
                          {driver.bus_number}
                        </span>
                      </div>
                    </td>
                    <td className='px-8 py-5 text-right'>
                      <button
                        onClick={() => navigate(`/pending-driver/${driver.pending_id}`)}
                        className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95'
                      >
                        Review Docs <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className='px-8 py-24 text-center'>
                    <div className='flex flex-col items-center gap-4'>
                      <div className='w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
                        <Inbox size={40} className='text-gray-200 dark:text-gray-800' />
                      </div>
                      <div>
                        <p className='text-gray-900 dark:text-white font-black uppercase text-xs tracking-tighter'>Queue is Empty</p>
                        <p className='text-gray-500 dark:text-gray-400 text-xs mt-1'>
                          All driver registrations have been processed.
                        </p>
                      </div>
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

export default AddDrivers
