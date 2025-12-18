import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export const useSocket = (restaurantId: number) => {
  // PERBAIKAN: Inisialisasi state langsung dengan status socket saat ini.
  // Ini menghindari pemanggilan setIsConnected di dalam useEffect saat mount.
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Jangan lakukan apa-apa jika ID belum ada
    if (!restaurantId) return;

    // Fungsi untuk join room
    const joinRoom = () => {
      console.log(`🔌 Socket Connected. Joining room: resto_${restaurantId}`);
      socket.emit('join_dashboard', restaurantId);
    };

    // 1. Connect manual jika belum
    if (!socket.connected) {
      socket.connect();
    } else {
      // Jika sudah connect dari awal, langsung join room saja.
      // Tidak perlu setIsConnected(true) lagi karena state awal sudah benar.
      joinRoom();
    }

    // 2. Listener status koneksi
    const onConnect = () => {
      setIsConnected(true);
      joinRoom(); // Join saat baru connect
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("🔌 Socket Disconnected");
    };

    // Pasang Event Listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [restaurantId]);

  return { socket, isConnected };
};