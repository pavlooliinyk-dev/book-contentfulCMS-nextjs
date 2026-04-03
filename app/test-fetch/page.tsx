'use client';

import { useFetch } from '@/lib/hooks/useFetch';
import { useState } from 'react';

function TestFetchComponent({ id }: { id: string }) {
  const { data, loading, error } = useFetch(`/api/pricing?bookId=${id}`);
  
  return (
    <div className="p-4 border rounded mb-2">
      <strong>ID: {id}</strong>
      {loading && <span className="ml-2 text-blue-600">Loading...</span>}
      {error && <span className="ml-2 text-red-600">Error: {error.message}</span>}
      {data && <span className="ml-2 text-green-600">Success: ${data.price}</span>}
    </div>
  );
}

export default function TestFetchPage() {
  const [showComponents, setShowComponents] = useState(false);
  
  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="text-4xl font-bold mb-8">Test Fetch Hook</h1>
      
      <div className="mb-8">
        <button 
          onClick={() => setShowComponents(!showComponents)}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          {showComponents ? 'Hide' : 'Show'} Components
        </button>
      </div>
      
      <div className="mb-4 p-4 bg-yellow-100 rounded">
        <p className="font-semibold">Instructions:</p>
        <ol className="list-decimal ml-5 mt-2">
          <li>Open DevTools Network tab</li>
          <li>Click "Show Components" button</li>
          <li>Check if each API call happens ONCE (not twice)</li>
        </ol>
      </div>
      
      {showComponents && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Fetch Components:</h2>
          <TestFetchComponent id="dune" />
          <TestFetchComponent id="the-hobbit" />
          <TestFetchComponent id="sapiens" />
          <TestFetchComponent id="1984" />
        </div>
      )}
    </div>
  );
}
