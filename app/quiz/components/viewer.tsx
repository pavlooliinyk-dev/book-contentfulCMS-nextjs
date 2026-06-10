'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/types';
import QuestionRenderer from '@/app/_components/quiz-viewer/question-renderer';
import ProgressBar from '@/app/_components/quiz-viewer/progress-bar';
import { useRouter } from 'next/navigation';

interface QuizViewerProps {
  quizData: Quiz | null;
}

export default function QuizViewer({ quizData }: QuizViewerProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(quizData);
  const [quizQuestionId, setQuizQuestionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            {'Quiz not found'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    // Redirect to results page
    router.push(
      `/quiz/${quiz.slug}/results?score=${score}&total=${quiz.questions.length}&answers=${encodeURIComponent(JSON.stringify(selectedAnswers))}`
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  // console.log('quiz.firstQuestion:', quiz.firstQuestion) ;

  const currentQuestion = quiz.firstQuestion;
  const currentAnswers = selectedAnswers[currentQuestion.sys.id] || [];
  // const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isLastQuestion = false; // For now, since we are only rendering the first question
  const isAnswered = currentAnswers.length > 0;
  

  const handleAnswerSelect = (answerId: string, isSelected: boolean) => {
    setSelectedAnswers((prev) => {
      const answers = prev[currentQuestion.sys.id] || [];
      if (isSelected) {
        // Single choice: replace, Multiple choice: add
        if (currentQuestion.answerType === 'single') {
          return {
            ...prev,
            [currentQuestion.sys.id]: [answerId],
          };
        } else {
          return {
            ...prev,
            [currentQuestion.sys.id]: [...answers, answerId],
          };
        }
      } else {
        return {
          ...prev,
          [currentQuestion.sys.id]: answers.filter((id) => id !== answerId),
        };
      }
    });
  };

  const handleNext = () => {
    if (!isAnswered) {
      alert('Please select an answer before proceeding');
      return;
    }
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuizQuestionId(selectedAnswers[currentQuestion.sys.id]?.[0] || null) ;
      console.log('Next question index, currentAnswers:', selectedAnswers) ;
      // get next question ID from selected answer's nextQuestion field from api
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((question) => {
      const userAnswerIds = selectedAnswers[question.id] || [];
      const correctAnswers = question.answers.filter((a) => a.isCorrect);
      const isCorrect = correctAnswers.every((a) =>
        userAnswerIds.includes(a.id)
      );
      if (isCorrect) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {quiz.title}
            </h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ProgressBar
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
          />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-2xl mx-auto py-8">
        <QuestionRenderer
          question={currentQuestion}
          selectedAnswerIds={currentAnswers}
          handleAnswerSelect={handleAnswerSelect}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center px-4 py-8 max-w-2xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <span className="text-gray-600 font-semibold">
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
