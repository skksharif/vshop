import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';

/**
 * Navigation bar component with Village Angel branding
 * Features red and gold theme, authentication status, and cart indicator
 */
export const NavBar: React.FC = () => {
  const { user, isAuth, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const cartCount = getItemCount();

  /**
   * Handle user logout
   * Clears authentication state and redirects to home
   */
  const handleLogout = () => {
    console.log('NavBar: Logging out user...');
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b-2 border-yellow-400 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Village Angel Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            <Crown className="w-8 h-8" />
            <span>Village Angel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Button */}
            <button 
              className="p-2 text-yellow-200 hover:text-yellow-100 hover:bg-red-500 transition-colors rounded-lg"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart */}
            <Link 
              to="/cart" 
              className="p-2 text-yellow-200 hover:text-yellow-100 hover:bg-red-500 transition-colors rounded-lg relative"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Authentication Section */}
            {isAuth ? (
              <div className="flex items-center space-x-4">
                {/* User Profile Link */}
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/profile'}
                  className="flex items-center space-x-2 text-yellow-200 hover:text-yellow-100 hover:bg-red-500 px-3 py-2 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm font-medium">
                    {user?.fullName || 'Profile'}
                  </span>
                  {user?.role === 'ADMIN' && (
                    <Crown className="w-4 h-4 text-yellow-300" />
                  )}
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-yellow-200 hover:text-red-200 hover:bg-red-500 transition-colors rounded-lg"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Sign In Link */}
                <Link
                  to="/login"
                  className="text-sm font-medium text-yellow-200 hover:text-yellow-100 px-3 py-2 rounded-lg hover:bg-red-500 transition-colors"
                >
                  Sign In
                </Link>
                
                {/* Sign Up Button */}
                <Link
                  to="/register"
                  className="bg-yellow-500 hover:bg-yellow-400 text-red-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart Icon */}
          <div className="md:hidden">
            <Link 
              to="/cart" 
              className="p-2 text-yellow-200 hover:text-yellow-100 hover:bg-red-500 transition-colors rounded-lg relative"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};