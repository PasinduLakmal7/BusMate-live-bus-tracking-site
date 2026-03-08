import { useDarkMode } from '../context/DarkModeContext'

const Navbar = () => {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className='navbar w-full border-b-2 border-gray-800 dark:border-gray-700 px-5 sm:px-12 py-4 text-lg flex justify-between items-center bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300'>
            <h1 className='font-bold'>Admin Panel</h1>
            <button
                onClick={toggleDarkMode}
                className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                aria-label='Toggle Dark Mode'
            >
                {darkMode ? '🌙' : '☀️'}
            </button>
        </div>
    )
}

export default Navbar
