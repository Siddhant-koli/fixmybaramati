'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { translateApiMessage, useTranslation } from '@/lib/i18n';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateFullName = (name: string): string => {
    if (!name.trim()) return t('auth.fullNameRequired');
    if (name.trim().length < 2) return t('auth.fullNameLength');
    return '';
  };

  const validateMobileNumber = (phone: string): string => {
    if (!phone) return t('auth.mobileRequired');
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10) return t('auth.mobileLength');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return t('auth.mobilePrefix');
    }
    return '';
  };

  const validatePassword = (pwd: string): string => {
    if (!pwd) return t('auth.passwordRequired');
    if (pwd.length < 6) return t('auth.passwordLength');
    return '';
  };

  const validateConfirmPassword = (pwd: string, confirmPwd: string): string => {
    if (!confirmPwd) return t('auth.confirmRequired');
    if (pwd !== confirmPwd) return t('auth.passwordMismatch');
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (submitMessage) {
      setSubmitMessage('');
      setIsSuccess(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let error = '';
    if (name === 'fullName') {
      error = validateFullName(formData.fullName);
    } else if (name === 'mobileNumber') {
      error = validateMobileNumber(formData.mobileNumber);
    } else if (name === 'password') {
      error = validatePassword(formData.password);
    } else if (name === 'confirmPassword') {
      error = validateConfirmPassword(formData.password, formData.confirmPassword);
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    newErrors.fullName = validateFullName(formData.fullName);
    newErrors.mobileNumber = validateMobileNumber(formData.mobileNumber);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    setErrors(newErrors);
    setTouched({
      fullName: true,
      mobileNumber: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage('');
      setIsSuccess(false);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors({
            ...newErrors,
            ...Object.fromEntries(
              Object.entries(data.errors).map(([key, message]) => [
                key,
                translateApiMessage(message, t, 'auth.registrationFailed'),
              ])
            ),
          });
        }
        setSubmitMessage(
          translateApiMessage(data.message, t, 'auth.registrationValidationError')
        );
        setIsSuccess(false);
        return;
      }

      setSubmitMessage(
        translateApiMessage(data.message, t, 'auth.registrationSuccess')
      );
      setIsSuccess(true);
      setFormData({
        fullName: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
      });
      setTouched({});
      setErrors({});
    } catch (error) {
      console.error('Registration request failed:', error);
      setSubmitMessage(
        t('auth.loginConnectionError')
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.createAccount')}
            </h1>
            <p className="text-gray-600">
              {t('auth.registerDescription')}
            </p>
          </div>

          {submitMessage && (
            <div
              className={`mb-6 rounded-lg border p-3 text-sm ${
                isSuccess
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {submitMessage}
              {isSuccess && (
                <>
                  {' '}
                  <a href="/login" className="font-semibold underline">
                    {t('auth.loginHere')}
                  </a>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.fullNamePlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.fullName && errors.fullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {touched.fullName && errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.mobile')}
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.mobilePlaceholder')}
                maxLength={10}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.mobileNumber && errors.mobileNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {touched.mobileNumber && errors.mobileNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {t('auth.mobileHint')}
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.passwordPlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.password && errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccountButton')}
            </button>
          </form>

          <div className="my-6 border-t border-gray-200"></div>

          <p className="text-center text-gray-600 text-sm">
            {t('auth.hasAccount')}{' '}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              {t('auth.loginHere')}
            </a>
          </p>

          <p className="text-center text-gray-500 text-xs mt-4">
            <a href="/" className="text-gray-600 hover:text-blue-600 transition">
              {t('auth.backHome')}
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
