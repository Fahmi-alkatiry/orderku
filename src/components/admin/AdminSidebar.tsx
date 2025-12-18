"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, QrCode, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: UtensilsCrossed, label: 'Menu', path: '/admin/menu' },
  { icon: QrCode, label: 'QR Codes', path: '/admin/qr' },
  { icon: Settings, label: 'Pengaturan', path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [restoName, setRestoName] = useState("Loading...");
  const [isOpen, setIsOpen] = useState(false); // State untuk mobile sidebar

  useEffect(() => {
    const storedName = localStorage.getItem('restaurantName');
    if (storedName) {
      setRestoName(storedName);
    }
  }, []);

  // Tutup sidebar otomatis saat pindah halaman di mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('restaurantId');
      localStorage.removeItem('restaurantName');
      toast.success('Berhasil logout');
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Gelap untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "w-64 bg-white border-r border-gray-200 h-screen flex flex-col transition-transform duration-300 ease-in-out z-50",
          // Mobile styles: Fixed position & transform logic
          "fixed top-0 left-0", 
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop styles: Sticky position & always visible
          "md:translate-x-0 md:sticky md:top-0"
        )}
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50/50 border border-orange-100/50">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <span className="text-xl">🍽️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate text-gray-900" title={restoName}>
                {restoName}
              </p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigasi Utama */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-orange-600 text-white shadow-md shadow-orange-200" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (Logout & Info) */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Powered by</p>
            <p className="font-bold text-orange-600">OrderKu SaaS</p>
          </div>
        </div>
      </aside>
    </>
  );
};