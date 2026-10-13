'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { LanguageSwitcher, useTranslation } from '@/lib/i18n';

export default function AdminShell({
  children,
  fullName,
  mobile,
}: {
  children: ReactNode;
  fullName: string;
  mobile: string;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const links = [
    { href: '/admin', label: t('admin.portal'), exact: true },
    { href: '/admin/reports', label: t('admin.reports'), exact: false },
  ];

  const navigation = (
    <nav aria-label={t('admin.menu')} className="space-y-1">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={`block rounded-md px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-100'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const handleLogout = async () => {
    setLogoutError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      router.push('/login');
      router.refresh();
    } catch {
      setLogoutError(t('nav.logoutError'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
              aria-label={t('admin.menu')}
              className="inline-flex min-h-10 items-center rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
            <Link href="/admin" className="truncate text-lg font-bold text-blue-800">
              FixMyBaramati
            </Link>
            <span className="hidden border-l border-gray-300 pl-3 text-sm text-gray-500 sm:inline">
              {t('admin.portal')}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-gray-600 hover:text-blue-700 sm:inline"
            >
              {t('admin.returnToSite')}
            </Link>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="min-h-10 rounded-md bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div id="admin-mobile-navigation" className="border-t border-gray-200 px-4 py-3 md:hidden">
            <div className="mb-3 border-b border-gray-200 pb-3">
              <p className="text-sm font-semibold text-gray-900">{fullName}</p>
              <p className="mt-1 text-xs text-gray-500">{mobile}</p>
            </div>
            {navigation}
            <div className="mt-3 sm:hidden">
              <LanguageSwitcher />
            </div>
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="mt-3 block text-sm font-medium text-gray-600"
            >
              {t('admin.returnToSite')}
            </Link>
          </div>
        )}
      </header>

      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1440px] md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-gray-200 bg-white px-4 py-6 md:flex md:flex-col">
          {navigation}
          <div className="mt-auto border-t border-gray-200 pt-5">
            <p className="truncate text-sm font-semibold text-gray-900">{fullName}</p>
            <p className="mt-1 text-xs text-gray-500">{mobile}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-blue-800">
              {t('admin.portal')}
            </p>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      {logoutError && (
        <p role="alert" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-md border border-red-200 bg-white p-3 text-sm text-red-700 shadow-lg">
          {logoutError}
        </p>
      )}
    </div>
  );
}