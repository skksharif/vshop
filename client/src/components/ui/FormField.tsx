import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  register?: UseFormRegisterReturn;
  children?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  type = 'text',
  placeholder,
  required = false,
  register,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || (
        <input
          type={type}
          placeholder={placeholder}
          {...register}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm transition-colors
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          aria-invalid={error ? 'true' : 'false'}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};