import React from 'react';

const InputField = ({ label, icon: Icon, type = 'text', className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          className={`block w-full rounded-xl bg-transparent py-2.5 sm:text-sm outline-none ${
            Icon ? 'pl-10 pr-3' : 'px-4'
          }`}
          {...props}
        />
      </div>
    </div>
  );
};

export default InputField;
