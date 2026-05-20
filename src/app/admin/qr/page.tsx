import Link from 'next/link'
import {QrCodePanel} from '@/components/qr-code-panel'

export default function AdminQrPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Beheer</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">QR-code voor gasten</h1>
      <p className="mt-2 text-sm text-slate-600">
        Print of projecteer deze code bij de ingang. Gasten komen op de naamkeuze-pagina.
      </p>
      <div className="mt-8">
        <QrCodePanel />
      </div>
      <p className="mt-8 text-center">
        <Link href="/admin" className="text-sm font-semibold text-slate-600 underline-offset-2 hover:underline">
          Terug naar beheer
        </Link>
      </p>
    </main>
  )
}
