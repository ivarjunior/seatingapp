import {formatEventDate} from '@/lib/seating-shared'
import type {SeatingEvent} from '@/lib/types'

type Props = {
  event: SeatingEvent
  compact?: boolean
}

export function EventHeader({event, compact = false}: Props) {
  const dateLabel = formatEventDate(event.date)

  return (
    <header className={compact ? 'text-center' : 'text-center sm:text-left'}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Ivarium seating</p>
      <h1 className={`mt-2 font-semibold text-slate-950 ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>{event.title}</h1>
      {event.subtitle ? <p className="mt-2 text-sm text-slate-600">{event.subtitle}</p> : null}
      {(dateLabel || event.venue) && !compact ? (
        <p className="mt-3 text-sm text-slate-500">
          {[dateLabel, event.venue].filter(Boolean).join(' · ')}
        </p>
      ) : null}
    </header>
  )
}
