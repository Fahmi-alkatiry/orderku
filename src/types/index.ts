// Tipe Data Produk (Menu)
export interface Product {
  id: number;
  name: string;
  price: number | string; // Bisa string dari backend (Decimal), kita convert nanti
  image: string | null;
  category: string;
  description?: string;
  isAvailable: boolean;
  restaurantId?: number;
}

// Tipe Data Item di Keranjang Belanja (Frontend only)
export interface CartItem {
  product: Product;
  quantity: number;
}

// Tipe Data Item di dalam Order (Dari Backend)
export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
}

// Tipe Data Pesanan Lengkap
export interface Order {
  id: number;
  restaurantId: number;
  tableNumber: string;
  customerName: string;
  totalAmount: number | string;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  createdAt: string; // Tanggal dari backend dikirim sebagai ISO String
}

// Tipe Data Restoran
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

// Tipe Data User (Login Response)
export interface AuthResponse {
  token: string;
  restaurant: {
    id: number;
    name: string;
    slug: string;
    email: string;
  };
}