"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast, Toaster } from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      
      // Simpan Token & User Data
      localStorage.setItem("token", res.data.data.token)
      localStorage.setItem("restaurantId", res.data.data.restaurant.id)
      
      toast.success("Login Berhasil")
      router.push("/admin/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal Login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster />
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Resto</h1>
          <p className="text-gray-500">Masuk untuk mengelola pesanan</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </div>
  )
}