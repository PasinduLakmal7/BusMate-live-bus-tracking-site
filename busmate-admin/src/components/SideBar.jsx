import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {

  return (
    <div className='bg-gray-900 dark:bg-black min-h-screen pl-[4vw] transition-colors duration-300'>

      <div className='bg-gray-900 dark:bg-black min-h-screen flex flex-col gap-4'>

        <img src={assets.logo} className='mt-8 w-16 hidden sm:block mx-auto mb-6' />
        <img src={assets.logo} className='mt-5 w-10 mr-5 sm:hidden block' />

        <NavLink to='/add-driver' className={({ isActive }) => `flex items-center gap-2.5 p-2 pr-[max(8vw, 10px)] text-sm font-medium border transition-all ${isActive ? 'bg-[#2563EB] text-white border-[#2563EB] drop-shadow-[-4px_4px_#1e3a8a]' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-black dark:border-gray-700 drop-shadow-[-4px_4px_#2563EB] hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <img src={assets.logo} className='w-5' />
          <p className='hidden sm:block'>Pending Drivers</p>
        </NavLink>
        <NavLink to='/list-all-drivers' className={({ isActive }) => `flex items-center gap-2.5 p-2 pr-[max(8vw, 10px)] text-sm font-medium border transition-all ${isActive ? 'bg-[#2563EB] text-white border-[#2563EB] drop-shadow-[-4px_4px_#1e3a8a]' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-black dark:border-gray-700 drop-shadow-[-4px_4px_#2563EB] hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <img src={assets.logo} className='w-5' />
          <p className='hidden sm:block'>All Drivers</p>
        </NavLink>

      </div>


    </div>
  )
}

export default Sidebar
