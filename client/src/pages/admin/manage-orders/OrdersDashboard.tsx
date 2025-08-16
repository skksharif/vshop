import React, { useEffect, useState } from "react";
import { getPendingOrders, approveOrder, markOrderShipped } from "../../../services/admin";
import type { Order } from "../../../types";
import { Loader2, CheckCircle, Truck } from "lucide-react";
import { toast } from "sonner";

function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}

// ✅ Manual Card Component
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-white shadow p-4">{children}</div>;
}

// ✅ Manual Card Content wrapper
function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data:any = await getPendingOrders();
      console.log(data.pendingOrders)
      setOrders(data.pendingOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    setActionLoading(orderId + "-approve");
    try {
      await approveOrder(orderId);
      toast.success("Order approved successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleShip = async (orderId: string) => {
    setActionLoading(orderId + "-ship");
    try {
      await markOrderShipped(orderId);
      toast.success("Order marked as shipped");
      fetchOrders();
    } catch (error) {
      console.error("Error marking order as shipped:", error);
      toast.error("Failed to mark order shipped");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : orders?.length === 0 ? (
        <p className="text-gray-500">No pending orders found</p>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <p className="font-semibold">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-600">
                    Customer: {order.customerName} | Total: ${order.totalAmount}
                  </p>
                  <p className="text-sm text-gray-500">Status: {order.status}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(order.id)}
                    disabled={actionLoading === order.id + "-approve"}
                  >
                    {actionLoading === order.id + "-approve" ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShip(order.id)}
                    disabled={actionLoading === order.id + "-ship"}
                  >
                    {actionLoading === order.id + "-ship" ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Truck className="h-4 w-4 mr-2" />
                    )}
                    Ship
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
