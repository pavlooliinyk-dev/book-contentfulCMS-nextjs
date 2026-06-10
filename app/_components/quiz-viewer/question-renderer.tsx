'use client';

import { QuizQuestion, QuizQuestionLinked } from '@/lib/types';
import { useState } from 'react';

interface QuestionRendererProps {
  question: QuizQuestionLinked;
  selectedAnswerIds: string[];
  handleAnswerSelect: (answerId: string, isSelected: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionRenderer({
  question,
  selectedAnswerIds,
  handleAnswerSelect,
  questionNumber,
  totalQuestions,
}: QuestionRendererProps) {
  const isSingleChoice = question.answerType === 'single';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Question Number */}
      <div className="mb-6">
        <span className="text-sm font-semibold text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {question.text}
      </h2>

      {/* Answers */}
      <div className="space-y-3">
        {question.answersCollection.items.map((answer) => {
          const isSelected = selectedAnswerIds.includes(answer.sys.id);

          return (
            <label
              key={answer.sys.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type={isSingleChoice ? 'radio' : 'checkbox'}
                name={`question-${question.sys.id}`}
                value={answer.text}
                checked={isSelected}
                onChange={(e) =>
                  handleAnswerSelect(answer.sys.id, e.currentTarget.checked)
                }
                className="w-5 h-5 cursor-pointer"
              />
              <span className="ml-4 text-lg text-gray-800">
                {answer.text} - {answer.sys.id}
              </span>
            </label>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="mt-8 text-sm text-gray-500">
        {isSingleChoice
          ? 'Select one answer'
          : 'Select one or more answers'}
      </p>
    </div>
  );
}
