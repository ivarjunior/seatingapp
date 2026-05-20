import {GuestPicker} from '@/components/guest-picker'
import {EventHeader} from '@/components/event-header'
import {readSeatingPlan} from '@/lib/seating'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const plan = await readSeatingPlan()

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-10">
      <EventHeader event={plan.event} />
      <GuestPicker guests={plan.guests} />
      <p className="mt-8 text-center text-xs text-slate-400">
        Scan de QR-code bij de ingang of kies je naam hierboven.
      </p>
      <p className="mt-3 text-center">
        <Link href="/admin" className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
          Beheer
        </Link>
      </p>
    </main>
  )
}
