import { CheckCircle, Clock, User, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatRupiah } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void; // Callback untuk refresh data dashboard
}

export const OrderDetailSheet = ({ order, open, onOpenChange, onUpdate }: OrderDetailSheetProps) => {
  if (!order) return null;

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      toast.success(`Status diubah menjadi ${status}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal update status");
    }
  };

  // --- FUNGSI HAPUS ---
  const handleDelete = async () => {
    if(!confirm(`Yakin ingin MENGHAPUS pesanan #${order.id} dari Meja ${order.tableNumber}? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    try {
      await api.delete(`/orders/${order.id}`);
      toast.success("Pesanan berhasil dihapus");
      onUpdate(); // Refresh dashboard
      onOpenChange(false); // Tutup sheet
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus pesanan");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full bg-white p-6 h-full flex flex-col">
        <SheetHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold flex items-center gap-3">
            Order #{order.id}
          </SheetTitle>
          
          {/* TOMBOL HAPUS (Hanya muncul di pojok atas) */}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
            title="Hapus Pesanan"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </SheetHeader>

        <div className="py-6 space-y-6 flex-1 overflow-y-auto">
          {/* Info Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Meja</span>
              </div>
              <p className="font-bold text-lg text-gray-900">{order.tableNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs">Pelanggan</span>
              </div>
              <p className="font-medium truncate text-gray-900">{order.customerName}</p>
            </div>
          </div>

          {/* List Items */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">Detail Pesanan</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-white border border-gray-100 rounded-lg p-3">
                  <img
                    src={item.product.image || "https://dummyimage.com/100"}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg bg-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-gray-900">{item.product.name}</p>
                      <p className="text-xs font-bold text-gray-900">x{item.quantity}</p>
                    </div>
                    
                    {/* TAMPILKAN ADDONS DI ADMIN */}
                    {item.addons && Array.isArray(item.addons) && item.addons.length > 0 && (
                      <div className="mt-1 mb-1">
                        {item.addons.map((addon: any, idx: number) => (
                          <span key={idx} className="inline-block bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0.5 rounded mr-1 border border-orange-100">
                            + {addon.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-end mt-1">
                      <p className="text-gray-400 text-xs">
                        @ {formatRupiah(Number(item.price))} 
                      </p>
                      <p className="font-semibold text-sm text-gray-800">
                        {formatRupiah(Number(item.subtotal))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Total */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-xl text-orange-600">{formatRupiah(Number(order.totalAmount))}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <Clock className="w-3.5 h-3.5" />
              {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: id }) : '-'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3 mt-auto">
          {order.status === 'PENDING' && (
            <div className="space-y-3">
              <Button
                onClick={() => updateStatus('PAID')}
                className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold text-white"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Terima Pembayaran
              </Button>
              
              {/* Opsi Hapus Alternatif (Tombol Besar Merah jika order sudah lama/spam) */}
              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus / Batalkan Pesanan
              </Button>
            </div>
          )}
          
          {order.status === 'PAID' && (
            <Button
              onClick={() => updateStatus('COMPLETED')}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-white"
            >
              Selesaikan Pesanan
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};