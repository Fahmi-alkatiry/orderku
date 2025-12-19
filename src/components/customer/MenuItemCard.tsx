import { Plus, Minus } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

interface MenuItemCardProps {
  item: Product;
  onSelect?: (item: Product) => void;
}

export const MenuItemCard = ({ item, onSelect }: MenuItemCardProps) => {
  const { items, addToCart, decreaseQuantity } = useCart();
  
  // Cari item di keranjang yang ID produknya sama
  // Note: Jika ada varian (addon), ini akan mengambil varian pertama yang ditemukan
  const cartItem = items.find((i) => i.product.id === item.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(item);
    } else {
      addToCart(item);
    }
  };

  const handleDecrease = () => {
    // PERBAIKAN: Gunakan uniqueId dari item keranjang, bukan product id
    if (cartItem && cartItem.uniqueId) {
      decreaseQuantity(cartItem.uniqueId);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition hover:shadow-md">
      {/* IMAGE */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={item.image || "https://dummyimage.com/300x300/eee/aaa"}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {item.name}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
          {item.category}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          {/* PRICE */}
          <span className="text-sm font-bold text-orange-600">
            {formatRupiah(Number(item.price))}
          </span>

          {/* ACTION */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-full p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                onClick={handleDecrease} 
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>

              <span className="w-4 text-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>

              <Button
                size="sm"
                className="h-7 w-7 rounded-full bg-orange-600 hover:bg-orange-700 p-0"
                onClick={handleClick}
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={!item.isAvailable}
              className="h-9 w-9 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 p-0"
              onClick={handleClick}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};