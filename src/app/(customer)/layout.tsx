// app/(customer)/layout.tsx
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Hapus max-w-md, shadow, dan overflow-hidden agar bisa full width di desktop
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}