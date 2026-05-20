'use client'

import {useEffect, useState} from 'react'
import QRCode from 'qrcode'

export function QrCodePanel() {
  const [dataUrl, setDataUrl] = useState('')
  const [appUrl, setAppUrl] = useState('')

  useEffect(() => {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = configured || origin || 'http://localhost:3010'
    setAppUrl(url)
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {dark: '#0f172a', light: '#ffffff'},
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [])

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR-code naar seating app" className="mx-auto h-auto w-64 max-w-full" />
      ) : (
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">QR laden...</div>
      )}
      <p className="mt-4 break-all text-sm text-slate-600">{appUrl}</p>
      <p className="mt-2 text-xs text-slate-400">Zet `NEXT_PUBLIC_APP_URL` in `.env.local` als je een vaste productie-URL wilt.</p>
    </div>
  )
}
