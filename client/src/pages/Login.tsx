import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Crown } from 'lucide-react';
import { login } from '../services/auth';
import { useAuthStore } from '../store/auth';
import { FormField } from '../components/ui/FormField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://villageangel.example';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login page component for Village Angel
 * Handles user authentication with proper state management and token refresh setup
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Login mutation with proper error handling and state management
   */
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log('Login successful:', data.user.fullName);
      
      // Save authentication state with automatic token refresh setup
      setAuth(data.user, data.accessToken, data.refreshToken, getValues('rememberMe'));
      
      toast.success(`Welcome back, ${data.user.fullName}!`, {
        description: 'You have been successfully logged in.',
      });

      // Redirect based on user role or original destination
      if (data.user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error('Login Failed', {
        description: errorMessage,
      });
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = (data: LoginFormData) => {
    console.log('Attempting login for:', data.email);
    loginMutation.mutate({ 
      email: data.email, 
      password: data.password 
    });
  };

  return (
    <>
      <Helmet>
        <title>Sign In — Village Angel</title>
        <meta name="description" content="Sign in to your Village Angel account to access your profile, orders, and saved items." />
        <link rel="canonical" href={`${SITE_URL}/login`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div>
            <Link to="/" className="flex justify-center items-center space-x-2">
              <Crown className="w-10 h-10 text-red-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                Village Angel
              </h1>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-red-800">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-red-600">
              Or{' '}
              <Link 
                to="/register" 
                className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email Field */}
              <FormField
                label="Email address"
                type="email"
                placeholder="Enter your email"
                required
                error={errors.email?.message}
                register={register('email')}
              />

              {/* Password Field */}
              <FormField label="Password" error={errors.password?.message} required>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`
                      w-full px-3 py-2 pr-10 border rounded-lg shadow-sm transition-colors 
                      focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none
                      ${errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </FormField>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register('rememberMe')}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-red-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="
                group relative w-full flex justify-center py-3 px-4 border border-transparent 
                text-sm font-medium rounded-lg text-white 
                bg-gradient-to-r from-red-600 to-red-700 
                hover:from-red-700 hover:to-red-800 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-200 shadow-md hover:shadow-lg
              "
            >
              {loginMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="text-center text-xs text-red-500">
            <p>
              By signing in, you agree to Village Angel's{' '}
              <Link to="/terms" className="text-yellow-600 hover:text-yellow-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-yellow-600 hover:text-yellow-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};