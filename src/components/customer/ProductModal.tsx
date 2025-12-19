import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Product, Addon } from '@/types';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
// PERBAIKAN: Import DialogTitle
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, addons: Addon[]) => void;
}

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }: ProductModalProps) => {
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  useEffect(() => {
    setSelectedAddons([]);
  }, [product, isOpen]);

  if (!product) return null;

  const incrementAddon = (addon: Addon) => {
    setSelectedAddons(prev => [...prev, addon]);
  };

  const decrementAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const index = prev.findIndex(a => a.name === addon.name);
      if (index !== -1) {
        const newArr = [...prev];
        newArr.splice(index, 1); 
        return newArr;
      }
      return prev;
    });
  };

  const getAddonCount = (addonName: string) => {
    return selectedAddons.filter(a => a.name === addonName).length;
  };

  const totalPrice = Number(product.price) + selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const availableAddons = (product.addons as Addon[]) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col gap-0 border-none outline-none">
        
        {/* Header Gambar */}
        <div className="relative h-48 w-full shrink-0 bg-gray-100">
          <img 
            src={product.image || "https://dummyimage.com/400"} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 p-1 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <div className="mb-6">
            {/* PERBAIKAN: Gunakan DialogTitle di sini sebagai pengganti h2 */}
            <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
              {product.name}
            </DialogTitle>
            
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              {product.description || "Tidak ada deskripsi"}
            </p>
            <p className="text-orange-600 font-bold mt-2 text-lg">
              {formatRupiah(Number(product.price))}
            </p>
          </div>

          {/* List Addons */}
          {availableAddons.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-2">
                Tambahan (Opsional)
              </h3>
              <div className="space-y-3">
                {availableAddons.map((addon, idx) => {
                  const count = getAddonCount(addon.name);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        count > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <span className={`text-sm block ${count > 0 ? 'font-semibold text-orange-900' : 'text-gray-700'}`}>
                          {addon.name}
                        </span>
                        <span className="text-xs text-gray-500">+{formatRupiah(addon.price)}</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                        <button
                          onClick={() => decrementAddon(addon)}
                          disabled={count === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="w-4 text-center text-sm font-semibold text-gray-900">
                          {count}
                        </span>
                        
                        <button
                          onClick={() => incrementAddon(addon)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t border-gray-100 bg-white mt-auto">
          <Button 
            onClick={() => {
              onAddToCart(product, selectedAddons);
              onClose();
            }}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-bold text-base flex justify-between px-6 shadow-lg shadow-orange-200"
          >
            <span>Tambah Pesanan</span>
            <span>{formatRupiah(totalPrice)}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};