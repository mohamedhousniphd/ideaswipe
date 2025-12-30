import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';
import { InstallPrompt } from './components/InstallPrompt';
import { storageService } from './services/storageService';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = storageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'admin' && currentUser?.role !== UserRole.ADMIN) {
      alert("Unauthorized");
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('feed');
  };

  if (isLoading) return null;

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header 
        user={currentUser} 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
      />
      
      <main className="pt-16">
        {currentPage === 'feed' && <Feed user={currentUser} onNavigate={handleNavigate} />}
        {currentPage === 'profile' && <Profile user={currentUser} />}
        {currentPage === 'admin' && <Admin />}
      </main>

      <InstallPrompt />
    </div>
  );
};

export default App;
