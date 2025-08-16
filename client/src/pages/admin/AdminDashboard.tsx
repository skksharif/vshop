import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
} from "lucide-react";


export const AdminDashboard: React.FC = () => {
  const quickActions = [
    {
      title: "Manage Users",
      description: "Verify user accounts and manage KYC",
      link: "/admin/users",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Categories",
      description: "Add and manage product categories",
      link: "/admin/categories",
      icon: Package,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      title: "Products",
      description: "Add new products and manage inventory",
      link: "/admin/products",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      title: "Orders",
      description: "Process pending orders and shipments",
      link: "/admin/orders",
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      title: "Credit Management",
      description: "Set and update user credit limits",
      link: "/admin/credits",
      icon: CreditCard,
      color: "bg-pink-50 text-pink-600 border-pink-200",
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your e-commerce platform from one central location
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
              >
                <div
                  className={`inline-flex p-3 rounded-lg border ${action.color} mb-4`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
