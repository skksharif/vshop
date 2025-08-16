import React from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Phone, CreditCard, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vshops.example';

export const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Profile — vshops</title>
        <meta name="description" content="View and manage your vshops account profile, orders, and preferences." />
        <link rel="canonical" href={`${SITE_URL}/profile`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.fullName}</h1>
                <p className="text-blue-100">@{user.userName}</p>
                <div className="flex items-center mt-2">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {user.role === 'ADMIN' ? 'Business Account' : 'Personal Account'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{user.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">KYC Card</p>
                      <p className="font-medium">{user.kycCard}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Status
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Verification Status</p>
                    <div className={`flex items-center mt-1 ${
                      user.isVerified ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      <Shield className="w-4 h-4 mr-1" />
                      <span className="font-medium">
                        {user.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Credit Balance</p>
                    <p className="font-medium text-lg">
                      ${user.creditBal.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
              
              <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
                Order History
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};