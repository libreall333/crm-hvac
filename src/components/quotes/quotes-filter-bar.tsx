'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { QUOTE_STATUS_LABELS } from '@/lib/status'

export function QuotesFilterBar() {
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

  function setStatus(value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value === 'all') sp.delete('status')
    else sp.set('status', value)
    router.replace(`?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 p-3 border-b border-border">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Código o cliente..." className="pl-8 h-8" />
      </div>
      <Select value={params.get('status') || 'all'} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.entries(QUOTE_STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
