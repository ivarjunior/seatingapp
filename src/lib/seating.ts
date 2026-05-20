import 'server-only'

import {readFile, writeFile} from 'fs/promises'
import path from 'path'
import {fetchSeatingPlanFromIvarium, resolveSeatingDataSource} from './seating-source'
import {normalizeSeatingPlan} from './seating-shared'
import type {SeatingPlan} from './types'

export {normalizeSeatingPlan, getGuestById, getTableById, getGuestsAtTable, formatEventDate, seatPositionsAroundTable} from './seating-shared'
export {resolveSeatingDataSource, getSeatingSourceLabel} from './seating-source'

const dataPath = path.join(process.cwd(), 'data', 'seating.json')

async function readLocalSeatingPlan() {
  const raw = await readFile(dataPath, 'utf8')
  return normalizeSeatingPlan(JSON.parse(raw))
}

export async function readSeatingPlan(): Promise<SeatingPlan> {
  if (resolveSeatingDataSource() === 'ivarium') {
    try {
      return normalizeSeatingPlan(await fetchSeatingPlanFromIvarium())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ivarium seating laden mislukt.'
      console.error('[seating]', message)
      return readLocalSeatingPlan()
    }
  }
  return readLocalSeatingPlan()
}

export async function writeSeatingPlan(plan: SeatingPlan) {
  if (resolveSeatingDataSource() === 'ivarium') {
    throw new Error('Seating wordt beheerd in Ivarium Labs. Pas gasten en tafels aan via /admin/events/weddings.')
  }
  const normalized = normalizeSeatingPlan(plan)
  await writeFile(dataPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8')
  return normalized
}
