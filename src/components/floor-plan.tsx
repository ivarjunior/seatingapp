'use client'

import Link from 'next/link'
import {getGuestsAtTable, seatPositionsAroundTable} from '@/lib/seating-shared'
import type {SeatingGuest, SeatingPlan, SeatingTable} from '@/lib/types'

type Props = {
  plan: SeatingPlan
  guest: SeatingGuest
  table: SeatingTable
}

export function FloorPlan({plan, guest, table}: Props) {
  const tableGuests = getGuestsAtTable(plan, guest.tableId)
  const seatPositions = seatPositionsAroundTable(table.capacity)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Jouw plek</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{guest.name}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Je zit aan <span className="font-semibold text-slate-900">{table.label}</span>
              {guest.seatIndex >= 0 ? ` · stoel ${guest.seatIndex + 1}` : null}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Andere naam
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Zaaloverzicht</p>
            
              <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_center,_rgba(20,184,166,0.08),_transparent_55%),linear-gradient(180deg,_#f8fafc,_#f1f5f9)]">
                <div className="absolute inset-x-0 top-5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Podium / ceremonie
                </div>
                {plan.tables.map((candidate) => {
                  const isActive = candidate.id === table.id
                  return (
                    <div
                      key={candidate.id}
                      className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border text-center shadow-sm transition sm:h-20 sm:w-20 ${
                        isActive
                          ? 'z-10 border-teal-700 bg-teal-700 text-white shadow-lg ring-4 ring-teal-200'
                          : 'border-slate-300 bg-white/95 text-slate-800'
                      }`}
                      style={{left: `${candidate.positionX}%`, top: `${candidate.positionY}%`}}
                    >
                      <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.06em] sm:text-[11px]">{candidate.label}</span>
                      {isActive ? <span className="mt-0.5 text-[10px] text-teal-100">jij</span> : null}
                    </div>
                  )
                })}
              </div>
            
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Jouw tafel</p>
            <div className="relative mt-3 aspect-square overflow-hidden rounded-[28px] border border-teal-200 bg-teal-50/40">
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-teal-700 bg-white text-center shadow-md">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-teal-800">{table.label}</span>
                <span className="mt-1 text-[11px] text-slate-500">
                  {tableGuests.length}/{table.capacity}
                </span>
              </div>
              {seatPositions.map((position, index) => {
                const occupant = tableGuests.find((row) => row.seatIndex === index)
                const isYou = guest.seatIndex === index
                return (
                  <div
                    key={`${table.id}-seat-${index}`}
                    title={occupant?.name || `Stoel ${index + 1}`}
                    className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[10px] font-semibold shadow-sm ${
                      isYou
                        ? 'z-10 border-teal-700 bg-teal-700 text-white ring-4 ring-teal-200'
                        : occupant
                          ? 'border-slate-300 bg-white text-slate-700'
                          : 'border-dashed border-slate-300 bg-white/70 text-slate-400'
                    }`}
                    style={{left: `${position.left}%`, top: `${position.top}%`}}
                  >
                    {isYou ? 'JIJ' : occupant ? occupant.name.split(' ')[0].slice(0, 3) : index + 1}
                  </div>
                )
              })}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {tableGuests.map((row) => (
                <li key={row.id} className={row.id === guest.id ? 'font-semibold text-teal-800' : ''}>
                  {row.name}
                  {row.id === guest.id ? ' · jouw stoel' : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    
  )
}

