'use client';
import { connection } from 'next/server'
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import QuizBuilderForm from '@/app/_components/quiz-builder';
import Link from 'next/link';
import { ErrorBoundary } from '../_components/error-boundary';

export default async function QuizBuilderPage() {
  await connection()
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const validToken = process.env.NEXT_PUBLIC_QUIZ_BUILDER_TOKEN;

    if (!token || token !== validToken) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <ErrorBoundary>
            <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access the quiz builder. A valid token
            is required.
            </p>
            <div className="space-y-3">
              <Link
                href="/quiz-landing"
                className="block px-4 py-2 bg-blue-500 hover:bg-blue-600 
                  text-white font-semibold rounded-lg transition-colors"
              >
              Back to Home
              </Link>
              <Link
                href="/quiz"
                className="block px-4 py-2 bg-gray-500 hover:bg-gray-600 
                  text-white font-semibold rounded-lg transition-colors"
              >
              Browse Quizzes
              </Link>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz Builder</h1>
          <Link
            href="/quiz-landing"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Back
          </Link>
        </div>
      </div>


      <ErrorBoundary>
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <QuizBuilderForm
            onSave={async (data) => {
            // TODO: Implement Contentful mutation
              console.log('Saving quiz:', data);
              // For now, just show success
              alert('Quiz saved (feature coming soon)');
            }}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
