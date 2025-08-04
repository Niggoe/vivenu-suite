// Gemeinsame Typen für die Vivenu Suite

export interface TicketData {
  ticketId: string
  chipUid: string
}

export interface ApiResult {
  success: boolean
  message: string
  data?: any
  error?: string
}
