"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Product, Addon } from "@/types";

// Komponen UI
import { MenuHeader } from "@/components/customer/MenuHeader";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { FloatingCart } from "@/components/customer/FloatingCart";
import { CartSheet } from "@/components/customer/CartSheet";
import { OrderConfirmation } from "@/components/customer/OrderConfirmation";
import { ProductModal } from "@/components/customer/ProductModal";
import { Skeleton } from "@/components/ui/skeleton";

// Hooks & Utils
import { Toaster, toast } from "react-hot-toast";
import { useSocket } from "@/hooks/useSocket";
import { useCart } from "@/store/useCart";

export default function CustomerMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const nomorMeja = params.nomor as string;

  // --- STATE ---
  const [restaurant, setRestaurant] = useState<{
    id: number;
    name: string;
    logo?: string;
  } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cartOpen, setCartOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Add-on State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart } = useCart();

  /* ================= 1. INITIAL LOAD & RESTORE ================= */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // A. Ambil Data Menu
        const res = await api.get(`/orders/menu/${slug}`);
        const data = res.data.data;

        setRestaurant({
          id: data.restaurantId,
          name: data.restaurantName,
          logo: data.restaurantLogo,
        });
        setProducts(data.products);

        // B. Cek LocalStorage untuk Restore Order
        const pendingOrderId = localStorage.getItem(
          `pendingOrder_${data.restaurantId}`
        );

        if (pendingOrderId) {
          try {
            const resOrder = await api.get(`/orders/${pendingOrderId}`);
            const order = resOrder.data.data;

            // Jika belum selesai/batal, restore state
            if (!["COMPLETED", "CANCELLED"].includes(order.status)) {
              setPlacedOrder(order);
            } else {
              localStorage.removeItem(`pendingOrder_${data.restaurantId}`);
            }
          } catch (err) {
            // Jika error (misal 404), bersihkan storage
            localStorage.removeItem(`pendingOrder_${data.restaurantId}`);
          }
        }
      } catch (e) {
        console.error("Gagal inisialisasi:", e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) init();
  }, [slug]);

  /* ================= 2. REALTIME & POLLING ================= */
  const { socket } = useSocket(restaurant?.id || 0);

  useEffect(() => {
    if (!placedOrder) return;

    // Handler Socket
    const onUpdate = (updated: any) => {
      if (String(updated.id) === String(placedOrder.id)) {
        setPlacedOrder((prev: any) => ({
          ...prev,
          status: updated.status,
        }));

        if (updated.status === "PAID") toast.success("Pembayaran diterima!");
        if (updated.status === "COMPLETED") toast.success("Pesanan selesai!");
      }
    };

    // Pasang Listener
    socket?.on("order_status_updated", onUpdate);

    // Backup Polling (Setiap 5 detik cek status)
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${placedOrder.id}`);
        const freshOrder = res.data.data;
        if (freshOrder.status !== placedOrder.status) {
          setPlacedOrder(freshOrder);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);

    // Cleanup
    return () => {
      socket?.off("order_status_updated", onUpdate);
      clearInterval(poll);
    };
  }, [socket, placedOrder]);

  /* ================= 3. FILTER & LOGIC ================= */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua", ...cats];
  }, [products]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "Semua") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // Handler Klik Produk (Cek Addon)
  const handleProductClick = (product: Product) => {
    // Cek apakah produk punya addons (pastikan backend kirim array json)
    const hasAddons = Array.isArray(product.addons) && product.addons.length > 0;

    if (hasAddons) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    } else {
      addToCart(product, []);
      toast.success("Masuk keranjang");
    }
  };

  /* ================= 4. RENDER: LOADING ================= */
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
        <div className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40" />
        <div className="px-4 py-4 space-y-4 max-w-7xl mx-auto w-full">
          <Skeleton className="h-10 w-full rounded-full bg-gray-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Restoran Tidak Ditemukan</h1>
          <p className="text-gray-500 mt-2">Cek kembali URL atau QR Code Anda.</p>
        </div>
      </div>
    );
  }

  /* ================= 5. RENDER: ORDER CONFIRMATION ================= */
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

  /* ================= 6. RENDER: MAIN MENU ================= */
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24 font-sans">
      <Toaster position="top-center" />

      {/* HEADER */}
      <MenuHeader
        restaurantName={restaurant.name}
        tableNumber={nomorMeja}
        logoUrl={restaurant.logo}
      />

      {/* CATEGORY TABS */}
      <div className="sticky top-[65px] z-30 bg-gray-50 w-full shadow-sm">
        <div className="max-w-7xl mx-auto">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>

      {/* MENU GRID */}
      <main className="flex-1 px-4 py-4 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredItems.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              // Kita pass handler manual untuk cek addon
              // Pastikan MenuItemCard Anda menerima prop 'onSelect' 
              // atau ubah logika di dalam MenuItemCard untuk memanggil parent
              // Jika MenuItemCard belum diupdate, ganti prop ini sesuai kebutuhan komponen Anda
              onSelect={() => handleProductClick(item)} 
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-4 grayscale opacity-50">🍽️</span>
            <p className="text-lg font-medium">Tidak ada menu di kategori ini</p>
          </div>
        )}
      </main>

      {/* FLOATING CART */}
      <FloatingCart onClick={() => setCartOpen(true)} />

      {/* CART DRAWER */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        restaurantId={restaurant.id}
        tableNumber={nomorMeja}
        onOrderPlaced={(order) => {
          setPlacedOrder(order);
          localStorage.setItem(`pendingOrder_${restaurant.id}`, order.id);
        }}
      />

      {/* ADDON MODAL */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(product, addons) => {
          addToCart(product, addons);
          toast.success("Berhasil ditambahkan");
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}