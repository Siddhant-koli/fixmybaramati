'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher, translateApiMessage, useTranslation } from '@/lib/i18n';

export default function Navbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let isActive = true;

    fetch('/api/auth/session')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to verify session');
        const data = (await response.json()) as { authenticated?: boolean };
        if (isActive) setIsAuthenticated(data.authenticated === true);
      })
      .catch(() => {
        if (isActive) setIsAuthenticated(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    setLogoutError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error(t('nav.logoutError'));
      }
      setIsAuthenticated(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(
        translateApiMessage(error instanceof Error ? error.message : undefined, t, 'nav.logoutError')
      );
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">
              FixMyBaramati
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">{t('nav.home')}</a>
            <a href="/report" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.reportIssue')}
            </a>
            <a href="/my-reports" className="text-gray-700 hover:text-blue-600 transition">
              {t('nav.myReports')}
            </a>
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  {t('nav.dashboard')}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-700 hover:text-blue-600 transition">
                  {t('nav.login')}
                </a>
                <a
                  href="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {t('nav.register')}
                </a>
              </>
            )}
          </div>
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 transition"
              aria-label={t('nav.menu')}
              aria-expanded={isOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 border-t border-gray-200 pt-4 space-y-3">
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              {t('nav.home')}
            </a>
            <a
              href="/report"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              {t('nav.reportIssue')}
            </a>
            <a
              href="/my-reports"
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              {t('nav.myReports')}
            </a>
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-blue-600 transition"
                >
                  {t('nav.dashboard')}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    void handleLogout();
                  }}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-700 hover:text-blue-600 transition"
                >
                  {t('nav.login')}
                </a>
                <a
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  {t('nav.register')}
                </a>
              </>
            )}
          </div>
        )}
        <div className={`lg:hidden ${isOpen ? 'mt-3' : 'mt-0'}`}>
          <LanguageSwitcher />
        </div>
        {logoutError && (
          <p role="alert" className="px-4 pb-3 text-sm text-red-700">
            {logoutError}
          </p>
        )}
      </div>
    </nav>
  );
}
