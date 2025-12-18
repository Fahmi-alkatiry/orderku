"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Product } from "@/types";

import { MenuHeader } from "@/components/customer/MenuHeader";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { FloatingCart } from "@/components/customer/FloatingCart";
import { CartSheet } from "@/components/customer/CartSheet";
import { OrderConfirmation } from "@/components/customer/OrderConfirmation";

import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";

export default function CustomerMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const nomorMeja = params.nomor as string;

  const [restaurant, setRestaurant] = useState<{
    id: number;
    name: string;
    logo?: string;
  } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cartOpen, setCartOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/orders/menu/${slug}`);
        const data = res.data.data;

        setRestaurant({
          id: data.restaurantId,
          name: data.restaurantName,
          logo: data.restaurantLogo,
        });
        setProducts(data.products);

        const pendingOrderId = localStorage.getItem(
          `pendingOrder_${data.restaurantId}`
        );

        if (pendingOrderId) {
          const resOrder = await api.get(`/orders/${pendingOrderId}`);
          const order = resOrder.data.data;

          if (!["COMPLETED", "CANCELLED"].includes(order.status)) {
            setPlacedOrder(order);
          } else {
            localStorage.removeItem(`pendingOrder_${data.restaurantId}`);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) init();
  }, [slug]);

  /* ================= REALTIME ================= */
  const { socket } = useSocket(restaurant?.id || 0);

  useEffect(() => {
    if (!placedOrder) return;

    const onUpdate = (updated: any) => {
      if (String(updated.id) === String(placedOrder.id)) {
        setPlacedOrder((prev: any) => ({
          ...prev,
          status: updated.status,
        }));

        if (updated.status === "PAID") toast.success("Pembayaran diterima");
        if (updated.status === "COMPLETED") toast.success("Pesanan selesai");
      }
    };

    socket?.on("order_status_updated", onUpdate);

    const poll = setInterval(async () => {
      const res = await api.get(`/orders/${placedOrder.id}`);
      setPlacedOrder(res.data.data);
    }, 5000);

    return () => {
      socket?.off("order_status_updated", onUpdate);
      clearInterval(poll);
    };
  }, [socket, placedOrder]);

  /* ================= CATEGORY ================= */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua", ...cats];
  }, [products]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "Semua") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 rounded-full" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return <div>Restoran tidak ditemukan</div>;

  /* ================= ORDER CONFIRM ================= */
  if (placedOrder) {
    return (
      <OrderConfirmation
        order={placedOrder}
        onNewOrder={() => {
          setPlacedOrder(null);
          localStorage.removeItem(`pendingOrder_${restaurant.id}`);
        }}
      />
    );
  }

  /* ================= MAIN ================= */
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Toaster position="top-center" />

      {/* HEADER */}
      <MenuHeader
        restaurantName={restaurant.name}
        tableNumber={nomorMeja}
        logoUrl={restaurant.logo}
      />

      {/* CATEGORY */}
      <div className="sticky top-16 z-30 bg-gray-50 border-b">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* MENU GRID */}
      <main className="p-4 max-w-7xl mx-auto">
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            Tidak ada menu di kategori ini
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      {/* CART */}
      <FloatingCart onClick={() => setCartOpen(true)} />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        restaurantId={restaurant.id}
        tableNumber={nomorMeja}
        onOrderPlaced={(order) => {
          setPlacedOrder(order);
          localStorage.setItem(
            `pendingOrder_${restaurant.id}`,
            order.id
          );
        }}
      />
    </div>
  );
}
