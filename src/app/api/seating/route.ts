import {NextResponse} from 'next/server'
import {normalizeSeatingPlan, readSeatingPlan, resolveSeatingDataSource, writeSeatingPlan} from '@/lib/seating'

export async function GET() {
  try {
    const plan = await readSeatingPlan()
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({error: 'Seating data kon niet worden geladen.'}, {status: 500})
  }
}

export async function PUT(request: Request) {
  if (resolveSeatingDataSource() === 'ivarium') {
    return NextResponse.json(
      {error: 'Seating wordt beheerd in Ivarium Labs. Bewerk via /admin/events/weddings.'},
      {status: 403},
    )
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (adminPassword) {
    const provided = request.headers.get('x-admin-password')?.trim()
    if (provided !== adminPassword) {
      return NextResponse.json({error: 'Onjuist beheerwachtwoord.'}, {status: 401})
    }
  }

  try {
    const body = await request.json()
    const plan = await writeSeatingPlan(normalizeSeatingPlan(body))
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({error: 'Seating opslaan mislukt.'}, {status: 500})
  }
}
