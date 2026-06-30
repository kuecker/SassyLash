import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-stone-800">Sassy Lash & Skin — Admin</span>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
          <Link href="/admin/availability" className="text-stone-600 hover:text-stone-900">Hours</Link>
          <Link href="/admin/clients" className="text-stone-600 hover:text-stone-900">Clients</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
