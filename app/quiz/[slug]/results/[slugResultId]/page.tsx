import {  getQuizResultById } from '@/lib/api';
import ResultsDisplay from '@/app/_components/quiz-viewer/results-display';
import QRCodeGenerator from '@/app/_components/quiz-viewer/qr-code-generator';
// import { useSearchParams } from 'next/navigation';
import { QuizResultData } from '@/lib/qr-code-utils';
import Link from 'next/link';

interface QuizResultsProps {
  slug: string;
  slugResultId: string;
}

export default async function QuizResults({
  params,
}: { params: QuizResultsProps }) {
  const paramsAll = await params;
  const slug = paramsAll.slugResultId;
  const quizResult = await getQuizResultById(slug, false);

  
  const resultData: QuizResultData = {
    title: quizResult?.title || '',
    description: quizResult?.description || '',
    quizSlug: slug,
    timestamp: new Date().toISOString(),
    // score: 100,
    // totalQuestions: 100,
    // percentage: 100,
    // answers: [quiz.title],
    // passed: true,
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen py-8">
       {/* <div>quizResult: <pre>{JSON.stringify(quizResult, null, 2)}</pre></div>  
        <div>params: <pre>{JSON.stringify(paramsAll, null, 2)}</pre></div>   */}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h1>
          <p className="text-gray-600">
            Here's a summary of your performance
          </p>
          <p >{quizResult?.title}</p>
          <p className="text-gray-600">{quizResult?.description}</p>
        </div>

        {/* Results Display */}
        <ResultsDisplay />

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
