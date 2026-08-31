'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/cognito';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
  ];

  if (isCollapsed) {
    return (
      <nav className="bg-gray-900 text-white w-14 min-h-screen p-3 flex flex-col items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          aria-label="Show menu"
          title="Show menu"
          className="mb-6 w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          »
        </button>
        <ul className="flex-1 space-y-2 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={`flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          onClick={handleLogout}
          title="Logout"
          className="mt-auto w-9 h-9 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          ⏻
        </button>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen p-6 flex flex-col">
      <div className="mb-8 flex items-start justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold mb-2">Personal Scheduler</h1>
          {user && (
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          aria-label="Hide menu"
          title="Hide menu"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          «
        </button>
      </div>

      <ul className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleLogout}
        className="mt-auto px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
      >
        Logout
      </button>
    </nav>
  );
}
