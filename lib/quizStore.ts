import create from 'zustand';
import type { Quiz, QuizQuestionLinked } from './types';

type LoadedMap = Record<string, QuizQuestionLinked>;

interface QuizState {
  quiz: Quiz | null;
  loadedQuestions: LoadedMap;
  quizQuestionId: string | null;
  selectedAnswers: Record<string, string[]>;
  submitted: boolean;
  score: number;
  currentQuestionIndex: number;

  init: (q: Quiz) => void;
  setQuizQuestionId: (id: string) => Promise<void>;
  selectAnswer: (questionId: string, answerId: string, isSelected: boolean) => void;
  loadQuestionById: (id: string) => Promise<QuizQuestionLinked | null>;
  nextWithAnswer: (answerId: string) => Promise<void>;
  previous: () => void;
  submit: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  loadedQuestions: {},
  quizQuestionId: null,
  selectedAnswers: {},
  submitted: false,
  score: 0,
  currentQuestionIndex: 0,

  init: (q: Quiz) => {
    const firstId = q.firstQuestion?.sys?.id || null;
    set({ quiz: q, loadedQuestions: firstId ? { [firstId]: q.firstQuestion } : {}, quizQuestionId: firstId, selectedAnswers: {}, submitted: false, score: 0, currentQuestionIndex: 0 });
  },

  setQuizQuestionId: async (id: string) => {
    const { loadedQuestions, quiz } = get();
    if (!id) return;
    if (loadedQuestions[id]) {
      set({ quizQuestionId: id });
      return;
    }
    const fetched = await get().loadQuestionById(id);
    if (fetched) {
      set((s) => ({ loadedQuestions: { ...s.loadedQuestions, [id]: fetched }, quizQuestionId: id }));
    } else {
      set({ quizQuestionId: id });
    }
  },

  selectAnswer: (questionId, answerId, isSelected) => {
    set((s) => {
      const answers = s.selectedAnswers[questionId] || [];
      let next: string[];
      if (isSelected) {
        // single choice override
        const q = s.loadedQuestions[questionId] || null;
        if (q && q.answerType === 'single') next = [answerId];
        else next = Array.from(new Set([...answers, answerId]));
      } else {
        next = answers.filter((a) => a !== answerId);
      }
      return { selectedAnswers: { ...s.selectedAnswers, [questionId]: next } };
    });
  },

  loadQuestionById: async (id: string) => {
    try {
      const quiz = get().quiz;
      if (!quiz) return null;
      const res = await fetch(`/api/quizzes?slug=${encodeURIComponent(quiz.slug)}&questionId=${encodeURIComponent(id)}`);
      const data = await res.json();
      const q = data?.question || null;
      return q;
    } catch (e) {
      console.error('loadQuestionById error', e);
      return null;
    }
  },

  nextWithAnswer: async (answerId: string) => {
    const s = get();
    const qId = s.quizQuestionId;
    if (!qId) return;
    const q = s.loadedQuestions[qId] || s.quiz?.firstQuestion;
    if (!q) return;
    const answer = (q.answersCollection?.items || []).find((a) => a.sys?.id === answerId);
    const next = answer?.nextQuestion;
    const nextId = next && 'sys' in next && typeof (next as any).sys?.id === 'string' ? (next as any).sys.id : null;

    if (nextId) {
      if (next && (next as any).title) {
        // embedded
        set((st) => ({ loadedQuestions: { ...st.loadedQuestions, [nextId]: next as QuizQuestionLinked }, quizQuestionId: nextId, currentQuestionIndex: st.currentQuestionIndex + 1 }));
        return;
      }

      // fetch via API
      const fetched = await get().loadQuestionById(nextId);
      if (fetched) {
        set((st) => ({ loadedQuestions: { ...st.loadedQuestions, [nextId]: fetched }, quizQuestionId: nextId, currentQuestionIndex: st.currentQuestionIndex + 1 }));
        return;
      }

      // couldn't load -> submit
      get().submit();
    } else {
      // no next -> submit
      get().submit();
    }
  },

  previous: () => set((s) => ({ currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1) })),

  submit: () => {
    const s = get();
    let correctCount = 0;
    Object.keys(s.selectedAnswers).forEach((qId) => {
      const userAnswerIds = s.selectedAnswers[qId] || [];
      const q = s.loadedQuestions[qId] || (s.quiz && s.quiz.firstQuestion && s.quiz.firstQuestion.sys.id === qId ? s.quiz.firstQuestion : null);
      if (!q) return;
      const answers = q.answersCollection?.items || [];
      const correctAnswers = answers.filter((a) => Boolean(a.isCorrect)).map((a) => a.sys?.id as string);
      if (correctAnswers.length === 0) return;
      const isCorrect = correctAnswers.every((id) => userAnswerIds.includes(id));
      if (isCorrect) correctCount++;
    });
    const total = Math.max(Object.keys(s.loadedQuestions).length, 1);
    const url = `/quiz/${s.quiz?.slug}/results?score=${correctCount}&total=${total}&answers=${encodeURIComponent(JSON.stringify(s.selectedAnswers))}`;
    set({ score: correctCount, submitted: true });
    // navigate
    if (typeof window !== 'undefined') window.location.href = url;
  },
}));
