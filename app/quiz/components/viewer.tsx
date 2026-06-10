'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizQuestionLinked } from '@/lib/types';
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

  const isEmbeddedQuestion = (n: unknown): n is QuizQuestionLinked => {
    if (typeof n !== 'object' || n === null) return false;
    const obj = n as Record<string, unknown>;
    const sys = obj['sys'] as Record<string, unknown> | undefined;
    return Boolean(sys && typeof sys['id'] === 'string' && (typeof obj['title'] === 'string' || typeof obj['text'] === 'string'));
  };

  const computeTotalFromQuiz = (q: Quiz) => {
    const visited = new Set<string>();
    const stack: QuizQuestionLinked[] = [q.firstQuestion];
    while (stack.length) {
      const node = stack.shift();
      if (!node || !node.sys?.id || visited.has(node.sys.id)) continue;
      visited.add(node.sys.id);
      const items = node.answersCollection?.items || [];
      for (const ans of items) {
        const next = ans.nextQuestion;
        if (next && isEmbeddedQuestion(next)) {
          stack.push(next);
        }
      }
    }
    return Math.max(visited.size, 1);
  };

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

  useEffect(() => {
    if (!submitted) return;
    const url = `/quiz/${quiz.slug}/results?score=${score}&total=${computeTotalFromQuiz(quiz)}&answers=${encodeURIComponent(JSON.stringify(selectedAnswers))}`;
    // Navigate after render to avoid setState during render
    router.push(url);
  }, [submitted, score, selectedAnswers, quiz?.slug]);

  if (submitted) {
    // Show loading state while navigation happens
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const [loadedQuestions, setLoadedQuestions] = useState<Record<string, QuizQuestionLinked>>(() => (quiz?.firstQuestion?.sys?.id ? { [quiz.firstQuestion.sys.id]: quiz.firstQuestion } : {}));

  useEffect(() => {
    if (quiz?.firstQuestion?.sys?.id && !loadedQuestions[quiz.firstQuestion.sys.id]) {
      setLoadedQuestions({ [quiz.firstQuestion.sys.id]: quiz.firstQuestion });
      setQuizQuestionId(quiz.firstQuestion.sys.id);
    }
  }, [quiz]);

  const findNodeById = (node: QuizQuestionLinked, id: string): QuizQuestionLinked | null => {
    if (!node) return null;
    if (node.sys?.id === id) return node;
    const items = node.answersCollection?.items || [];
    for (const ans of items) {
      const next = ans.nextQuestion;
      if (next && isEmbeddedQuestion(next)) {
        const found = findNodeById(next, id);
        if (found) return found;
      }
    }
    return null;
  };

  const currentQuestion: QuizQuestionLinked = (() => {
    if (quizQuestionId) {
      if (quiz.firstQuestion.sys.id === quizQuestionId) return quiz.firstQuestion;
      if (loadedQuestions[quizQuestionId]) return loadedQuestions[quizQuestionId];
      const found = findNodeById(quiz.firstQuestion, quizQuestionId);
      if (found) {
        // Avoid calling setState during render; just return the found node
        return found;
      }
    }
    return quiz.firstQuestion;
  })();

  const currentAnswers = selectedAnswers[currentQuestion.sys.id] || [];
  const isAnswered = currentAnswers.length > 0;

  const handleAnswerSelect = (answerId: string, isSelected: boolean) => {
    setSelectedAnswers((prev) => {
      const answers = prev[currentQuestion.sys.id] || [];
      if (isSelected) {
        if (currentQuestion.answerType === 'single') {
          return { ...prev, [currentQuestion.sys.id]: [answerId] };
        } else {
          return { ...prev, [currentQuestion.sys.id]: Array.from(new Set([...answers, answerId])) };
        }
      } else {
        return { ...prev, [currentQuestion.sys.id]: answers.filter((id) => id !== answerId) };
      }
    });
  };

  const getTotalQuestions = () => {
    const visited = new Set<string>();
    let count = 0;
    const stack: QuizQuestionLinked[] = [quiz.firstQuestion];
    while (stack.length > 0) {
      const node = stack.shift();
      if (!node || !node.sys?.id || visited.has(node.sys.id)) continue;
      visited.add(node.sys.id);
      count++;
      const items = node.answersCollection?.items || [];
      for (const ans of items) {
        const next = ans.nextQuestion;
        if (next && isEmbeddedQuestion(next)) {
          stack.push(next);
        }
      }
    }
    return Math.max(count, Object.keys(loadedQuestions).length, 1);
  };

  const totalQuestions = getTotalQuestions();

  const isLastQuestion = (() => {
    const selectedId = currentAnswers[0];
    if (!selectedId) return false;
    const answerItem = (currentQuestion.answersCollection?.items || []).find((a) => a.sys?.id === selectedId);
    if (!answerItem) return true; // if answer not found, treat as last
    const next = answerItem.nextQuestion;
    if (!next) return true;
    if (isEmbeddedQuestion(next)) return false;
    // next is a link object without embedded content
    return !(next.sys && typeof next.sys.id === 'string');
  })();

  const handleNext = async () => {
    if (!isAnswered) {
      alert('Please select an answer before proceeding');
      return;
    }

    const selectedId = currentAnswers[0];
    const answerItem = (currentQuestion.answersCollection?.items || []).find((a) => a.sys.id === selectedId);
    const next = answerItem?.nextQuestion;
    const nextQuestionId = next && 'sys' in next && typeof (next as { sys: { id: string } }).sys.id === 'string' ? (next as { sys: { id: string } }).sys.id : null;

    if (nextQuestionId) {
      // If next question object is embedded in the answer, use it
      if (next && isEmbeddedQuestion(next)) {
        setLoadedQuestions((prev) => ({ ...prev, [next.sys.id]: next }));
        setQuizQuestionId(next.sys.id);
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        try {
          const res = await fetch(`/api/quizzes?slug=${encodeURIComponent(quiz.slug)}`);
          const data = await res.json();
          const fresh: Quiz | null = data?.item || null;
          if (fresh) {
            setQuiz(fresh);
            // try to find the node in the refreshed quiz
            const found = findNodeById(fresh.firstQuestion, nextQuestionId);
            if (found) {
              setLoadedQuestions((prev) => ({ ...prev, [found.sys.id]: found }));
              setQuizQuestionId(nextQuestionId);
              setCurrentQuestionIndex((prev) => prev + 1);
              return;
            }
          }
          // If cannot find next question, submit
          handleSubmit();
        } catch (e) {
          console.error('Error loading next question:', e);
          handleSubmit();
        }
      }
    } else {
      handleSubmit();
    }
  };


  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    Object.keys(selectedAnswers).forEach((qId) => {
      const userAnswerIds = selectedAnswers[qId] || [];
      const q = loadedQuestions[qId] || findNodeById(quiz.firstQuestion, qId);
      if (!q) return;
      const answers = q.answersCollection?.items || [];
      const correctAnswers = answers.filter((a) => Boolean(a.isCorrect)).map((a) => a.sys?.id as string);
      if (correctAnswers.length === 0) return;
      const isCorrect = correctAnswers.every((id) => userAnswerIds.includes(id));
      if (isCorrect) correctCount++;
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
            totalQuestions={totalQuestions}
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
          totalQuestions={totalQuestions}
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
            {currentQuestionIndex + 1} / {totalQuestions}
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
