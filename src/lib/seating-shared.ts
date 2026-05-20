import type {SeatingGuest, SeatingPlan, SeatingTable} from './types'

function clampPosition(value: number) {
  return Math.min(92, Math.max(8, Math.round(value)))
}

function normalizeGuest(input: unknown, index: number): SeatingGuest | null {
  if (!input || typeof input !== 'object') return null
  const row = input as Record<string, unknown>
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  const tableId = typeof row.tableId === 'string' ? row.tableId.trim() : ''
  if (!name || !tableId) return null
  const seatIndex = Math.max(0, Math.min(23, Math.round(Number(row.seatIndex) || 0)))
  const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : `guest-${index + 1}`
  return {id, name, tableId, seatIndex}
}

function normalizeTable(input: unknown, index: number): SeatingTable | null {
  if (!input || typeof input !== 'object') return null
  const row = input as Record<string, unknown>
  const label = typeof row.label === 'string' ? row.label.trim() : ''
  if (!label) return null
  const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : `table-${index + 1}`
  const capacity = Math.max(1, Math.min(24, Math.round(Number(row.capacity) || 8)))
  const positionX = clampPosition(Number(row.positionX) || 20 + (index % 4) * 20)
  const positionY = clampPosition(Number(row.positionY) || 25 + Math.floor(index / 4) * 22)
  return {id, label, positionX, positionY, capacity}
}

export function normalizeSeatingPlan(input: unknown): SeatingPlan {
  const fallback: SeatingPlan = {
    event: {title: 'Evenement', date: '', venue: ''},
    tables: [],
    guests: [],
  }
  if (!input || typeof input !== 'object') return fallback
  const row = input as Record<string, unknown>
  const eventRow = row.event && typeof row.event === 'object' ? (row.event as Record<string, unknown>) : {}
  const tables = Array.isArray(row.tables)
    ? row.tables.map(normalizeTable).filter((table): table is SeatingTable => Boolean(table))
    : []
  const guests = Array.isArray(row.guests)
    ? row.guests.map(normalizeGuest).filter((guest): guest is SeatingGuest => Boolean(guest))
    : []

  return {
    event: {
      title: typeof eventRow.title === 'string' ? eventRow.title.trim() : fallback.event.title,
      date: typeof eventRow.date === 'string' ? eventRow.date.trim() : '',
      venue: typeof eventRow.venue === 'string' ? eventRow.venue.trim() : '',
      subtitle: typeof eventRow.subtitle === 'string' ? eventRow.subtitle.trim() : undefined,
    },
    tables,
    guests: guests.sort((left, right) => left.name.localeCompare(right.name, 'nl')),
  }
}

export function getGuestById(plan: SeatingPlan, guestId: string) {
  return plan.guests.find((guest) => guest.id === guestId) || null
}

export function getTableById(plan: SeatingPlan, tableId: string) {
  return plan.tables.find((table) => table.id === tableId) || null
}

export function getGuestsAtTable(plan: SeatingPlan, tableId: string) {
  return plan.guests.filter((guest) => guest.tableId === tableId)
}

export function formatEventDate(value: string) {
  if (!value.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('nl-NL', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}).format(parsed)
}

export function seatPositionsAroundTable(capacity: number) {
  const count = Math.max(1, Math.min(24, capacity))
  const radius = 42
  return Array.from({length: count}, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2
    return {
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius,
    }
  })
}
