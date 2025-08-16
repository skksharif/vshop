import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuth, user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/categories', icon: Grid3X3, label: 'Categories' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { 
      path: isAuth ? (user?.role === 'ADMIN' ? '/admin' : '/profile') : '/login', 
      icon: User, 
      label: isAuth ? 'Profile' : 'Login' 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] relative
              transition-colors duration-200
              ${isActive(path) 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            aria-label={label}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
            {badge && badge > 0 && (
              <span className="absolute top-1 right-1/2 transform translate-x-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};