export type SeatingEvent = {
  title: string
  date: string
  venue: string
  subtitle?: string
}

export type SeatingGuest = {
  id: string
  name: string
  tableId: string
  seatIndex: number
}

export type SeatingTable = {
  id: string
  label: string
  positionX: number
  positionY: number
  capacity: number
}

export type SeatingPlan = {
  event: SeatingEvent
  tables: SeatingTable[]
  guests: SeatingGuest[]
}
