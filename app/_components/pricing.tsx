'use client';

import { useFetch } from '@/lib/hooks/useFetch';
import { useMemo } from 'react';

interface PricingData {
  bookId: string;
  price: number;
  availability: string;
}

export default function Pricing({ bookId }: { bookId: string }) {
  const pricingUrl = useMemo(() => `/api/pricing?bookId=${bookId}`, [bookId]);
  const { data: pricing, loading, error } = useFetch<PricingData>(pricingUrl);

  if (loading) {
    return <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>;
  }

  if (error) {
    // Log detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Pricing fetch error:', {
        message: error.message,
        name: error.name,
        status: 'status' in error ? error.status : undefined,
        bookId,
      });
    }
    
    return (
      <div className="text-sm text-red-600">
        Error: {error.message || 'Failed to load pricing'}
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="flex items-center gap-3 my-2">
      <span className="text-2xl font-bold text-green-700">
        ${pricing.price.toFixed(2)}
      </span>
      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
        pricing.availability === 'in stock' ? 'bg-green-100 text-green-800' :
          pricing.availability === 'out of stock' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
      }`}>
        {pricing.availability}
      </span>
    </div>
  );
}
