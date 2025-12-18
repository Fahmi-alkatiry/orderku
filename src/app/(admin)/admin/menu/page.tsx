"use client"

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Filter, X } from 'lucide-react'; // Tambah icon X
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Product } from '@/types';
import api from '@/lib/axios';
import { toast, Toaster } from 'react-hot-toast';
import { formatRupiah } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // State Dialog & Form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Product> | null>(null);
  
  // State khusus untuk mode input kategori manual
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products');
        setProducts(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data menu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // 2. Extract Categories untuk Filter (Ada 'Semua')
  const filterCategories = useMemo(() => {
    const uniqueCats = Array.from(new Set(products.map(p => p.category)));
    return ['Semua', ...uniqueCats];
  }, [products]);

  // 3. Extract Categories untuk Form Input (Tanpa 'Semua', plus default)
  const formCategories = useMemo(() => {
    // Default kategori dasar agar tidak kosong saat awal
    const uniqueCats = new Set(['Makanan', 'Minuman', 'Snack']);
    // Tambahkan kategori yang sudah ada di database
    products.forEach(p => uniqueCats.add(p.category));
    return Array.from(uniqueCats);
  }, [products]);

  // 4. Filter Logic
  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, selectedCategory]);

  // Handler saat tombol Tambah/Edit diklik
  const openDialog = (item?: Product) => {
    if (item) {
      setEditingItem(item);
      setIsCustomCategory(false); // Reset ke dropdown dulu
    } else {
      setEditingItem({}); 
      setIsCustomCategory(false);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem?.name || !editingItem?.price || !editingItem?.category) {
      return toast.error("Nama, Harga, dan Kategori wajib diisi");
    }
    
    setIsSubmitting(true);

    const payload = {
      name: editingItem.name,
      price: Number(editingItem.price),
      category: editingItem.category, // Ini akan menyimpan kategori baru (text) jika diketik manual
      image: editingItem.image,
      description: editingItem.description || '',
      isAvailable: editingItem.isAvailable ?? true
    };

    try {
      if (editingItem.id) {
        await api.put(`/products/${editingItem.id}`, payload);
        toast.success("Menu berhasil diperbarui");
      } else {
        await api.post('/products', payload);
        toast.success("Menu baru ditambahkan");
      }
      
      setDialogOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin ingin menghapus menu ini selamanya?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Menu dihapus");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleToggleStatus = async (item: Product) => {
    const originalProducts = [...products];
    setProducts(products.map(p => p.id === item.id ? { ...p, isAvailable: !p.isAvailable } : p));

    try {
      await api.put(`/products/${item.id}`, {
        ...item,
        isAvailable: !item.isAvailable
      });
      toast.success(item.isAvailable ? "Menu dinonaktifkan" : "Menu diaktifkan");
    } catch (error) {
      setProducts(originalProducts);
      toast.error("Gagal update status");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <Toaster position="top-right" />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Menu</h1>
            <p className="text-gray-500">Atur makanan dan minuman di restoran Anda</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-200">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem?.id ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Input Nama */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Menu <span className="text-red-500">*</span></label>
                  <Input 
                    value={editingItem?.name || ''} 
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    placeholder="Contoh: Nasi Goreng Spesial" 
                  />
                </div>
                
                {/* Input Deskripsi */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Input 
                    value={editingItem?.description || ''} 
                    onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    placeholder="Deskripsi singkat menu..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {/* Input Harga */}
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Harga <span className="text-red-500">*</span></label>
                    <Input 
                      type="number"
                      value={editingItem?.price || ''} 
                      onChange={e => setEditingItem({...editingItem, price: parseInt(e.target.value)})}
                      placeholder="0" 
                    />
                  </div>

                  {/* Input Kategori (Hybrid: Select / Text) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                    
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <Input 
                          autoFocus
                          value={editingItem?.category || ''}
                          onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                          placeholder="Ketik kategori baru..."
                          className="border-orange-500 ring-1 ring-orange-500"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setEditingItem({...editingItem, category: ''}); // Reset saat batal
                          }}
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        value={formCategories.includes(editingItem?.category || '') ? editingItem?.category : undefined} 
                        onValueChange={(val) => {
                          if (val === 'custom_new') {
                            setIsCustomCategory(true);
                            setEditingItem({...editingItem, category: ''});
                          } else {
                            setEditingItem({...editingItem, category: val});
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {formCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          {/* Opsi Spesial untuk Tambah Kategori */}
                          <div className="h-px bg-gray-100 my-1" />
                          <SelectItem value="custom_new" className="text-orange-600 font-medium focus:text-orange-700 focus:bg-orange-50">
                            + Tambah Kategori Baru
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Gambar</label>
                  <Input 
                    value={editingItem?.image || ''} 
                    onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                    placeholder="https://..." 
                  />
                  <p className="text-xs text-gray-400">*Gunakan link gambar langsung</p>
                </div>

                <Button 
                  onClick={handleSave} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- FILTER SECTION --- */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Cari nama menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Semua Kategori" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {filterCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm whitespace-nowrap">Menu</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm whitespace-nowrap">Kategori</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm whitespace-nowrap">Harga</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-center whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img 
                              src={item.image || 'https://dummyimage.com/100x100/eee/aaa?text=No+Img'} 
                              className="w-full h-full object-cover" 
                              alt={item.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://dummyimage.com/100x100/eee/aaa?text=Error';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{item.description || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {formatRupiah(Number(item.price))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Switch 
                            checked={item.isAvailable} 
                            onCheckedChange={() => handleToggleStatus(item)} 
                          />
                          <span className={`text-xs font-medium ${item.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                            {item.isAvailable ? 'Aktif' : 'Habis'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openDialog(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <span className="text-4xl mb-2 grayscale opacity-20">🥗</span>
              <p>Belum ada menu yang ditemukan.</p>
              {(searchQuery || selectedCategory !== 'Semua') && <p className="text-sm mt-1">Coba atur ulang filter pencarian.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}