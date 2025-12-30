import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface HeaderProps {
  user: User | null;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, currentPage }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    storageService.logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 px-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('feed')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
          I
        </div>
        <h1 className="font-sans font-bold text-xl tracking-tight hidden sm:block">IdeaSwipe</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={() => onNavigate('admin')}
            className={`p-2 rounded-full hover:bg-muted transition ${currentPage === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}
            title="Admin Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </button>
        )}

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted transition text-foreground"
          aria-label="Toggle Theme"
        >
          {isDark ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>

        <button 
          onClick={() => onNavigate('profile')}
          className={`relative p-2 rounded-full hover:bg-muted transition ${currentPage === 'profile' ? 'bg-muted text-primary' : 'text-foreground'}`}
          title="Profile"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <button
          onClick={handleLogout}
          className="text-sm font-bold text-destructive hover:text-destructive/80 transition"
        >
          Exit
        </button>
      </div>
    </header>
  );
};
