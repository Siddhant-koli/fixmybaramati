'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              Report Issue
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              My Reports
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              Login
            </a>
            <a
              href="#"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 transition"
              aria-label="Toggle menu"
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
          <div className="md:hidden mt-4 border-t border-gray-200 pt-4 space-y-3">
            <a
              href="/"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              Report Issue
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              My Reports
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              Login
            </a>
            <a
              href="#"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
