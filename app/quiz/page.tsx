
// import {  useState } from 'react';
import { Quiz } from '@/lib/types';
import { getAllQuizzes } from '@/lib/api';
import Link from 'next/link';

export default async function QuizIndexPage() {
  // const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [skip, setSkip] = useState(0);
  // const [total, setTotal] = useState(0);

  const limit = 12;
  const skip = 0;

  const setSkip=( number: number )=>{
    console.log('setSkip called, move to client compomnent for pagination', number);
  }

   const { quizzes, total }: { quizzes: Quiz[]; total: number }
    = await getAllQuizzes(false, limit, skip);

  // useEffect(() => {
  //   const fetchQuizzes = async () => {
  //     try {
  //       setLoading(true);

  //       // todo: fix getAllQuizzes - it works in server component only
  //       const { quizzes: fetchedQuizzes, total: totalCount } = await getAllQuizzes(
  //         false,
  //         limit,
  //         skip
  //       );
  //       setQuizzes(fetchedQuizzes);
  //       setTotal(totalCount);
  //     } catch (err) {
  //       console.error('Error fetching quizzes:', err);
  //       setError('Failed to load quizzes');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuizzes();
  // }, [skip]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  //         <p>Loading quizzes...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <p className="text-red-600 font-semibold mb-4">{error}</p>
  //         <Link
  //           href="/quiz-landing"
  //           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Back to Home
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Quizzes</h1>
          <p className="text-lg opacity-90">
            Choose from {total} available quizzes
          </p>
        </div>
      </div>

      <div><pre>{JSON.stringify(quizzes, null, 2)}</pre></div> 

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {quizzes.length > 0 ? (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.sys.id}
                  href={`/quiz/${quiz.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                    {/* Quiz Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                      <h3 className="text-2xl font-bold group-hover:text-blue-100 transition-colors">
                        {quiz.title}
                      </h3>
                    </div>

                    {/* Quiz Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Description */}
                      {quiz.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {typeof quiz.description === 'string'
                            ? quiz.description
                            : 'Interactive quiz to test your knowledge'}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            📝{' '}
                            {Array.isArray(quiz.questions)
                              ? quiz.questions.length
                              : 0}{' '}
                            questions
                          </span>
                        </div>
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {quiz.passingScore}% to pass
                        </span>
                      </div>

                      {/* CTA */}
                      {/* <button
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Start Quiz clicked for:', quiz.slug);
                        }}
                      >
                        Start Quiz →
                      </button> */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {/* {total > limit && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip === 0}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-gray-600 font-semibold">
                  {skip + 1} - {Math.min(skip + limit, total)} of {total}
                </span>
                <button
                  onClick={() => {
                    if (skip + limit < total) {
                      setSkip(skip + limit);
                    }
                  }}
                  disabled={skip + limit >= total}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )} */}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">
              No quizzes available yet. Check back soon!
            </p>
            <Link
              href="/quiz-landing"
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
