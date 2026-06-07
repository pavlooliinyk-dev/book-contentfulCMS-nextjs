'use client';

import { Quiz } from '@/lib/types';

interface PreviewPanelProps {
  quiz: any;
  className?: string;
}

export default function PreviewPanel({ quiz, className }: PreviewPanelProps) {
  return (
    <div
      className={`flex-none bg-gray-100 p-6 overflow-y-auto ${className || ''}`}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Quiz Title
          </p>
          <h4 className="text-lg font-bold text-gray-900 truncate">
            {quiz.title || 'Untitled Quiz'}
          </h4>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Slug</p>
          <p className="text-sm text-gray-700 truncate">
            {quiz.slug || 'quiz-slug'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Passing Score
          </p>
          <p className="text-sm font-semibold text-blue-600">
            {quiz.passingScore || 70}%
          </p>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-bold text-gray-900">Questions</h5>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {quiz.questions?.length || 0}
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((q: any, idx: number) => (
              <div
                key={idx}
                className="text-xs border-l-2 border-blue-300 pl-2 py-1"
              >
                <p className="font-semibold text-gray-800 line-clamp-2">
                  {q.question || `Question ${idx + 1}`}
                </p>
                <div className="flex gap-1 mt-1">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                    {q.questionType === 'single' ? 'Single' : 'Multiple'}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                    {q.answers?.length || 0} answers
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No questions added yet</p>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Preview Tip:</p>
        <p>This shows how your quiz metadata will appear to users.</p>
      </div>
    </div>
  );
}
