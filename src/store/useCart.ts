import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Addon } from '@/types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, addons?: Addon[]) => void;
  removeFromCart: (uniqueId: string) => void;
  decreaseQuantity: (uniqueId: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product, selectedAddons = []) => set((state) => {
        // Buat ID unik kombinasi: ProductID + Addons
        // Contoh: "1-Telur-Keju" vs "1-"
        const addonString = selectedAddons.map(a => a.name).sort().join('-');
        const uniqueId = `${product.id}-${addonString}`;

        const existing = state.items.find((i) => i.uniqueId === uniqueId);
        
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.uniqueId === uniqueId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        
        return { 
          items: [...state.items, { 
            product, 
            quantity: 1, 
            selectedAddons, 
            uniqueId 
          }] 
        };
      }),

      decreaseQuantity: (uniqueId) => set((state) => {
        const existing = state.items.find((i) => i.uniqueId === uniqueId);
        if (existing && existing.quantity > 1) {
             return {
                items: state.items.map((i) => 
                    i.uniqueId === uniqueId ? { ...i, quantity: i.quantity - 1} : i
                )
             }
        }
        return { items: state.items.filter((i) => i.uniqueId !== uniqueId) };
      }),

      removeFromCart: (uniqueId) => set((state) => ({
        items: state.items.filter((i) => i.uniqueId !== uniqueId),
      })),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((total, item) => {
          const basePrice = Number(item.product.price);
          const addonsPrice = item.selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
          return total + ((basePrice + addonsPrice) * item.quantity);
        }, 0);
      }
    }),
    { name: 'cart-storage' }
  )
);