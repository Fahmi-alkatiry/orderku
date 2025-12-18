import { useEffect, useState } from "react";

// Hook ini menerima value (apa yang diketik) dan delay (berapa lama nunggunya)
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 1. Set timer untuk update value setelah delay selesai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup: Jika value berubah sebelum delay selesai (user ngetik lagi),
    // batalkan timer sebelumnya (reset timer)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}