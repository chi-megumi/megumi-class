import { NextResponse } from 'next/server'
import { submitTestResult } from '@/actions/analytics/exam-session'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const result = await submitTestResult(data)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
