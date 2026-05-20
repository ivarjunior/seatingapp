'use client'

import {useMemo, useState} from 'react'
import type {SeatingGuest, SeatingPlan, SeatingTable} from '@/lib/types'

type Props = {
  initialPlan: SeatingPlan
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}`
}

export function AdminSeatingEditor({initialPlan}: Props) {
  const [plan, setPlan] = useState(initialPlan)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const tableOptions = useMemo(
    () => plan.tables.map((table) => ({id: table.id, label: table.label})),
    [plan.tables],
  )

  async function savePlan() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch('/api/seating', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(password ? {'x-admin-password': password} : {}),
        },
        body: JSON.stringify(plan),
      })
      const data = (await response.json()) as SeatingPlan & {error?: string}
      if (!response.ok) {
        setError(data.error || 'Opslaan mislukt.')
        return
      }
      setPlan(data)
      setMessage('Opgeslagen. Gasten zien de nieuwe indeling direct.')
    } catch {
      setError('Netwerkfout bij opslaan.')
    } finally {
      setSaving(false)
    }
  }

  function updateEvent(field: keyof SeatingPlan['event'], value: string) {
    setPlan((current) => ({...current, event: {...current.event, [field]: value}}))
  }

  function updateTable(tableId: string, patch: Partial<SeatingTable>) {
    setPlan((current) => ({
      ...current,
      tables: current.tables.map((table) => (table.id === tableId ? {...table, ...patch} : table)),
    }))
  }

  function updateGuest(guestId: string, patch: Partial<SeatingGuest>) {
    setPlan((current) => ({
      ...current,
      guests: current.guests
        .map((guest) => (guest.id === guestId ? {...guest, ...patch} : guest))
        .sort((a, b) => a.name.localeCompare(b.name, 'nl')),
    }))
  }

  function addTable() {
    const index = plan.tables.length + 1
    const table: SeatingTable = {
      id: createId('table'),
      label: `Tafel ${index}`,
      capacity: 8,
      positionX: 20 + ((index - 1) % 4) * 20,
      positionY: 25 + Math.floor((index - 1) / 4) * 22,
    }
    setPlan((current) => ({...current, tables: [...current.tables, table]}))
  }

  function addGuest() {
    const firstTable = plan.tables[0]
    if (!firstTable) {
      setError('Voeg eerst minstens één tafel toe.')
      return
    }
    const guest: SeatingGuest = {
      id: createId('guest'),
      name: 'Nieuwe gast',
      tableId: firstTable.id,
      seatIndex: 0,
    }
    setPlan((current) => ({
      ...current,
      guests: [...current.guests, guest].sort((a, b) => a.name.localeCompare(b.name, 'nl')),
    }))
  }

  function removeGuest(guestId: string) {
    setPlan((current) => ({...current, guests: current.guests.filter((guest) => guest.id !== guestId)}))
  }

  function removeTable(tableId: string) {
    const fallback = plan.tables.find((table) => table.id !== tableId)?.id
    setPlan((current) => ({
      ...current,
      tables: current.tables.filter((table) => table.id !== tableId),
      guests: current.guests.map((guest) =>
        guest.tableId === tableId ? {...guest, tableId: fallback || guest.tableId} : guest,
      ),
    }))
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Evenement</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-600">Titel</span>
            <input value={plan.event.title} onChange={(e) => updateEvent('title', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Ondertitel</span>
            <input value={plan.event.subtitle || ''} onChange={(e) => updateEvent('subtitle', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Datum (YYYY-MM-DD)</span>
            <input value={plan.event.date} onChange={(e) => updateEvent('date', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Locatie</span>
            <input value={plan.event.venue} onChange={(e) => updateEvent('venue', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Tafels ({plan.tables.length})</h2>
          <button type="button" onClick={addTable} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            + Tafel
          </button>
        </div>
        
          <div className="mt-4 grid gap-3">
            {plan.tables.map((table) => (
              <div key={table.id} className="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))_auto] sm:items-end">
                <label className="block text-sm">
                  <span className="text-slate-600">Label</span>
                  <input value={table.label} onChange={(e) => updateTable(table.id, {label: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600">Capaciteit</span>
                  <input type="number" min={1} max={24} value={table.capacity} onChange={(e) => updateTable(table.id, {capacity: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600">X %</span>
                  <input type="number" min={8} max={92} value={table.positionX} onChange={(e) => updateTable(table.id, {positionX: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600">Y %</span>
                  <input type="number" min={8} max={92} value={table.positionY} onChange={(e) => updateTable(table.id, {positionY: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
                </label>
                <p className="text-xs text-slate-500 sm:pb-2">{plan.guests.filter((g) => g.tableId === table.id).length} gasten</p>
                <button type="button" onClick={() => removeTable(table.id)} className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                  Verwijder
                </button>
              </div>
            ))}
          </div>
        
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Gasten ({plan.guests.length})</h2>
          <button type="button" onClick={addGuest} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            + Gast
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {plan.guests.map((guest) => (
            <div key={guest.id} className="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1.4fr_1fr_0.7fr_auto] sm:items-end">
              <label className="block text-sm">
                <span className="text-slate-600">Naam</span>
                <input value={guest.name} onChange={(e) => updateGuest(guest.id, {name: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Tafel</span>
                <select value={guest.tableId} onChange={(e) => updateGuest(guest.id, {tableId: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {tableOptions.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Stoel #</span>
                <input type="number" min={0} max={23} value={guest.seatIndex} onChange={(e) => updateGuest(guest.id, {seatIndex: Number(e.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <button type="button" onClick={() => removeGuest(guest.id)} className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                Verwijder
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Opslaan</h2>
        <p className="mt-2 text-sm text-slate-600">Stel in `.env.local` een `ADMIN_PASSWORD` in als je opslaan wilt beveiligen.</p>
        <label className="mt-4 block max-w-sm text-sm">
          <span className="text-slate-600">Beheerwachtwoord (optioneel)</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </label>
        <button
          type="button"
          onClick={savePlan}
          disabled={saving}
          className="mt-4 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400"
        >
          {saving ? 'Opslaan...' : 'Indeling opslaan'}
        </button>
      </section>
    </div>
  )
}

