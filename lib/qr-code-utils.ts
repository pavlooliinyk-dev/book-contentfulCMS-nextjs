/**
 * QR Code utilities for encoding and generating quiz result data
 */

export interface QuizResultData {
  quizSlug: string;
  // score: number;
  // totalQuestions: number;
  // percentage: number;
  // answers?: Array<{
  //   questionId: string;
  //   selectedAnswerIds: string[];
  // }>;
  timestamp: string;
  // passed: boolean;
  title: string;
  description: string;
}

/**
 * Generate QR code data from quiz results
 * Encodes result information as JSON string
 */
// export function generateQuizResultQRData(
//   quizSlug: string,
//   score: number,
//   totalQuestions: number,
//   answers: Array<{ questionId: string; selectedAnswerIds: string[] }>,
//   passed: boolean
// ): string {
//   const resultData: QuizResultData = {
//     quizSlug,
//     score,
//     totalQuestions,
//     percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
//     answers,
//     timestamp: new Date().toISOString(),
//     passed,
//   };

//   return JSON.stringify(resultData);
// }

/**
 * Encode quiz result as URL parameters for shareable links
 * Returns base64 encoded URL-safe string
 */
// export function encodeQuizResultURL(resultData: QuizResultData): string {
//   const encoded = Buffer.from(JSON.stringify(resultData)).toString('base64');
//   // Make URL safe
//   return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
// }

/**
 * Decode quiz result from URL-safe base64 string
 */
// export function decodeQuizResultURL(encoded: string): QuizResultData | null {
//   try {
//     // Restore base64 padding and standard characters
//     let restored = encoded.replace(/-/g, '+').replace(/_/g, '/');
//     // Add padding if needed
//     while (restored.length % 4) {
//       restored += '=';
//     }
//     const decoded = Buffer.from(restored, 'base64').toString('utf-8');
//     return JSON.parse(decoded) as QuizResultData;
//   } catch (error) {
//     console.error('Error decoding quiz result URL:', error);
//     return null;
//   }
// }

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Get result status based on passing score
 */
export function getResultStatus(percentage: number, passingScore: number): {
  passed: boolean;
  label: string;
  bgColor: string;
  textColor: string;
} {
  const passed = percentage >= passingScore;
  return {
    passed,
    label: passed ? '✓ Passed' : '✗ Failed',
    bgColor: passed ? 'bg-green-100' : 'bg-red-100',
    textColor: passed ? 'text-green-800' : 'text-red-800',
  };
}
