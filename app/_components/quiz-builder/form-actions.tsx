'use client';

interface FormActionsProps {
  isLoading: boolean;
  isDraft: boolean;
  hasUnsavedChanges: boolean;
  saveMessage: string | null;
  onSave: () => void;
  onDraftSave: () => void;
  onTogglePreview: () => void;
}

export default function FormActions({
  isLoading,
  isDraft,
  hasUnsavedChanges,
  saveMessage,
  onSave,
  onDraftSave,
  onTogglePreview,
}: FormActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-0">
      {/* Messages */}
      {saveMessage && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
            saveMessage.includes('✓')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
          ⚠️ You have unsaved changes
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white
            font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading && <span className="animate-spin">⏳</span>}
          {isLoading ? 'Saving...' : 'Save Quiz'}
        </button>

        <button
          type="button"
          onClick={onDraftSave}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold 
            rounded-lg transition-colors flex items-center gap-2"
        >
          💾 Save Draft
        </button>

        <button
          type="button"
          onClick={onTogglePreview}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
            text-white font-semibold rounded-lg transition-colors"
        >
          👁️ Toggle Preview
        </button>

        <button
          type="button"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 
            text-white font-semibold rounded-lg transition-colors ml-auto"
        >
          ✕ Cancel
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 mt-4">
        📝 Draft saves to your browser. Click &quot;Save Quiz&quot; to publish to Contentful.
      </p>
    </div>
  );
}
