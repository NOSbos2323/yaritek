import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useRoutes,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Simple lazy loading without complex utilities
const Home = lazy(() => import("./components/home"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const PaymentsPage = lazy(() => import("./components/payments/PaymentsPage"));
const LandingPage = lazy(() => import("./components/LandingPage"));

// Simple loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500 animate-pulse" />
      <p className="text-white text-sm">جاري التحميل...</p>
    </div>
  </div>
);

// PWA Detection Component
const PWARouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPWA, setIsPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPWAStatus = () => {
      // Check if running as PWA (standalone mode)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isPWAMode = isStandalone || isIOSStandalone;

      setIsPWA(isPWAMode);
      setIsLoading(false);

      // If it's PWA and user is on root path, redirect to home
      if (isPWAMode && location.pathname === "/") {
        // Check if user is logged in
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userData = JSON.parse(user);
            if (userData.loggedIn) {
              navigate("/home", { replace: true });
              return;
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user");
          }
        }
        // If not logged in, go to login page
        navigate("/login", { replace: true });
      }
    };

    checkPWAStatus();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/payments" element={<PaymentsPage />} />

      {/* Tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && (
        <Route path="/tempobook/*" element={<div />} />
      )}

      {/* Conditional routing based on PWA status */}
      <Route path="/" element={isPWA ? <LoginPage /> : <LandingPage />} />
      <Route path="*" element={isPWA ? <LoginPage /> : <LandingPage />} />
    </Routes>
  );
};

function App() {
  // Try to render tempo routes if available
  let tempoRoutesElement = null;
  if (import.meta.env.VITE_TEMPO === "true") {
    try {
      const routes = require("tempo-routes").default || [];
      if (Array.isArray(routes) && routes.length > 0) {
        tempoRoutesElement = useRoutes(routes);
      }
    } catch (error) {
      // Silently handle tempo routes not being available
    }
  }

  // If tempo routes match, render them
  if (tempoRoutesElement) {
    return (
      <div className="min-h-screen bg-slate-900">{tempoRoutesElement}</div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Suspense fallback={<PageLoader />}>
        <PWARouter />
      </Suspense>
    </div>
  );
}

export default App;
