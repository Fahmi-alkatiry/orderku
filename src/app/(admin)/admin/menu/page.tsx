"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Filter, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types"; // Pastikan interface Product di types/index.ts punya field addons?: any
import api from "@/lib/axios";
import { toast, Toaster } from "react-hot-toast";
import { formatRupiah } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// IMPORT KOMPONEN BARU
import { AddonManager } from "@/components/admin/AddonManager";

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tambahkan field addons ke state editingItem (casting ke any agar fleksibel)
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
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

  // ... (Filter Logic sama seperti sebelumnya) ...
  const filterCategories = useMemo(() => {
    const uniqueCats = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua", ...uniqueCats];
  }, [products]);

  const formCategories = useMemo(() => {
    const uniqueCats = new Set(["Makanan", "Minuman", "Snack"]);
    products.forEach((p) => uniqueCats.add(p.category));
    return Array.from(uniqueCats);
  }, [products]);

  const filteredItems = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, selectedCategory]);

  // UPDATE: Inisialisasi addons sebagai array kosong jika null
  const openDialog = (item?: any) => {
    if (item) {
      setEditingItem({
        ...item,
        addons: item.addons || [], // Pastikan addons array
      });
      setIsCustomCategory(false);
    } else {
      setEditingItem({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
        addons: [], // Default array kosong untuk produk baru
      });
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
      category: editingItem.category,
      image: editingItem.image,
      description: editingItem.description || "",
      isAvailable: editingItem.isAvailable ?? true,
      addons: editingItem.addons, // KIRIM ADDONS KE BACKEND
    };

    try {
      if (editingItem.id) {
        await api.put(`/products/${editingItem.id}`, payload);
        toast.success("Menu berhasil diperbarui");
      } else {
        await api.post("/products", payload);
        toast.success("Menu baru ditambahkan");
      }

      setDialogOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus menu ini selamanya?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Menu dihapus");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Gagal menghapus menu");
    }
  };

  const handleToggleStatus = async (item: Product) => {
    try {
      await api.put(`/products/${item.id}`, {
        ...item,
        isAvailable: !item.isAvailable,
      });
      toast.success("Status diperbarui");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
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
            <p className="text-gray-500">Atur makanan, minuman, dan add-ons</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openDialog()}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem?.id ? "Edit Menu" : "Tambah Menu Baru"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* ... Input Nama, Deskripsi, Harga, Kategori, Gambar (SAMA SEPERTI SEBELUMNYA) ... */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nama Menu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editingItem?.name || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    placeholder="Contoh: Nasi Goreng Spesial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Harga <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={editingItem?.price || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          price: parseInt(e.target.value),
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <Input
                          autoFocus
                          value={editingItem?.category || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              category: e.target.value,
                            })
                          }
                          placeholder="Ketik baru..."
                          className="border-orange-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsCustomCategory(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={
                          formCategories.includes(editingItem?.category || "")
                            ? editingItem?.category
                            : undefined
                        }
                        onValueChange={(val) => {
                          if (val === "custom_new") {
                            setIsCustomCategory(true);
                            setEditingItem({ ...editingItem, category: "" });
                          } else {
                            setEditingItem({ ...editingItem, category: val });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                          {formCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                          <div className="h-px bg-gray-100 my-1" />
                          <SelectItem
                            value="custom_new"
                            className="text-orange-600 font-medium"
                          >
                            + Tambah Baru
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Input
                    value={editingItem?.description || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        description: e.target.value,
                      })
                    }
                    placeholder="Deskripsi..."
                  />
                </div>

                {/* --- BAGIAN ADDONS DI SINI --- */}
                <div className="pt-2 pb-2 border-t border-b border-gray-100">
                  <AddonManager
                    // Pastikan ini mengambil value dari state editingItem
                    value={editingItem?.addons || []}
                    // Pastikan ini mengupdate state editingItem
                    onChange={(newAddons) => {
                      console.log("Addons Updated:", newAddons); // Debugging: Cek di Console browser
                      setEditingItem({ ...editingItem, addons: newAddons });
                    }}
                  />
                </div>
                {/* ----------------------------- */}

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Gambar</label>
                  <Input
                    value={editingItem?.image || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- FILTER & TABLE SECTION (Sama seperti sebelumnya) --- */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Semua Kategori" />
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

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">
                      Menu
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">
                      Kategori
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">
                      Harga
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-center">
                      Addons
                    </th>{" "}
                    {/* Kolom Baru */}
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "https://dummyimage.com/100"}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                            alt=""
                          />
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 max-w-[150px]">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatRupiah(Number(item.price))}
                      </td>

                      {/* Kolom Indikator Addons */}
                      <td className="px-6 py-4 text-center">
                        {item.addons &&
                        Array.isArray(item.addons) &&
                        item.addons.length > 0 ? (
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                            {item.addons.length} Opsi
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => handleToggleStatus(item)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(item)}
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
