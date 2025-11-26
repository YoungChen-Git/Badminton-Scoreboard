import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}) => {
  const baseStyles = "active:scale-95 transition-transform duration-100 font-medium rounded-xl flex items-center justify-center px-4 py-3 text-lg w-full disabled:opacity-50 disabled:active:scale-100";
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-ios-blue text-white shadow-sm";
      break;
    case 'secondary':
      variantStyles = "bg-white text-ios-blue shadow-sm border border-ios-blue/20";
      break;
    case 'destructive':
      variantStyles = "bg-white text-ios-red shadow-sm border border-ios-red/20";
      break;
    case 'ghost':
      variantStyles = "bg-transparent text-ios-blue hover:bg-ios-blue/5";
      break;
  }

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};