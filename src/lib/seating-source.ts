import type {SeatingPlan} from './types'

export type SeatingDataSource = 'local' | 'ivarium'

export function resolveSeatingDataSource(): SeatingDataSource {
  const forced = process.env.SEATING_DATA_SOURCE?.trim().toLowerCase()
  if (forced === 'local') return 'local'
  if (forced === 'ivarium') return 'ivarium'

  const apiUrl = process.env.IVARIUM_API_URL?.trim()
  const eventId = process.env.IVARIUM_SEATING_EVENT_ID?.trim()
  const token = process.env.IVARIUM_SEATING_TOKEN?.trim()
  if (apiUrl && eventId && token) return 'ivarium'
  return 'local'
}

export function getSeatingSourceLabel(source: SeatingDataSource) {
  return source === 'ivarium' ? 'Ivarium Labs (live)' : 'Lokaal bestand'
}

export async function fetchSeatingPlanFromIvarium(): Promise<SeatingPlan> {
  const apiUrl = process.env.IVARIUM_API_URL?.trim().replace(/\/$/, '')
  const eventId = process.env.IVARIUM_SEATING_EVENT_ID?.trim()
  const token = process.env.IVARIUM_SEATING_TOKEN?.trim()

  if (!apiUrl || !eventId || !token) {
    throw new Error('Ivarium-koppeling ontbreekt in .env.local (IVARIUM_API_URL, IVARIUM_SEATING_EVENT_ID, IVARIUM_SEATING_TOKEN).')
  }

  const url = new URL('/api/public/weddings/seating', apiUrl)
  url.searchParams.set('eventId', eventId)
  url.searchParams.set('token', token)

  const response = await fetch(url.toString(), {cache: 'no-store'})
  const data = (await response.json()) as SeatingPlan & {error?: string}
  if (!response.ok) {
    throw new Error(data.error || `Ivarium API fout (${response.status}).`)
  }

  return {
    event: data.event,
    tables: data.tables,
    guests: data.guests,
  }
}
