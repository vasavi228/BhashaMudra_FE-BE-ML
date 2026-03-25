import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import LessonInterface from './pages/LessonInterface';
import SelectionPage from './pages/SelectionPage';
import SignLanguageTranslator from './pages/SignLanguageTranslator';
import AlphabetOverview from './pages/AlphabetOverview';
import NumberOverview from './pages/NumberOverview';
// import AlphabetOverview1 from './pages/AlphabetOverview1';
// import NumberOverview1 from './pages/NumberOverview1';
import NumberInterface from './pages/NumberInterface';
import WelcomePage from './pages/WelcomePage';
import OnboardingPage from './pages/OnboardingPage';
import LoadingPage from './pages/LoadingPage';
import PremiumCheckout from './pages/PremiumCheckout';
import PremiumDashboard from './pages/PremiumDashboard';
import WordsOverview from './pages/WordsOverview';
import WordInterface from './pages/WordInterface';
import Quiz from './pages/Quiz';

function LearnLayout() {
  return <Outlet />; // Allows nested routes to render correctly
}

function App() {
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("your_api_endpoint");
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Error:", data.message || "Something went wrong");
        return;
      }
  
      // Handle success case
    };
  
    fetchData();
  }, []);

  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* New user onboarding flow */}
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/selection" element={<SelectionPage />} />

      {/* Main application routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sign-language-translator" element={<SignLanguageTranslator />} />
      
      {/* Premium routes */}
      <Route path="/premium/checkout" element={<PremiumCheckout />} />
      <Route path="/premium/dashboard" element={<PremiumDashboard />} />
      <Route path="/premium/quiz" element={<Quiz />} />
      
      {/* Learning paths (Fix for Nested Routes) */}
      <Route path="/learn" element={<LearnLayout />}>
        <Route index element={<Navigate to="/learn/alphabets" replace />} />
        <Route path="alphabets" element={<AlphabetOverview />} />
        <Route path="letter/:letter" element={<LessonInterface />} />
        <Route path="numbers" element={<NumberOverview />} />
        <Route path="number/:number" element={<NumberInterface />} />
        <Route path="words" element={<WordsOverview />} />
        <Route path="word/:word" element={<WordInterface />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;