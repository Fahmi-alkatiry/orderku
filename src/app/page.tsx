import Link from "next/link";
import { QrCode, LayoutDashboard, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-orange-50/50" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200">
              <span>🚀</span> Platform Pemesanan QR Code #1 di Indonesia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Kelola Pesanan Restoran dengan{' '}
              <span className="text-orange-600">Mudah & Cepat</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              OrderKu adalah platform SaaS multi-tenant untuk pemesanan mandiri berbasis QR Code. 
              Pelanggan scan, pesan, dan bayar di kasir - sesimpel itu!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 font-semibold shadow-lg shadow-orange-200">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Masuk Dashboard Admin
                </Button>
              </Link>
              
              <Link href="/kopi-senja/meja/5">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 font-semibold bg-white">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Demo Customer View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Fitur Unggulan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">QR Code Generator</h3>
              <p className="text-gray-500">
                Generate QR code untuk setiap meja secara otomatis. Pelanggan tinggal scan dan langsung bisa memesan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Mobile-First Menu</h3>
              <p className="text-gray-500">
                Tampilan menu yang dioptimalkan untuk HP dengan foto makanan yang menggugah selera.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">Real-time Dashboard</h3>
              <p className="text-gray-500">
                Pesanan masuk secara real-time ke dashboard kasir. Tidak ada pesanan yang terlewat!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-10 md:p-16 text-white shadow-2xl shadow-orange-200 mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Meningkatkan Efisiensi Restoran Anda?
            </h2>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto text-lg">
              Mulai gunakan OrderKu sekarang dan rasakan kemudahan mengelola pesanan restoran Anda.
            </p>
            <Link href="/admin/login">
              <Button size="lg" variant="secondary" className="h-14 px-8 font-semibold bg-white text-orange-600 hover:bg-gray-100 border-none">
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p className="font-bold text-xl text-gray-900 mb-2">OrderKu</p>
          <p className="text-sm">© 2025 OrderKu. Platform SaaS Multi-Tenant untuk Restoran.</p>
        </div>
      </footer>
    </div>
  );
}