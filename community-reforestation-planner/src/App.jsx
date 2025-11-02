import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <LandingPage onAuth={() => setIsAuthenticated(true)} />
                  )
                } 
              />
              <Route 
                path="/login" 
                element={
                  <LoginPage 
                    onLogin={() => setIsAuthenticated(true)} 
                    onSwitchToSignup={() => window.location.href = '/signup'}
                  />
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <SignupPage 
                    onSignup={() => setIsAuthenticated(true)} 
                    onSwitchToLogin={() => window.location.href = '/login'}
                  />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <Dashboard />
                } 
              />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;