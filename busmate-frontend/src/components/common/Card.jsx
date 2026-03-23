import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden ${
        hover ? 'cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
