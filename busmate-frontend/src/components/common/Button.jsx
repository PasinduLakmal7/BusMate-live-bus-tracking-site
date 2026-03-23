import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900',
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} px-4 py-2 text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
