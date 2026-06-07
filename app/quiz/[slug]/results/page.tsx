'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/lib/types';
import { getQuizBySlug } from '@/lib/api';
import ResultsDisplay from '@/app/_components/quiz-viewer/results-display';
import QRCodeGenerator from '@/app/_components/quiz-viewer/qr-code-generator';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQuizResultQRData, QuizResultData } from '@/lib/qr-code-utils';
import Link from 'next/link';

interface QuizResultsProps {
  slug: string;
}

export default function QuizResults({ slug }: QuizResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const answersStr = searchParams.get('answers');

  let selectedAnswers: Record<string, string[]> = {};
  if (answersStr) {
    try {
      selectedAnswers = JSON.parse(decodeURIComponent(answersStr));
    } catch (e) {
      console.error('Error parsing answers:', e);
    }
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const fetchedQuiz = await getQuizBySlug(slug, false);
        if (!fetchedQuiz) {
          setError('Quiz not found');
          return;
        }
        setQuiz(fetchedQuiz);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error || 'Results not found'}
          </p>
          <Link
            href="/quiz"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Generate QR data
  const answers = quiz.questions.map((q) => ({
    questionId: q.id,
    selectedAnswerIds: selectedAnswers[q.id] || [],
  }));
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= quiz.passingScore;

  const resultData: QuizResultData = {
    quizSlug: slug,
    score,
    totalQuestions: total,
    percentage,
    answers,
    timestamp: new Date().toISOString(),
    passed,
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h1>
          <p className="text-gray-600">
            Here's a summary of your performance
          </p>
        </div>

        {/* Results Display */}
        <ResultsDisplay
          quiz={quiz}
          score={score}
          selectedAnswers={selectedAnswers}
          passingScore={quiz.passingScore}
        />

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <QRCodeGenerator resultData={resultData} />
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <Link
            href={`/quiz/${slug}`}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition-colors"
          >
            Retake Quiz
          </Link>
          <Link
            href="/quiz"
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg text-center transition-colors"
          >
            Browse More Quizzes
          </Link>
          <Link
            href="/quiz-landing"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg text-center transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
