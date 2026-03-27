'use client';

import { useEffect, useState } from 'react';

interface PricingData {
  bookId: string;
  price: number;
  availability: string;
}

export default function Pricing({ bookId }: { bookId: string }) {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pricing?bookId=${bookId}`)
      .then((res) => res.json())
      .then((data) => {
        setPricing(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching pricing:', err);
        setLoading(false);
      });
  }, [bookId]);

  if (loading) {
    return <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>;
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
