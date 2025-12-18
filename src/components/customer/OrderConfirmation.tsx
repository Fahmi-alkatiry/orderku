import { CheckCircle2, ArrowRight, Clock, ChefHat, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';

interface OrderConfirmationProps {
  order: any;
  onNewOrder: () => void;
}

export const OrderConfirmation = ({ order, onNewOrder }: OrderConfirmationProps) => {
  
  // Konfigurasi tampilan berdasarkan status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Sudah Dibayar',
          color: 'bg-green-100 text-green-700',
          icon: <ChefHat className="w-14 h-14 text-green-600" />,
          title: 'Pesanan Diproses!',
          desc: 'Pembayaran diterima. Mohon tunggu, pesanan sedang disiapkan.',
          instruction: 'Duduk santai, kami akan antar pesanan Anda.'
        };
      case 'COMPLETED':
        return {
          label: 'Selesai',
          color: 'bg-blue-100 text-blue-700',
          icon: <CheckCircle2 className="w-14 h-14 text-blue-600" />,
          title: 'Pesanan Selesai!',
          desc: 'Terima kasih telah makan di sini.',
          instruction: 'Semoga harimu menyenangkan!'
        };
      case 'CANCELLED':
        return {
          label: 'Dibatalkan',
          color: 'bg-red-100 text-red-700',
          icon: <XCircle className="w-14 h-14 text-red-600" />,
          title: 'Pesanan Dibatalkan',
          desc: 'Pesanan ini telah dibatalkan.',
          instruction: 'Silahkan pesan ulang jika terjadi kesalahan.'
        };
      case 'PENDING':
      default:
        return {
          label: 'Menunggu Bayar',
          color: 'bg-orange-100 text-orange-700',
          icon: <Clock className="w-14 h-14 text-orange-600" />, // Ganti icon jadi jam
          title: 'Pesanan Diterima!',
          desc: `Terima kasih, ${order.customerName}!`,
          instruction: 'Silahkan menuju kasir dan sebutkan Nomor Order di atas.'
        };
    }
  };

  const config = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        
        {/* Icon Dinamis */}
        <div className={`w-24 h-24 rounded-full ${config.color.split(' ')[0]} flex items-center justify-center mb-6 mx-auto animate-bounce`}>
          {config.icon}
        </div>
          
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {config.title}
        </h1>
        <p className="text-gray-500 mb-8">
          {config.desc}
        </p>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
          <div className="text-center pb-4 border-b border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Nomor Order</p>
            <p className="text-4xl font-mono font-bold text-gray-900 tracking-wider">
              #{order.id}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Meja</span>
              <span className="font-medium text-gray-900">{order.tableNumber}</span>
            </div>
            
            {/* Status Dinamis */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${config.color}`}>
                {config.label}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-500">Total Bayar</span>
              <span className="font-bold text-lg text-gray-900">
                {formatRupiah(Number(order.totalAmount || order.total))}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <div className={`rounded-xl p-4 text-center border ${order.status === 'PENDING' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`font-semibold text-sm mb-1 ${order.status === 'PENDING' ? 'text-orange-800' : 'text-gray-700'}`}>
                {order.status === 'PENDING' ? '⏳ Instruksi Pembayaran' : 'ℹ️ Info'}
              </p>
              <p className="text-xs text-gray-600">
                {config.instruction}
                {order.status === 'PENDING' && (
                  <>
                    <br />
                    <span className="font-bold text-gray-900">Nomor Order #{order.id}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Pesan Lagi hanya muncul jika sudah selesai/batal/bayar */}
        {order.status !== 'PENDING' && (
          <Button
            onClick={onNewOrder}
            variant="ghost"
            className="mt-12 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
          >
            Pesan Lagi
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};