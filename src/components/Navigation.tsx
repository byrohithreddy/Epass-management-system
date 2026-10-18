import React from 'react';
import { UserRound, ClipboardCheck, ScanLine } from 'lucide-react';

interface NavigationProps {
  currentPage: 'student' | 'admin' | 'guard';
  onPageChange: (page: 'student' | 'admin' | 'guard') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'student' as const, label: 'Student', icon: UserRound },
    { id: 'admin' as const, label: 'Admin', icon: ClipboardCheck },
    { id: 'guard' as const, label: 'Guard', icon: ScanLine },
  ];

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="E-Gatepass workspaces">
        <a className="brand-lockup" href="#main-content" aria-label="E-Gatepass home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M8 27V9h20v18M8 18h20M14 9v9m8 0v9" />
              <circle cx="8" cy="27" r="2" />
              <circle cx="28" cy="9" r="2" />
            </svg>
          </span>
          <span className="brand-type">
            <strong>E-Gatepass</strong>
            <small>Campus departures</small>
          </span>
        </a>

        <div className="role-switcher" role="group" aria-label="Choose workspace">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPageChange(id)}
              aria-current={currentPage === id ? 'page' : undefined}
              className={`role-link${currentPage === id ? ' is-active' : ''}`}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.7} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}