import React from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/SideBar'
import Navbar from './components/NavBar'
import { Routes, Route } from "react-router-dom";

import AddDrivers from './pages/addDrivers'
import ListAllDrivers from './pages/listDrivers'
import PendingDriverDetails from './pages/PendingDriverDetails'
import DriverDetails from './pages/DriverDetails'

const App = () => {
  return (
    <div className='flex items-start min-h-screen bg-white dark:bg-black transition-colors duration-300'>
      <ToastContainer />
      <Sidebar />
      <div className='flex-1 h-screen overflow-y-scroll bg-[#F3FFF7] dark:bg-gray-900 transition-colors duration-300'>
        <Navbar />
        <div className='pt-8 pl-5 sm:pt-12 sm:pl-12 dark:text-white'>
          <Routes>
            <Route path='/add-driver' element={<AddDrivers />} />
            <Route path='/pending-driver/:id' element={<PendingDriverDetails />} />
            <Route path='/list-all-drivers' element={<ListAllDrivers />} />
            <Route path='/driver/:id' element={<DriverDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
