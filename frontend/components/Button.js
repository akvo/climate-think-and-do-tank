import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[100px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: `
      bg-primary-500 text-white 
      hover:bg-primary-700 
      focus:ring-primary-500 
      disabled:bg-primary-300 disabled:text-primary-100
      active:bg-primary-700
      shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent text-primary-500 
      hover:bg-primary-50 hover:text-primary-600
      focus:ring-primary-500 
      disabled:text-primary-300 disabled:hover:bg-transparent
      active:bg-primary-100
    `,
    outline: `
      bg-transparent border-2 border-primary-500 text-primary-500 
      hover:bg-primary-500 hover:text-white hover:border-primary-500
      focus:ring-primary-500 
      disabled:border-primary-300 disabled:text-primary-300 disabled:hover:bg-transparent disabled:hover:text-primary-300
      active:bg-primary-600 active:border-primary-600
    `,
    secondary: `
      bg-gray-100 text-gray-700 
      hover:bg-gray-200 
      focus:ring-gray-500 
      disabled:bg-gray-50 disabled:text-gray-400
      active:bg-gray-300
      shadow-sm
    `,
    danger: `
      bg-red-500 text-white 
      hover:bg-red-600 
      focus:ring-red-500 
      disabled:bg-red-300 disabled:text-red-100
      active:bg-red-700
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-green-500 text-white 
      hover:bg-green-600 
      focus:ring-green-500 
      disabled:bg-green-300 disabled:text-green-100
      active:bg-green-700
      shadow-sm hover:shadow-md
    `,
  };

  const hasCustomColors =
    /(?:^|\s)(?:text-|bg-|border-|hover:|focus:|active:)/.test(className);

  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${!hasCustomColors ? variantStyles[variant] : ''}
    ${className}
  `
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
