'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function ClientsSearch() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')

  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString())
      if (search) sp.set('search', search)
      else sp.delete('search')
      router.replace(`?${sp.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="p-3 border-b border-border">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Empresa, RUT o contacto..." className="pl-8 h-8" />
      </div>
    </div>
  )
}
