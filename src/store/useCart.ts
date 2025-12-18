import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => set((state) => {
        // Cek apakah produk sudah ada di keranjang
        const existing = state.items.find((i) => i.product.id === product.id);
        
        if (existing) {
          // Jika ada, tambahkan quantity-nya saja
          return {
            items: state.items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        // Jika belum ada, masukkan sebagai item baru
        return { items: [...state.items, { product, quantity: 1 }] };
      }),

      decreaseQuantity: (productId) => set((state) => {
        const existing = state.items.find((i) => i.product.id === productId);
        
        // Jika quantity lebih dari 1, kurangi 1
        if (existing && existing.quantity > 1) {
             return {
                items: state.items.map((i) => 
                    i.product.id === productId ? { ...i, quantity: i.quantity - 1} : i
                )
             }
        }
        // Jika sisa 1 dan dikurang, maka hapus item dari keranjang
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter((i) => i.product.id !== productId),
      })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        // Hitung total harga (pastikan konversi ke Number karena dari backend bisa String/Decimal)
        return get().items.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage', // Key untuk penyimpanan di LocalStorage browser
    }
  )
);