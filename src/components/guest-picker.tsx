'use client'

import {useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import type {SeatingGuest} from '@/lib/types'

type Props = {
  guests: SeatingGuest[]
}

export function GuestPicker({guests}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const filteredGuests = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return guests
    return guests.filter((guest) => guest.name.toLowerCase().includes(normalized))
  }, [guests, query])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedId) return
    router.push(`/plek/${encodeURIComponent(selectedId)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Zoek je naam</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Begin met typen..."
          autoComplete="name"
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-4"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Kies je naam</span>
        <select
          required
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="mt-2 w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-4"
        >
          <option value="" disabled>
            {filteredGuests.length ? 'Selecteer je naam' : 'Geen namen gevonden'}
          </option>
          {filteredGuests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={!selectedId}
        className="w-full rounded-2xl bg-teal-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Toon mijn plek
      </button>
    </form>
  )
}
