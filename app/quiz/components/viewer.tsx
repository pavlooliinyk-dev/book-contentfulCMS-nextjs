'use client';

import { useEffect } from 'react';
import { Quiz, QuizQuestionLinked } from '@/lib/types';
import QuestionRenderer from '@/app/_components/quiz-viewer/question-renderer';
import ProgressBar from '@/app/_components/quiz-viewer/progress-bar';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/lib/quizStore';

interface QuizViewerProps {
  quizData: Quiz | null;
}

export default function QuizViewer({ quizData }: QuizViewerProps) {
  const router = useRouter();
  const init = useQuizStore((s) => s.init);
  const quiz = useQuizStore((s) => s.quiz);
  const quizQuestionId = useQuizStore((s) => s.quizQuestionId);
  const loadedQuestions = useQuizStore((s) => s.loadedQuestions);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const selectedAnswers = useQuizStore((s) => s.selectedAnswers);
  const submitted = useQuizStore((s) => s.submitted);
  const score = useQuizStore((s) => s.score);

  const setQuizQuestionId = useQuizStore((s) => s.setQuizQuestionId);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);
  const nextWithAnswer = useQuizStore((s) => s.nextWithAnswer);
  const previous = useQuizStore((s) => s.previous);
  const submit = useQuizStore((s) => s.submit);

  // initialize store once
  useEffect(() => {
    if (quizData) init(quizData);
  }, [quizData, init]);


  const isEmbeddedQuestion = (n: unknown): n is QuizQuestionLinked => {
    if (typeof n !== 'object' || n === null) return false;
    const obj = n as Record<string, unknown>;
    const sys = obj['sys'] as Record<string, unknown> | undefined;
    return Boolean(sys && typeof sys['id'] === 'string' && (typeof obj['title'] === 'string' || typeof obj['text'] === 'string'));
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

  // When quizQuestionId changes, ensure the node is loaded into loadedQuestions
  useEffect(() => {
    if (!quizQuestionId) return;
    setLoadedQuestions((prev) => {
      if (prev[quizQuestionId]) return prev;
      const found = findNodeById(quiz.firstQuestion, quizQuestionId);
      if (found) return { ...prev, [found.sys.id]: found };
      return prev;
    });
  }, [quizQuestionId, quiz]);

  const currentQuestion: QuizQuestionLinked | null = (() => {
    if (!quiz) return null;
    if (!quizQuestionId) return quiz.firstQuestion;
    if (quiz.firstQuestion.sys.id === quizQuestionId) return quiz.firstQuestion;
    return loadedQuestions[quizQuestionId] || quiz.firstQuestion;
  })();

  if (!currentQuestion) return null;

  const currentAnswers = selectedAnswers[currentQuestion.sys.id] || [];
  const isAnswered = currentAnswers.length > 0;

  const handleAnswerSelect = (answerId: string, isSelected: boolean) => {
    selectAnswer(currentQuestion.sys.id, answerId, isSelected);
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

  // submitted and navigation handled inside store; reflect state

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
          const res = await fetch(`/api/quizzes?slug=${encodeURIComponent(quiz.slug)}&questionId=${encodeURIComponent(nextQuestionId || '')}`);
          const data = await res.json();
          const fetchedQuestion = data?.question || null;
          const fresh: Quiz | null = data?.item || null;

          if (fetchedQuestion && fetchedQuestion.sys?.id === nextQuestionId) {
            setLoadedQuestions((prev) => ({ ...prev, [fetchedQuestion.sys.id]: fetchedQuestion }));
            setQuizQuestionId(nextQuestionId);
            setCurrentQuestionIndex((prev) => prev + 1);
            return;
          }

          if (fresh) {
            setQuiz(fresh);
            const found = findNodeById(fresh.firstQuestion, nextQuestionId);
            if (found) {
              setLoadedQuestions((prev) => ({ ...prev, [found.sys.id]: found }));
              setQuizQuestionId(nextQuestionId);
              setCurrentQuestionIndex((prev) => prev + 1);
              return;
            }
          }

          // fallback: submit
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
              onClick={() => submit()}
              disabled={!isAnswered}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => nextWithAnswer(currentAnswers[0])}
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
