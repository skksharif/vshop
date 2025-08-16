import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="relative">
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.productName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        <button 
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
          aria-label={`Add ${product.productName} to favorites`}
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
          {product.productName}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.0)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.color && (
              <span className="text-sm text-gray-500">{product.color}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {product.sizes.slice(0, 3).map((size) => (
              <span 
                key={size}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-xs text-gray-400">+{product.sizes.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};