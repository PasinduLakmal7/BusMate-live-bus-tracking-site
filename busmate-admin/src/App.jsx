import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/SideBar'
import Navbar from './components/NavBar'
import { Routes, Route, Navigate } from "react-router-dom";

import AddDrivers from './pages/addDrivers'
import ListAllDrivers from './pages/listDrivers'
import PendingDriverDetails from './pages/PendingDriverDetails'
import DriverDetails from './pages/DriverDetails'
import Dashboard from './pages/dashboard'

const App = () => {
  return (
    <div className='flex items-start min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 antialiased'>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />
      <div className='flex-1 h-screen overflow-y-auto bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300 flex flex-col'>
        <Navbar />
        <div className='flex-1'>
          <Routes>
            <Route path='/' element={<Navigate to="/dashboard" replace />} />
            <Route path='/dashboard' element={<Dashboard />} />
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
