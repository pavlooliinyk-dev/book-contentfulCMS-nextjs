
// import {  useState } from 'react';
import { Quiz } from '@/lib/types';
import { getAllQuizzes } from '@/lib/api';
import Link from 'next/link';
import SliderGear from './components/slider-gear';
import HeroSection from './components/hero';

export default async function QuizIndexPage() {
  const limit = 12;
  const skip = 0;

  const { quizzes, total }: { quizzes: Quiz[]; total: number }
    = await getAllQuizzes(false, limit, skip);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <HeroSection total={total} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {quizzes.length > 0 ? (
          <SliderGear quizzes={quizzes} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">
              No quizzes available yet. Check back soon!
            </p>
            <Link
              href="/quiz-landing"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600
                text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
      {/* <div><pre>{JSON.stringify(quizzes, null, 2)}</pre></div>  */}

    </div>
  );
}
