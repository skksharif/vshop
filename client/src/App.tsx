import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

import { NavBar } from "./components/layout/NavBar";
import { BottomNav } from "./components/layout/BottomNav";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Profile } from "./pages/Profile";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

// Admin Pages
import UserDashboard from "./pages/admin/manage-users/UserDashboard";
import CategoriesDashboard from "./pages/admin/manage-categories/CategoriesDashboard";
import ProductsDashboard from "./pages/admin/manage-products/ProductsDashboard";
import OrdersDashboard from "./pages/admin/manage-orders/OrdersDashboard";
import CreditDashboard from "./pages/admin/manage-credit/CreditDashboard";

// Initialize stores and auth
import { useAuthStore } from "./store/auth";

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { initializeAuth, isLoading } = useAuthStore();

  /**
   * Initialize authentication state on app startup
   * This ensures proper state restoration and prevents logout on page refresh
   */
  useEffect(() => {
    console.log('Village Angel: Initializing authentication...');
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Village Angel</h2>
          <p className="text-red-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
            <NavBar />
            <main className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />

                {/* Protected User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <CategoriesDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <ProductsDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <OrdersDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/credits"
                  element={
                    <ProtectedRoute requireRole="ADMIN">
                      <CreditDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route
                  path="*"
                  element={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-red-800 mb-4">Page Not Found</h2>
                      <p className="text-red-600">The page you're looking for doesn't exist.</p>
                    </div>
                  }
                />
              </Routes>
            </main>
            <BottomNav />
          </div>
          
          {/* Toast notifications with Village Angel theme */}
          <Toaster 
            position="top-center" 
            richColors 
            toastOptions={{
              style: {
                background: 'linear-gradient(135deg, #fef2f2 0%, #fefce8 100%)',
                border: '1px solid #fca5a5',
                color: '#991b1b',
              },
            }}
          />
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;