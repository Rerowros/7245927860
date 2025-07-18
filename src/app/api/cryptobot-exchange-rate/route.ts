import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/cryptobot';

export async function POST(request: NextRequest) {
  try {
    const { currency } = await request.json();
    
    if (!currency) {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
    }

    const rate = await getExchangeRate(currency);
    
    if (!rate) {
      return NextResponse.json({ error: 'Failed to get exchange rate' }, { status: 500 });
    }

    return NextResponse.json({ rate });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
