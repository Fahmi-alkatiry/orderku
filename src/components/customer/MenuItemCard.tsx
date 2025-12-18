import { Plus, Minus } from 'lucide-react';
import { Product } from '@/types'; // Gunakan tipe data Product kita
import { useCart } from '@/store/useCart'; // Gunakan Zustand
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';

interface MenuItemCardProps {
  item: Product;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  // Integrasi Zustand
  const { items, addToCart, decreaseQuantity } = useCart();
  const cartItem = items.find(i => i.product.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="relative h-36">
        <img
          src={item.image || "https://dummyimage.com/300x300/eee/aaa"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-800">Habis</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-2 flex-1">
          {item.category}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-orange-600">
            {formatRupiah(Number(item.price))}
          </span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 rounded-full p-0"
                onClick={() => decreaseQuantity(item.id)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-semibold text-sm w-4 text-center">{quantity}</span>
              <Button
                size="sm"
                className="h-6 w-6 rounded-full p-0 bg-orange-600 hover:bg-orange-700"
                onClick={() => addToCart(item)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 w-8 rounded-full p-0 bg-orange-100 text-orange-600 hover:bg-orange-200"
              onClick={() => addToCart(item)}
              disabled={!item.isAvailable}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};