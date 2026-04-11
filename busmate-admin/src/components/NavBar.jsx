import { useDarkMode } from '../context/DarkModeContext'
import { Sun, Moon, Bell, Search } from 'lucide-react'

const Navbar = () => {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className='sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 px-5 sm:px-10 py-4 flex justify-between items-center transition-all duration-300'>
            
            <div className='flex items-center gap-4'>
                <h1 className='text-lg font-bold text-gray-900 dark:text-white'>
                    Dashboard Overview
                </h1>
                <div className='hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700'>
                    <Search size={16} className='text-gray-400' />
                    <input 
                        type="text" 
                        placeholder="Search drivers..." 
                        className='bg-transparent border-none outline-none text-xs w-48 dark:text-gray-200'
                    />
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <button className='p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors relative'>
                    <Bell size={18} />
                    <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800'></span>
                </button>

                <button
                    onClick={toggleDarkMode}
                    className='p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-all active:scale-90'
                    aria-label='Toggle Dark Mode'
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </div>
    )
}

export default Navbar
