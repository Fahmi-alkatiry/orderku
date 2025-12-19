import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/store/useCart';
import { formatRupiah } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: number;
  tableNumber: string;
  onOrderPlaced: (order: any) => void;
}

export const CartSheet = ({ open, onOpenChange, restaurantId, tableNumber, onOrderPlaced }: CartSheetProps) => {
  // Perhatikan: kita ambil fungsi decreaseQuantity yang support uniqueId
  const { items, addToCart, decreaseQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);

  useEffect(() => {
    if (open) {
      const pendingOrder = localStorage.getItem(`pendingOrder_${restaurantId}`);
      if (pendingOrder) setHasPendingOrder(true);
    }
  }, [open, restaurantId]);

  const handleSubmit = async () => {
    if (!customerName.trim() || items.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // --- PERBAIKAN UTAMA DI SINI ---
      const payloadItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        // Kirim data addons yang dipilih ke backend
        addons: item.selectedAddons || [] 
      }));

      const res = await api.post('/orders', {
        restaurantId,
        tableNumber,
        customerName: customerName.trim(),
        items: payloadItems
      });
      // -------------------------------

      localStorage.setItem(`pendingOrder_${restaurantId}`, res.data.data.id);
      clearCart();
      setCustomerName('');
      onOpenChange(false);
      onOrderPlaced({ ...res.data.data, total: totalPrice() }); 
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal pesanan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPending = () => {
    if(confirm("Buat pesanan baru?")) {
      localStorage.removeItem(`pendingOrder_${restaurantId}`);
      setHasPendingOrder(false);
    }
  }

  // Helper untuk mengurangi item berdasarkan Unique ID
  const handleDecrease = (item: any) => {
    if (item.uniqueId) decreaseQuantity(item.uniqueId);
  }

  const handleRemove = (item: any) => {
    if (item.uniqueId) removeFromCart(item.uniqueId);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0 bg-gray-50 flex flex-col">
        <SheetHeader className="px-5 pb-4 border-b border-gray-200 bg-white rounded-t-3xl pt-4">
          <SheetTitle className="font-bold text-xl text-gray-800">Keranjang Anda</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {hasPendingOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Menunggu Pembayaran</h3>
              <Button onClick={handleResetPending} variant="ghost" className="text-sm text-red-500">
                Buat Pesanan Baru (Reset)
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <span className="text-5xl mb-3">🛒</span>
                    <p>Keranjang masih kosong</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.uniqueId || idx} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <img src={item.product.image || "https://dummyimage.com/100"} className="w-20 h-20 object-cover rounded-lg bg-gray-200" alt="" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                          
                          {/* TAMPILKAN ADDONS DI KERANJANG */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              + {item.selectedAddons.map(a => a.name).join(", ")}
                            </p>
                          )}

                          <p className="text-orange-600 font-semibold text-sm mt-1">
                            {/* Hitung harga per item (base + addons) */}
                            {formatRupiah(Number(item.product.price) + (item.selectedAddons?.reduce((sum, a) => sum + Number(a.price), 0) || 0))}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 active:scale-95" onClick={() => handleDecrease(item)}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                            <button className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-orange-600 active:scale-95" onClick={() => addToCart(item.product, item.selectedAddons)}>
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleRemove(item)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 px-5 py-6 space-y-4 bg-white shadow-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Pemesan</label>
                    <Input placeholder="Masukkan nama Anda (Wajib)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-12" />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-dashed border-gray-200 mt-2">
                    <span className="text-gray-500">Total Pembayaran</span>
                    <span className="text-xl font-bold text-gray-900">{formatRupiah(totalPrice())}</span>
                  </div>
                  <Button onClick={handleSubmit} disabled={!customerName.trim() || isSubmitting} className="w-full h-14 bg-orange-600 hover:bg-orange-700 font-bold text-base">
                    {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};