import { NextResponse } from 'next/server'
import { db } from '@/db'

// Ensures Vercel treats this route dynamically rather than trying to statically render it at build time
export const dynamic = 'force-dynamic'

// 1. GET: Fetch saved estimates
export async function GET() {
  try {
    const estimates = await db.savedEstimate.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(estimates)
  } catch (error) {
    console.error('Error fetching estimates:', error)
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 })
  }
}

// 2. POST: Save a new estimate
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientName, label, data, totalCost } = body

    const savedEstimate = await db.savedEstimate.create({
      data: {
        clientName: clientName || 'Unnamed Client',
        label: label || 'New Estimate',
        data: typeof data === 'string' ? data : JSON.stringify(data),
        totalCost: totalCost || 0,
      },
    })

    return NextResponse.json(savedEstimate)
  } catch (error) {
    console.error('Error saving estimate:', error)
    return NextResponse.json({ error: 'Failed to save estimate' }, { status: 500 })
  }
}