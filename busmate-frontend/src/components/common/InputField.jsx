import React from 'react';

const InputField = React.forwardRef(({ label, icon: Icon, rightElement, type = 'text', className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all flex items-center">
        {Icon && (
          <div className="pl-3 flex items-center flex-shrink-0 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`block flex-grow rounded-xl bg-transparent py-2.5 sm:text-sm outline-none text-gray-900 dark:text-white ${
            Icon ? 'pl-2' : 'pl-4'
          } ${rightElement ? 'pr-2' : 'pr-4'}`}
          {...props}
        />
        {rightElement && (
          <div className="pr-1 flex items-center flex-shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
});

export default InputField;
