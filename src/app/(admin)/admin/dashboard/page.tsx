"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OrderCard } from "@/components/admin/OrderCard";
import { OrderDetailSheet } from "@/components/admin/OrderDetailSheet";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/axios";
import { Toaster, toast } from "react-hot-toast";

type FilterStatus = "all" | "PENDING" | "PAID" | "COMPLETED";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [restaurantId, setRestaurantId] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const unlockAudio = async () => {
  if (!audioRef.current) return;

  try {
    await audioRef.current.play();
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAudioUnlocked(true);
    toast.success("Notifikasi suara aktif");
  } catch (err) {
    console.log("Unlock audio gagal", err);
  }
};


  // 1. Initial Load
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    const id = localStorage.getItem("restaurantId");
    if (id) {
      setRestaurantId(parseInt(id));
      fetchOrders();
    }
  }, []);

   const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log("Audio play failed (browser policy):", error);
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Realtime
  const { socket } = useSocket(restaurantId);
  useEffect(() => {
    if (!socket) return;
    socket.on("new_order", (newOrder: Order) => {
      toast.success(`Pesanan Baru Meja ${newOrder.tableNumber}`);
      setOrders((prev) => [newOrder, ...prev]);

       playNotificationSound();
    });
    return () => {
      socket.off("new_order");
    };
  }, [socket]);

  // 3. Filtering
  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders.filter((o) => o.status !== "CANCELLED");
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const filters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "PENDING", label: "Menunggu" },
    { value: "PAID", label: "Dibayar" },
    { value: "COMPLETED", label: "Selesai" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">
              Kelola pesanan masuk secara real-time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={unlockAudio}
            className="relative h-10 w-10 p-0 rounded-full border-gray-300"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Total Pesanan</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">
              {orders.length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
            <p className="text-yellow-700 text-sm font-medium">
              Menunggu Bayar
            </p>
            <p className="text-3xl font-bold mt-1 text-yellow-800">
              {pendingCount}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 shadow-sm">
            <p className="text-green-700 text-sm font-medium">Sudah Dibayar</p>
            <p className="text-3xl font-bold mt-1 text-green-800">
              {orders.filter((o) => o.status === "PAID").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Selesai</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">
              {orders.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                filter === f.value
                  ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => handleOrderClick(order)}
              isNew={order.status === "PENDING"}
            />
          ))}
          {filteredOrders.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <span className="text-5xl mb-4 block grayscale opacity-30">
                📋
              </span>
              <p>Belum ada pesanan di kategori ini</p>
            </div>
          )}
        </div>
      </main>

      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={fetchOrders}
      />
    </div>
  );
}
