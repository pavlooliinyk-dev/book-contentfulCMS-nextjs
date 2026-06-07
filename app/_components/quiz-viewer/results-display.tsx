'use client';

import { Quiz, QuizAnswer, QuizQuestion } from '@/lib/types';
import { getResultStatus, formatPercentage } from '@/lib/qr-code-utils';

interface ResultsDisplayProps {
  quiz: Quiz;
  score: number;
  selectedAnswers: Record<string, string[]>;
  passingScore: number;
}

export default function ResultsDisplay({
  quiz,
  score,
  selectedAnswers,
  passingScore,
}: ResultsDisplayProps) {
  const totalQuestions = quiz.questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const status = getResultStatus(percentage, passingScore);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Score Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white mb-8">
        <div className="text-center">
          <p className="text-lg opacity-90 mb-2">Your Score</p>
          <p className="text-6xl font-bold mb-4">
            {formatPercentage(percentage)}
          </p>
          <p className="text-2xl mb-4">
            {score} out of {totalQuestions} questions correct
          </p>
          <div
            className={`inline-block px-6 py-2 rounded-full font-semibold ${status.bgColor} ${status.textColor}`}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* Answer Review */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Answer Review
        </h3>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswerIds = selectedAnswers[question.id] || [];
            const correctAnswers = question.answers.filter(
              (a) => a.isCorrect
            );
            const isCorrect = correctAnswers.every((a) =>
              userAnswerIds.includes(a.id)
            );

            return (
              <div
                key={question.id}
                className={`border-l-4 p-6 rounded-lg ${
                  isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                {/* Question */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Question {index + 1}
                  </p>
                  <h4 className="text-lg font-bold text-gray-900">
                    {question.question}
                  </h4>
                </div>

                {/* User's Answer */}
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Your Answer:
                  </p>
                  {userAnswerIds.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {userAnswerIds.map((answerId) => {
                        const answer = question.answers.find(
                          (a) => a.id === answerId
                        );
                        return (
                          <li
                            key={answerId}
                            className={
                              answer?.isCorrect
                                ? 'text-green-700'
                                : 'text-red-700'
                            }
                          >
                            {answer?.text}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-red-700 font-semibold">
                      Not answered
                    </p>
                  )}
                </div>

                {/* Correct Answer */}
                {!isCorrect && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Correct Answer:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {correctAnswers.map((answer) => (
                        <li key={answer.id} className="text-green-700">
                          {answer.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      isCorrect
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
