'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mobileNumber: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation functions
  const validateMobileNumber = (phone: string): string => {
    if (!phone) return 'Mobile number is required';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10) return 'Mobile number must be exactly 10 digits';
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return 'Mobile number must start with 6-9';
    }
    return '';
  };

  const validatePassword = (pwd: string): string => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    let error = '';
    if (name === 'mobileNumber') {
      error = validateMobileNumber(formData.mobileNumber);
    } else if (name === 'password') {
      error = validatePassword(formData.password);
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};

    newErrors.mobileNumber = validateMobileNumber(formData.mobileNumber);
    newErrors.password = validatePassword(formData.password);

    setErrors(newErrors);
    setTouched({ mobileNumber: true, password: true });

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        setSubmitError('');
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: formData.mobileNumber,
            password: formData.password,
          }),
        });
        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
        };

        if (!response.ok || !data.success) {
          setSubmitError(data.message || 'Invalid mobile number or password.');
          return;
        }

        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        console.error('Login request failed:', error);
        setSubmitError('Unable to connect to the server right now. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Login to track and manage your civic reports
            </p>
          </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {submitError}
                  </p>
                )}
                {/* Mobile Number Field */}
                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10-digit Indian mobile number"
                    maxLength={10}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      touched.mobileNumber && errors.mobileNumber
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {touched.mobileNumber && errors.mobileNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Must be a valid 10-digit Indian mobile number
                  </p>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="At least 6 characters"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10 ${
                        touched.password && errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m4.753-4.753L3.596 3.596"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200"></div>

              {/* Register Link */}
              <p className="text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition"
                >
                  Register here
                </a>
              </p>

              {/* Home Link */}
              <p className="text-center text-gray-500 text-xs mt-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Back to Home
                </a>
              </p>
        </div>
      </main>
    </>
  );
}
