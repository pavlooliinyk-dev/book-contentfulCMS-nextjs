import { NextResponse } from 'next/server';
import pricingData from '@/data/pricing-data.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  const pricing = pricingData.find((item) => item.bookId === bookId);

  if (!pricing) {
    // Default fallback if book not found in mock data
    return NextResponse.json({
      bookId,
      price: 10.99,
      availability: 'in stock',
    });
  }

  return NextResponse.json(pricing);
}
