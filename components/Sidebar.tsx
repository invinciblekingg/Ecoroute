'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Leaf, Home, Map, FileText, Users, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  userRole?: 'admin' | 'worker' | 'citizen';
}

export function Sidebar({ userRole = 'citizen' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/map', label: 'Live Map', icon: Map },
    { href: '/report', label: 'Report Waste', icon: FileText },
    { href: '/dashboard', label: 'My Dashboard', icon: Users },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: BarChart3 },
  ];

  const workerNavItems = [
    { href: '/worker', label: 'My Route', icon: Map },
  ];

  const roleSpecificItems =
    userRole === 'admin' ? adminNavItems : userRole === 'worker' ? workerNavItems : [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-accent rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf size={20} className="text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold">EcoRoute</span>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-2">
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-3">
              Menu
            </p>
            {mainNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Role-specific Navigation */}
          {roleSpecificItems.length > 0 && (
            <div className="border-t border-sidebar-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-3">
                {userRole === 'admin' ? 'Admin' : 'Worker'}
              </p>
              {roleSpecificItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Content offset */}
      <div className="lg:ml-64" />
    </>
  );
}
