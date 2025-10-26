import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './Layout';
import LoginPage from './Pages/Login';
import RegisterPage from './Pages/Register';
import ForgotPasswordPage from './Pages/ForgotPassword';
import ResetPasswordPage from './Pages/ResetPassword';
import EventsPage from './Pages/Events';
import CalendarPage from './Pages/Calendar';
import SpeakersPage from './Pages/Speakers';
import VenuesPage from './Pages/Venues';
import OrdersPage from './Pages/Orders';
import UsersPage from './Pages/Users';
import CitiesPage from './Pages/Cities';
import EventDetailsPage from './Pages/EventDetails';
import ProfilePage from './Pages/Profile';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/events" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/events" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/events" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/"
        element={<Navigate to="/events" replace />}
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Thinkglaos"><EventsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Detalles del Evento"><EventDetailsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Calendario"><CalendarPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/speakers"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Ponentes"><SpeakersPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/venues"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Locales"><VenuesPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Pedidos"><OrdersPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Usuarios"><UsersPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cities"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Ciudades"><CitiesPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Mi Perfil"><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
