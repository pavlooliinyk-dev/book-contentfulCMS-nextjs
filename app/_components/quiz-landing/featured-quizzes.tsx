'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/lib/types';
import { getFeaturedQuizzes } from '@/lib/api';
import Link from 'next/link';

export default function FeaturedQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const featured = await getFeaturedQuizzes(false, 6);
        setQuizzes(featured);
      } catch (err) {
        console.error('Error fetching featured quizzes:', err);
        setError('Failed to load featured quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Quizzes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Quizzes
          </h2>
          <p className="text-lg text-gray-600">
            Try these popular quizzes and test your knowledge
          </p>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.sys.id}
                href={`/quiz/${quiz.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                  {/* Quiz Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <h3 className="text-2xl font-bold group-hover:text-blue-100 transition-colors">
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Quiz Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Description */}
                    {quiz.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {typeof quiz.description === 'string'
                          ? quiz.description
                          : 'Interactive quiz to test your knowledge'}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                     
                      <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {quiz.passingScore}% to pass
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Start Quiz →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No quizzes available yet. Check back soon!
            </p>
          </div>
        )}

        {/* Browse All Button */}
        <div className="text-center mt-12">
          <Link
            href="/quiz"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
          >
            Browse All Quizzes →
          </Link>
        </div>
      </div>
    </section>
  );
}
