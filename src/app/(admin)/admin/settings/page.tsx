"use client"

import { useState, useEffect } from 'react';
import { Save, Store, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'react-hot-toast';
import api from '@/lib/axios';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    address: '',
    logoUrl: ''
  });

  // 1. Load Data Profil saat halaman dibuka
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const data = res.data.data;
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          email: data.email || '',
          address: data.address || '',
          logoUrl: data.logoUrl || ''
        });
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Handle Save Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/auth/profile', {
        name: formData.name,
        address: formData.address,
        logoUrl: formData.logoUrl
      });
      
      // Update localStorage agar nama di sidebar berubah (opsional, jika sidebar baca localStorage)
      localStorage.setItem('restaurantName', formData.name);
      
      toast.success("Pengaturan berhasil disimpan");
      // Refresh halaman opsional agar sidebar update otomatis
      // window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <Toaster position="top-right" />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Restoran</h1>
            <p className="text-gray-500">Kelola identitas dan informasi restoran Anda</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header Card */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Profil Umum</h2>
                <p className="text-xs text-gray-500">Informasi ini akan tampil di menu pelanggan</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-6">
                
                {/* Read Only Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 opacity-70">
                    <label className="text-sm font-medium text-gray-700">URL Slug (Permanen)</label>
                    <Input value={formData.slug} disabled className="bg-gray-100 cursor-not-allowed" />
                    <p className="text-xs text-gray-400">Digunakan untuk link QR Code Anda</p>
                  </div>
                  <div className="space-y-2 opacity-70">
                    <label className="text-sm font-medium text-gray-700">Email Admin</label>
                    <Input value={formData.email} disabled className="bg-gray-100 cursor-not-allowed" />
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Editable Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Restoran</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="pl-10"
                        placeholder="Contoh: Kopi Senja"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Alamat</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Alamat lengkap restoran..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">URL Logo Restoran</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={formData.logoUrl} 
                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                        className="pl-10"
                        placeholder="https://..."
                      />
                    </div>
                    {formData.logoUrl && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <img 
                          src={formData.logoUrl} 
                          alt="Preview" 
                          className="w-10 h-10 object-cover rounded-md bg-white"
                          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} 
                        />
                        <span className="text-xs text-gray-500">Preview Logo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px]">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>

              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}