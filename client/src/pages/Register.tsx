import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { register as registerUser } from '../services/auth';
import { FormField } from '../components/ui/FormField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vshops.example';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number in E.164 format'),
  kycCard: z.string().min(1, 'KYC card information is required'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in to continue.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Create Account — vshops</title>
        <meta name="description" content="Create your vshops account to start shopping and enjoying exclusive member benefits." />
        <link rel="canonical" href={`${SITE_URL}/register`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link to="/" className="flex justify-center">
              <h1 className="text-3xl font-bold text-blue-600">vshops</h1>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                sign in to existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                label="Full Name"
                placeholder="Enter your full name"
                required
                error={errors.fullName?.message}
                register={register('fullName')}
              />

              <FormField
                label="Username"
                placeholder="Choose a username"
                required
                error={errors.userName?.message}
                register={register('userName')}
              />

              <FormField
                label="Email address"
                type="email"
                placeholder="Enter your email"
                required
                error={errors.email?.message}
                register={register('email')}
              />

              <FormField
                label="Phone Number"
                placeholder="+1234567890"
                required
                error={errors.phoneNumber?.message}
                register={register('phoneNumber')}
              />

              <FormField
                label="Password"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
                    className={`
                      w-full px-3 py-2 pr-10 border rounded-lg shadow-sm transition-colors
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
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

              <FormField
                label="KYC Card"
                placeholder="Enter your ID card number"
                required
                error={errors.kycCard?.message}
                register={register('kycCard')}
              />

              <FormField
                label="Account Type"
                error={errors.role?.message}
              >
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="USER">Personal Account</option>
                  <option value="ADMIN">Business Account</option>
                </select>
              </FormField>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {registerMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};