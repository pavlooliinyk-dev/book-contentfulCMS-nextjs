"use client";

import { useFetch } from "@/lib/hooks/useFetch";

interface UsageData {
  totalApiCalls: number;
  quota: number;
  period: string;
  breakdown?: {
    cda?: number;
    cpa?: number;
    cma?: number;
    graphql?: number;
  };
}

export default function ContentfulApiUsage() {
  const { data: usage, loading, error } = useFetch<UsageData>("/api/usage");

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Usage Data</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
        <p className="text-red-500 text-xs mt-2">
          Make sure CONTENTFUL_MANAGEMENT_TOKEN is set in your environment variables.
        </p>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const percentageUsed = ((usage.totalApiCalls / usage.quota) * 100).toFixed(1);
  const isHighUsage = parseFloat(percentageUsed) > 80;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total API Requests</h3>
        <p className="text-4xl font-bold text-gray-900">{usage.totalApiCalls.toLocaleString()}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {usage.totalApiCalls.toLocaleString()} / {usage.quota.toLocaleString()} per month
          </span>
          <span className={`text-sm font-medium ${isHighUsage ? 'text-red-600' : 'text-gray-700'}`}>
            {percentageUsed}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              isHighUsage ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(parseFloat(percentageUsed), 100)}%` }}
          ></div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Total API calls made this month from a {(usage.quota / 1000).toLocaleString()}K /month quota. 
        This includes CMA, CDA, CPA, and GraphQL requests.
      </p>

      {usage.breakdown && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Breakdown by API type:</p>
          <div className="grid grid-cols-2 gap-2">
            {(usage.breakdown.cda ?? 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">CDA (Content Delivery):</span>
                <span className="font-medium">{(usage.breakdown.cda ?? 0).toLocaleString()}</span>
              </div>
            )}
            {(usage.breakdown.cpa ?? 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">CPA (Preview):</span>
                <span className="font-medium">{(usage.breakdown.cpa ?? 0).toLocaleString()}</span>
              </div>
            )}
            {(usage.breakdown.cma ?? 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">CMA (Management):</span>
                <span className="font-medium">{(usage.breakdown.cma ?? 0).toLocaleString()}</span>
              </div>
            )}
            {(usage.breakdown.graphql ?? 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">GraphQL:</span>
                <span className="font-medium">{(usage.breakdown.graphql ?? 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">Period: {usage.period}</p>
      </div>
    </div>
  );
}
