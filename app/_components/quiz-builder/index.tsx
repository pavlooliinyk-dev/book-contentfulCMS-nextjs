'use client';

import { useForm, useFieldArray, Controller, SubmitHandler, Control } from 'react-hook-form';
import { Quiz, QuizQuestion, QuizAnswer } from '@/lib/types';
import QuestionEditor from './question-editor';
import FormActions from './form-actions';
import PreviewPanel from './preview-panel';
import { useState } from 'react';

export interface QuizFormData {
  title: string;
  slug: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizBuilderFormProps {
  initialQuiz?: Quiz;
  onSave?: (data: QuizFormData) => Promise<void>;
}

export default function QuizBuilderForm({
  initialQuiz,
  onSave,
}: QuizBuilderFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Transform initial quiz to form data format
  const getDefaultValues = (): QuizFormData => {
    if (initialQuiz) {
      return {
        title: initialQuiz.title,
        slug: initialQuiz.slug,
        description: '',
        passingScore: initialQuiz.passingScore,
        questions: initialQuiz.questions,
      };
    }
    return {
      title: '',
      slug: '',
      description: '',
      passingScore: 70,
      questions: [
        {
          id: '1',
          question: '',
          questionType: 'single',
          answers: [
            { id: 'a1', text: '', isCorrect: false },
            { id: 'a2', text: '', isCorrect: false },
          ],
          order: 1,
        },
      ],
    };
  };

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<QuizFormData>({
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  // Track changes
  const formData = watch();
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const onSubmit: SubmitHandler<QuizFormData> = async (data) => {
    if (!onSave) {
      console.error('No onSave handler provided');
      setSaveMessage('Error: No save handler');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);
      await onSave(data);
      setHasUnsavedChanges(false);
      setSaveMessage('✓ Quiz saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving quiz:', error);
      setSaveMessage('✗ Error saving quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftSave = () => {
    const draft = getValues();
    localStorage.setItem('quiz-draft', JSON.stringify(draft));
    setIsDraft(true);
    setSaveMessage('✓ Draft saved to browser');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      questionType: 'single',
      answers: [
        { id: `a-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `a-${Date.now()}-2`, text: '', isCorrect: false },
      ],
      order: fields.length + 1,
    };
    append(newQuestion);
    handleFormChange();
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} onChange={handleFormChange}>
          {/* Header Info */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {initialQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <p className="text-gray-600">
              Build an interactive quiz with multiple questions and answer types
            </p>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Basic Information
            </h3>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: {
                    value: 100,
                    message: 'Title must be 100 characters or less',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., General Knowledge Quiz"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                {...register('slug', {
                  required: 'Slug is required',
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      'Slug must be lowercase alphanumeric with hyphens only',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., general-knowledge-quiz"
              />
              {errors.slug && (
                <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>
              )}
            </div>

            {/* Passing Score */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passing Score (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('passingScore', {
                  required: 'Passing score is required',
                  min: { value: 0, message: 'Minimum is 0' },
                  max: { value: 100, message: 'Maximum is 100' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.passingScore && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.passingScore.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Brief description of the quiz..."
              />
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border-l-4 border-blue-500 pl-4 pb-4 mb-4"
                >
                  <QuestionEditor
                    control={control as Control<any>}
                    index={index}
                    onRemove={() => {
                      if (fields.length > 1) {
                        remove(index);
                        handleFormChange();
                      } else {
                        alert('You must have at least one question');
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <FormActions
            isLoading={isSaving}
            isDraft={isDraft}
            hasUnsavedChanges={hasUnsavedChanges}
            saveMessage={saveMessage}
            onSave={handleSubmit(onSubmit)}
            onDraftSave={handleDraftSave}
            onTogglePreview={() => setShowPreview(!showPreview)}
          />
        </form>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <PreviewPanel quiz={formData} className="w-80 border-l border-gray-200" />
      )}
    </div>
  );
}
