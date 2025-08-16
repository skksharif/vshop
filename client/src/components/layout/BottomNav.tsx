import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';

/**
 * Bottom navigation component for mobile devices
 * Features Village Angel red and gold theme with authentication-aware navigation
 */
export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuth, user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  /**
   * Check if current path matches the navigation item
   */
  const isActive = (path: string) => location.pathname === path;

  // Define navigation items based on authentication status
  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home' 
    },
    { 
      path: '/categories', 
      icon: Grid3X3, 
      label: 'Categories' 
    },
    { 
      path: '/cart', 
      icon: ShoppingCart, 
      label: 'Cart', 
      badge: cartCount 
    },
    { 
      path: isAuth ? (user?.role === 'ADMIN' ? '/admin' : '/profile') : '/login', 
      icon: User, 
      label: isAuth ? (user?.role === 'ADMIN' ? 'Admin' : 'Profile') : 'Login',
      isAdmin: user?.role === 'ADMIN'
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 border-t-2 border-yellow-400 z-50 shadow-lg">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label, badge, isAdmin }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] relative
              transition-all duration-200
              ${isActive(path) 
                ? 'text-yellow-300 bg-red-500 shadow-inner' 
                : 'text-yellow-200 hover:text-yellow-100 hover:bg-red-500'
              }
            `}
            aria-label={label}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-1" />
              {isAdmin && (
                <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              )}
            </div>
            
            <span className="text-xs font-medium">{label}</span>
            
            {/* Cart Badge */}
            {badge && badge > 0 && (
              <span className="absolute top-1 right-1/2 transform translate-x-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};