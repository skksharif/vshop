import React from 'react';
import type { Category } from '../../types';

interface CategoryChipProps {
  category: any;
  isActive?: boolean;
  onClick: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isActive = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200
        ${isActive
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
        }
      `}
    >
      <img
        src={category.image || 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=50'}
        alt={category.name}
        className="w-6 h-6 rounded-full object-cover"
      />
      <span className="font-medium text-sm whitespace-nowrap">
        {category.name}
      </span>
    </button>
  );
};