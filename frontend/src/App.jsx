import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

// Public Pages
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Authenticated App Pages
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Tickets from "./pages/Tickets";
import Customers from "./pages/Customers";
import KnowledgeBase from "./pages/KnowledgeBase";
import Analytics from "./pages/Analytics";
import WebChat from "./pages/WebChat";
import WebPortal from "./pages/WebPortal";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/architecture" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* AUTHENTICATED WORKSPACE APPLICATION SHELL (/app/*) */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/conversations"
          element={
            <ProtectedRoute>
              <AppShell>
                <Conversations />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/tickets"
          element={
            <ProtectedRoute>
              <AppShell>
                <Tickets />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/customers"
          element={
            <ProtectedRoute>
              <AppShell>
                <Customers />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/knowledge"
          element={
            <ProtectedRoute>
              <AppShell>
                <KnowledgeBase />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/analytics"
          element={
            <ProtectedRoute>
              <AppShell>
                <Analytics />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <Settings />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* CHANNELS (Accessible within workspace context) */}
        <Route
          path="/app/chat"
          element={
            <ProtectedRoute>
              <WebChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/support"
          element={
            <ProtectedRoute>
              <WebPortal />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
