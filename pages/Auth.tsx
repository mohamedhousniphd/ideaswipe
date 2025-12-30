import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        const user = storageService.login(formData.email, formData.password);
        if (user) {
          onLogin(user);
        } else {
          setError("Invalid email or password.");
        }
      } else {
        if (formData.name.length < 2) {
            setError("Name is too short.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        const user = storageService.signup(formData.name, formData.email, formData.password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 z-10">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl text-primary-foreground font-bold text-2xl mb-4">I</div>
                <h1 className="text-3xl font-bold font-sans tracking-tight">IdeaSwipe</h1>
                <p className="text-muted-foreground mt-2">
                    {isLogin ? 'Welcome back! Sign in to continue.' : 'Join the community of innovators.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                )}
                
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full p-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-3 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition shadow-lg"
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="font-bold text-primary hover:underline"
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </div>
        </div>
    </div>
  );
};
