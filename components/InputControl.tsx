import React from 'react';

interface InputControlProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  symbol?: string;
  type?: 'currency' | 'percentage' | 'text';
}

const InputControl: React.FC<InputControlProps> = ({ label, value, onChange, symbol, type = 'text' }) => {
  
  if (type === 'currency') {
    return (
      <div className="flex flex-col space-y-2">
        <label htmlFor={label} className="text-sm font-medium text-gray-400">{label}</label>
        <div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            id={label}
            type="number"
            step="any"
            value={value}
            onChange={onChange}
            className="w-full bg-transparent py-2.5 px-3 text-white outline-none"
            aria-label={label}
          />
          <span className="flex-shrink-0 pr-3 text-gray-400 font-semibold">
            {symbol}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'percentage') {
    return (
      <div className="flex flex-col space-y-2">
        <label htmlFor={label} className="text-sm font-medium text-gray-400">{label}</label>
        <div className="relative">
          <input
            id={label}
            type="number"
            step="any"
            value={value}
            onChange={onChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 pr-8 pl-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            aria-label={label}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            %
          </span>
        </div>
      </div>
    );
  }
  
  // Fallback for text type
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={label} className="text-sm font-medium text-gray-400">{label}</label>
      <input
        id={label}
        type="text"
        value={value}
        onChange={onChange}
        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
        aria-label={label}
      />
    </div>
  );
};

export default InputControl;
