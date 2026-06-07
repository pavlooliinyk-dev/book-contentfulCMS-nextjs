'use client';

import { QuizQuestion } from '@/lib/types';
import { useState } from 'react';

interface QuestionRendererProps {
  question: QuizQuestion;
  selectedAnswerIds: string[];
  onAnswerSelect: (answerId: string, isSelected: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionRenderer({
  question,
  selectedAnswerIds,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
}: QuestionRendererProps) {
  const isSingleChoice = question.questionType === 'single';

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
        {question.question}
      </h2>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer) => {
          const isSelected = selectedAnswerIds.includes(answer.id);

          return (
            <label
              key={answer.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type={isSingleChoice ? 'radio' : 'checkbox'}
                name={`question-${question.id}`}
                value={answer.id}
                checked={isSelected}
                onChange={(e) =>
                  onAnswerSelect(answer.id, e.currentTarget.checked)
                }
                className="w-5 h-5 cursor-pointer"
              />
              <span className="ml-4 text-lg text-gray-800">
                {answer.text}
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
