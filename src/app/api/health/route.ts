import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Простая проверка здоровья
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'telegram-bot'
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: 'Health check failed' 
    }, { status: 500 })
  }
}
