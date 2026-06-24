'use client';

import { Control, Controller } from 'react-hook-form';
import type { QuizFormData } from './index';

interface AnswerEditorProps {
  control: Control<QuizFormData>;
  fieldIndex: number;
  questionIndex: number;
  onRemove: () => void;
}

export default function AnswerEditor({
  control,
  fieldIndex,
  questionIndex,
  onRemove,
}: AnswerEditorProps) {
  return (
    <div className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg">
      {/* Answer Text */}
      <div className="flex-1">
        <Controller
          name={`questions.${questionIndex}.answers.${fieldIndex}.text`}
          control={control}
          rules={{ required: 'Answer text is required' }}
          render={({ field, fieldState: { error } }) => (
            <>
              <input
                type="text"
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Answer text..."
              />
              {error && (
                <p className="text-red-600 text-xs mt-1">{error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* Correct Answer Checkbox */}
      <div className="flex items-center gap-2">
        <Controller
          name={`questions.${questionIndex}.answers.${fieldIndex}.isCorrect`}
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              {...field}
              checked={field.value || false}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
              title="Mark as correct answer"
            />
          )}
        />
        <label className="text-sm text-gray-700 whitespace-nowrap">
          Correct
        </label>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
