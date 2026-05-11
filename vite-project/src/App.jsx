import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'
import SplashScreen from './components/ui/SplashScreen'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import OnboardingPage from './pages/auth/OnboardingPage'

import LandingPage from './pages/public/LandingPage'

// App Pages
import OverviewPage from './pages/app/OverviewPage'
import WorkoutPage from './pages/app/WorkoutPage'
import ProgressPage from './pages/app/ProgressPage'
import ActivityPage from './pages/app/ActivityPage'
import WeightPage from './pages/app/WeightPage'
import SkillsPage from './pages/app/SkillsPage'
import DailyReportPage from './pages/app/DailyReportPage'
import AIAnalyzerPage from './pages/app/AIAnalyzerPage'
import PRPage from './pages/app/PRPage'
import ProfilePage from './pages/app/ProfilePage'
import SettingPage from './pages/app/SettingPage'
import CreditsPage from './pages/app/CreditsPage'
import ResourcesPage from './pages/app/ResourcesPage'

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown')
  })

  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          setShowSplash(false)
          sessionStorage.setItem('splashShown', 'true')
        }} 
      />
    )
  }

  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/login"       element={<LoginPage />} />
      <Route path="/signup"      element={<SignupPage />} />
      <Route path="/onboarding"  element={<OnboardingPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"    element={<OverviewPage />} />
          <Route path="/workout"      element={<WorkoutPage />} />
          <Route path="/progress"     element={<ProgressPage />} />
          <Route path="/activity"     element={<ActivityPage />} />
          <Route path="/weight"       element={<WeightPage />} />
          <Route path="/skills"       element={<SkillsPage />} />
          <Route path="/daily-report" element={<DailyReportPage />} />
          <Route path="/analyzer"     element={<AIAnalyzerPage />} />
          <Route path="/records"      element={<PRPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/settings"     element={<SettingPage />} />
          <Route path="/credits"      element={<CreditsPage />} />
          <Route path="/resources"    element={<ResourcesPage />} />
        </Route>
      </Route>

      {/* Public Home Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
