import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Demo user data - replace with actual authentication logic
const DEMO_USER: User = {
  id: '1',
  email: 'demo@catcher.app',
  name: 'Demo User',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // For demo purposes, randomly decide if user is signed in
      // In a real app, you'd check stored tokens, etc.
      const isSignedIn = Math.random() > 0.7; // 30% chance user is signed in
      setUser(isSignedIn ? DEMO_USER : null);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser(DEMO_USER);
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser({ ...DEMO_USER, email, name });
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    isSignedIn: !!user,
    signIn,
    signUp,
    signOut,
  };
};
