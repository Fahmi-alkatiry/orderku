import { useState, useEffect } from 'react'; // Tambah useState & useEffect
import { Clock, User, MapPin, ChevronRight, AlertTriangle } from 'lucide-react'; // Tambah AlertTriangle
import { Order } from '@/types';
import { cn, formatRupiah } from '@/lib/utils';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  isNew?: boolean;
}

export const OrderCard = ({ order, onClick, isNew }: OrderCardProps) => {
  // Hitung selisih waktu dalam menit
  const [minutesPassed, setMinutesPassed] = useState(0);

  useEffect(() => {
    // Update timer setiap 1 menit agar warna berubah real-time
    const calculateTime = () => {
      if (order.createdAt) {
        const diff = differenceInMinutes(new Date(), new Date(order.createdAt));
        setMinutesPassed(diff);
      }
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Cek tiap 1 menit
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // LOGIKA WARNA BERDASARKAN WAKTU (Hanya untuk yang PENDING)
  let cardStyle = "bg-white border-gray-200 hover:border-orange-200";
  let statusBadge = { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' };
  let isGhostOrder = false;

  if (order.status === 'PENDING') {
    if (minutesPassed > 30) {
      // Sangat Lama (> 30 menit): Kemungkinan Spam/Ghost
      cardStyle = "bg-red-50 border-red-200 opacity-70";
      statusBadge = { label: 'Kadaluwarsa?', color: 'bg-red-100 text-red-800' };
      isGhostOrder = true;
    } else if (minutesPassed > 10) {
      // Agak Lama (> 10 menit): Warning
      cardStyle = "bg-orange-50 border-orange-200";
      statusBadge = { label: 'Menunggu Lama', color: 'bg-orange-100 text-orange-800' };
    }
  } else if (order.status === 'PAID') {
    statusBadge = { label: 'Dibayar', color: 'bg-green-100 text-green-800' };
    cardStyle = "bg-green-50/30 border-green-200"; // Sedikit hijau agar kasir tahu ini aman
  } else if (order.status === 'COMPLETED') {
    statusBadge = { label: 'Selesai', color: 'bg-gray-100 text-gray-600' };
  } else if (order.status === 'CANCELLED') {
    statusBadge = { label: 'Batal', color: 'bg-red-100 text-red-800' };
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
        cardStyle,
        isNew && "ring-2 ring-blue-500 animate-pulse" // Ring biru untuk pesanan baru masuk
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-800">#{order.id}</span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", statusBadge.color)}>
              {statusBadge.label}
            </span>
            {isGhostOrder && <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Meja {order.tableNumber}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {order.customerName}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
        <div className={cn("flex items-center gap-1 text-xs", isGhostOrder ? "text-red-500 font-bold" : "text-gray-400")}>
          <Clock className="w-3.5 h-3.5" />
          {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: id }) : '-'}
        </div>
        <span className="font-bold text-gray-900">{formatRupiah(Number(order.totalAmount))}</span>
      </div>
    </div>
  );
};