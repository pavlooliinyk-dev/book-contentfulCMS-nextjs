import { create } from 'zustand';
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
  history: string[];

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
  history: [],

  init: (q: Quiz) => {
    const firstId = q.firstQuestion?.sys?.id || null;
    const hist = firstId ? [firstId] : [];
    set({ quiz: q, 
      loadedQuestions: firstId ? { [firstId]: q.firstQuestion } : {}, 
      quizQuestionId: firstId, 
      selectedAnswers: {}, 
      submitted: false, 
      score: 0, 
      currentQuestionIndex: hist.length - 1, 
      history: hist });
  },

  setQuizQuestionId: async (id: string) => {
    const { loadedQuestions, quiz } = get();
    if (!id) return;
    if (loadedQuestions[id]) {
      set((s) => ({ 
        quizQuestionId: id, 
        history: s.history.includes(id) ? s.history : [...s.history, id], 
        currentQuestionIndex: s.history.includes(id) ? s.history.indexOf(id) : s.history.length 
      }));
      return;
    }
    const fetched = await get().loadQuestionById(id);
    if (fetched) {
      set((s) => ({ loadedQuestions: { ...s.loadedQuestions, [id]: fetched }, 
        quizQuestionId: id, 
        history: s.history.includes(id) ? s.history : [...s.history, id], 
        currentQuestionIndex: s.history.includes(id) ? s.history.indexOf(id) : s.history.length }));
    } else {
      set((s) => ({ quizQuestionId: id, 
        history: s.history.includes(id) ? s.history : [...s.history, id], 
        currentQuestionIndex: s.history.includes(id) ? s.history.indexOf(id) : s.history.length }));
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
      // push current id onto history and navigate to nextId
      const st = get();
      const alreadyEmbedded = next && (next as any).title;
      if (alreadyEmbedded) {
        set((s) => ({ 
          loadedQuestions: { 
            ...s.loadedQuestions, [nextId]: next as QuizQuestionLinked 
          }, 
          quizQuestionId: nextId, 
          history: [...s.history, nextId], currentQuestionIndex: s.history.length 
        }));
        return;
      }

      // fetch via API
      const fetched = await get().loadQuestionById(nextId);
      if (fetched) {
        set((s) => ({ 
          loadedQuestions: { ...s.loadedQuestions, [nextId]: fetched }, 
          quizQuestionId: nextId, history: [...s.history, nextId], 
          currentQuestionIndex: s.history.length }));
        return;
      }

      // couldn't load -> submit
      get().submit();
    } else {
      // no next -> submit
      get().submit();
    }
  },


  previous: () => set((s) => {
    if (!s.history || s.history.length <= 1) return s; // already at first
    const newHistory = s.history.slice(0, -1);
    const newIndex = Math.max(0, newHistory.length - 1);
    const newId = newHistory[newHistory.length - 1] || null;
    return { history: newHistory, quizQuestionId: newId, currentQuestionIndex: newIndex };
  }),

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
    const resultContentId = s.quiz?.resultContentId;
    const url = `/quiz/${s.quiz?.slug}/results/${s.quiz?.resultContentId
}?answers=${encodeURIComponent(JSON.stringify(s.selectedAnswers))}`;
    // const url = `/quiz/${s.quiz?.slug}/results?score=${correctCount}&total=${total}&answers=${encodeURIComponent(JSON.stringify(s.selectedAnswers))}&resultContentId=${encodeURIComponent(resultContentId || '')}`;
    set({ score: correctCount, submitted: true });
    // navigate
    if (typeof window !== 'undefined') window.location.href = url;
  },
}));
