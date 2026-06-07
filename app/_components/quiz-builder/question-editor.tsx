'use client';

import { Control, Controller, useFieldArray } from 'react-hook-form';
import { QuizQuestion } from '@/lib/types';
import AnswerEditor from './answer-editor';

interface QuestionEditorProps {
  control: Control<any>;
  index: number;
  onRemove: () => void;
}

export default function QuestionEditor({
  control,
  index,
  onRemove,
}: QuestionEditorProps) {
  const { fields: answerFields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.answers`,
  });

  const isSingleChoice = (watch?: any) => {
    // We need to watch the questionType
    return true; // This will be controlled by the form
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-bold text-gray-900">
          Question {index + 1}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question *
        </label>
        <Controller
          name={`questions.${index}.question`}
          control={control}
          rules={{ required: 'Question is required' }}
          render={({ field, fieldState: { error } }) => (
            <>
              <input
                type="text"
                {...field}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your question..."
              />
              {error && (
                <p className="text-red-600 text-sm mt-1">{error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* Question Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Answer Type *
        </label>
        <Controller
          name={`questions.${index}.questionType`}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Single Choice (Radio)</option>
              <option value="multiple">Multiple Choice (Checkboxes)</option>
            </select>
          )}
        />
      </div>

      {/* Answers */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-semibold text-gray-800">Answers</h5>
          <button
            type="button"
            onClick={() =>
              append({
                id: `a-${Date.now()}`,
                text: '',
                isCorrect: false,
              })
            }
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
          >
            + Add Answer
          </button>
        </div>

        <div className="space-y-2">
          {answerFields.map((field, answerIndex) => (
            <AnswerEditor
              key={field.id}
              control={control}
              fieldIndex={answerIndex}
              questionIndex={index}
              onRemove={() => {
                if (answerFields.length > 1) {
                  remove(answerIndex);
                } else {
                  alert('You must have at least one answer');
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
