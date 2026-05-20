import {notFound} from 'next/navigation'
import {FloorPlan} from '@/components/floor-plan'
import {EventHeader} from '@/components/event-header'
import {getGuestById, getTableById, readSeatingPlan} from '@/lib/seating'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{guestId: string}>
}

export default async function GuestSeatPage({params}: Props) {
  const {guestId} = await params
  const plan = await readSeatingPlan()
  const guest = getGuestById(plan, decodeURIComponent(guestId))
  if (!guest) notFound()

  const table = getTableById(plan, guest.tableId)
  if (!table) notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <EventHeader event={plan.event} compact />
      <div className="mt-8">
        <FloorPlan plan={plan} guest={guest} table={table} />
      </div>
    </main>
  )
}
