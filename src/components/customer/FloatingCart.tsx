import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';

interface FloatingCartProps {
  onClick: () => void;
}

export const FloatingCart = ({ onClick }: FloatingCartProps) => {
  const { items, totalPrice } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-6 z-40 max-w-md mx-auto">
      <Button
        onClick={onClick}
        className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 flex items-center justify-between px-5 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-orange-100">
              {itemCount}
            </span>
          </div>
          <span className="font-semibold">Lihat Keranjang</span>
        </div>
        <span className="font-bold text-lg">{formatRupiah(totalPrice())}</span>
      </Button>
    </div>
  );
};