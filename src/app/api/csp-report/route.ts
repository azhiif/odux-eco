import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    
    // Log CSP violations for debugging (optional)
    console.log('CSP Violation Report:', JSON.stringify(report, null, 2))
    
    // Return 204 No Content - we received the report but don't need to respond
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return new NextResponse(null, { status: 204 })
  }
}
