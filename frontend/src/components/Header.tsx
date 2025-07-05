import React, { useState } from 'react';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onViewChange('login');
  };

  const navItems = user?.role === 'DOCTOR' 
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'cases', label: 'Case Posts' },
        { id: 'donations', label: 'Donations' },
        { id: 'ai-diagnosis', label: 'AI Diagnosis' },
        { id: 'requests', label: 'Requests' }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'upload', label: 'Upload Files' },
        { id: 'donations', label: 'Donations' },
        { id: 'ai-diagnosis', label: 'AI Diagnosis' }
        
      ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <a href="#" className="logo" onClick={() => onViewChange('dashboard')}>
            <Heart size={24} />
            DocNet
          </a>

          {user && (
            <>
              <nav className={`nav ${mobileMenuOpen ? 'nav-mobile-open' : ''}`}>
                {navItems.map(item => (
                  <a
                    key={item.id}
                    href="#"
                    className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              
                <div className="user-info">
                  <User size={20} />
                  <span>   {user.name}</span>
                  {user.role === 'DOCTOR' && user.isVerified && (
                    <span className="verified-badge">✓</span>
                  )}
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              

              
            </>
          )}
        </div>
      </div>
    </header>
  );
}