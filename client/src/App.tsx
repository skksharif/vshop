import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

import { NavBar } from "./components/layout/NavBar";
import { BottomNav } from "./components/layout/BottomNav";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Profile } from "./pages/Profile";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

// Initialize stores
import { useAuthStore } from "./store/auth";
import Dashboard from "./pages/admin/manage-users/UserDashboard";
import UserDashboard from "./pages/admin/manage-users/UserDashboard";
import CategoriesDashboard from "./pages/admin/manage-categories/CategoriesDashboard";
import ProductsDashboard from "./pages/admin/manage-products/ProductsDashboard";
import OrdersDashboard from "./pages/admin/manage-orders/OrdersDashboard";
import CreditDashboard from "./pages/admin/manage-credit/CreditDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
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

                {/* Fallback */}
                <Route
                  path="*"
                  element={
                    <div className="text-center py-12">Page not found</div>
                  }
                />
              </Routes>
            </main>
            <BottomNav />
          </div>
          <Toaster position="top-center" richColors />
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}


export default App;
