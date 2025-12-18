import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper untuk menggabungkan class Tailwind dengan rapi
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper format Rupiah
export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}