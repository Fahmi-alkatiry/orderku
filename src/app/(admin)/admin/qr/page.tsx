"use client"

import { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminQRPage() {
  const [tableCount, setTableCount] = useState(10);
  const [generatedTables, setGeneratedTables] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Ganti mock data dengan state lokal
  const [restaurant, setRestaurant] = useState({ 
    name: 'Kopi Senja', 
    slug: 'kopi-senja' // Default slug
  });
  
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // 1. Set base URL browser
    setBaseUrl(window.location.origin);
    
    // 2. (Opsional) Ambil slug restoran dari localStorage jika ada
    // Ini agar QR code yang digenerate sesuai dengan restoran yang login
    const storedSlug = localStorage.getItem('restaurantSlug'); 
    // if (storedSlug) setRestaurant(prev => ({ ...prev, slug: storedSlug }));
  }, []);

  const handleGenerate = () => {
    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);
    setGeneratedTables(tables);
    toast.success(`${tableCount} QR codes telah dibuat!`);
  };

  const getTableUrl = (tableNumber: number) => {
    // Format URL sesuai routing aplikasi kita: /slug/meja/nomor
    return `${baseUrl}/${restaurant.slug}/meja/${tableNumber}`;
  };

  const handleCopy = async (tableNumber: number) => {
    const url = getTableUrl(tableNumber);
    await navigator.clipboard.writeText(url);
    setCopiedId(tableNumber);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`Link Meja ${tableNumber} disalin!`);
  };

  const getQRCodeUrl = (tableNumber: number) => {
    // Menggunakan API publik goqr.me atau qrserver untuk generate gambar QR
    const url = encodeURIComponent(getTableUrl(tableNumber));
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <Toaster position="top-right" />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Generator QR Code</h1>
          <p className="text-gray-500">Buat QR code untuk setiap meja di restoran Anda</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 max-w-md shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tableCount">Jumlah Meja</Label>
              <Input
                id="tableCount"
                type="number"
                min={1}
                max={100}
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                className="h-12"
              />
              <p className="text-xs text-gray-500">
                Masukkan jumlah meja yang ingin dibuatkan QR code
              </p>
            </div>
            <Button 
              onClick={handleGenerate}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-semibold text-white"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Generate QR Codes
            </Button>
          </div>
        </div>

        {generatedTables.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                QR Codes ({generatedTables.length} meja)
              </h2>
              <Button variant="outline" size="sm" className="bg-white border-gray-300 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Download Semua
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {generatedTables.map((tableNumber) => (
                <div
                  key={tableNumber}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <img
                      src={getQRCodeUrl(tableNumber)}
                      alt={`QR Code Meja ${tableNumber}`}
                      className="w-full aspect-square mix-blend-multiply"
                    />
                  </div>
                  <p className="font-bold mb-1 text-gray-900">Meja {tableNumber}</p>
                  <p className="text-xs text-gray-400 mb-3 truncate px-2">
                    {getTableUrl(tableNumber)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 bg-white"
                      onClick={() => handleCopy(tableNumber)}
                    >
                      {copiedId === tableNumber ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <a 
                      href={getTableUrl(tableNumber)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 bg-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {generatedTables.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Belum ada QR code</p>
            <p className="text-sm">Masukkan jumlah meja dan klik generate</p>
          </div>
        )}
      </main>
    </div>
  );
}