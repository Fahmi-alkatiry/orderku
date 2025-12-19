import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/utils';

// Tipe data untuk Addon
interface Addon {
  name: string;
  price: number;
}

interface AddonManagerProps {
  value?: Addon[]; // Data addons yang sudah ada
  onChange: (addons: Addon[]) => void; // Fungsi untuk update data ke parent
}

export const AddonManager = ({ value = [], onChange }: AddonManagerProps) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const handleAdd = () => {
    if (!newName || !newPrice) return;

    const newItem: Addon = {
      name: newName,
      price: Number(newPrice)
    };

    // Update parent state
    onChange([...value, newItem]);

    // Reset input
    setNewName('');
    setNewPrice('');
  };

  const handleDelete = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Add-ons / Toping (Opsional)</label>
      
      {/* List Addons yang sudah ditambah */}
      <div className="space-y-2">
        {value.map((addon, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
            <div className="text-sm">
              <span className="font-medium text-gray-900">{addon.name}</span>
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-orange-600 font-medium">+{formatRupiah(addon.price)}</span>
            </div>
            <button 
              type="button"
              onClick={() => handleDelete(idx)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Input Baru */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <Input 
            placeholder="Nama (Misal: Telur)" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="w-24 space-y-1">
          <Input 
            type="number" 
            placeholder="Harga" 
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <Button 
          type="button" 
          onClick={handleAdd}
          disabled={!newName || !newPrice}
          className="h-9 px-3 bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};