import Link from 'next/link'
import {AdminSeatingEditor} from '@/components/admin-seating-editor'
import {readSeatingPlan, resolveSeatingDataSource, getSeatingSourceLabel} from '@/lib/seating'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const source = resolveSeatingDataSource()
  const plan = await readSeatingPlan()
  const ivariumAdminUrl = process.env.IVARIUM_ADMIN_SEATING_URL?.trim()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Beheer</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Seating beheren</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Gegevensbron: <span className="font-semibold text-slate-900">{getSeatingSourceLabel(source)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/qr" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              QR-code
            </Link>
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Gasten-app
            </Link>
          </div>
        </div>
      

      {source === 'ivarium' ? (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm text-teal-900">
          <p className="font-semibold">Gekoppeld aan Ivarium Labs</p>
          <p className="mt-1">
            Gasten en tafelindeling komen live uit je bruiloft in ivariumlabs. Bewerk seating in de wedding cockpit; gasten zien wijzigingen na verversen.
          </p>
          {ivariumAdminUrl ? (
            <a href={ivariumAdminUrl} className="mt-3 inline-flex rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800">
              Open seating in Ivarium Labs
            </a>
          ) : null}
        </div>
      ) : null}

      
        <div className="mt-8">
          {source === 'ivarium' ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{plan.guests.length}</span> ingedeelde gasten ·{' '}
                <span className="font-semibold text-slate-900">{plan.tables.length}</span> tafels
              </p>
              <p className="mt-2">Lokaal bewerken is uitgeschakeld zolang de Ivarium-koppeling actief is.</p>
            </div>
          ) : (
            <AdminSeatingEditor initialPlan={plan} />
          )}
        </div>
      
    </main>
  )
}

