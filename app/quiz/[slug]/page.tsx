import QuizViewer from '@/app/quiz/components/viewer';
import { getQuizBySlug } from '@/lib/api';

export const metadata = {
  title: 'Take Quiz',
  description: 'Take an interactive quiz and test your knowledge',
};

export default async function QuizViewerPage({
  params,
}: {
  params: { slug: string };
}) {
  // Await the params promise
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug, false);
  return <QuizViewer quizData={quiz} />;
}
