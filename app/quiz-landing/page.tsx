import ParallaxHero from '@/app/_components/quiz-landing/parallax-hero';
import FeaturedQuizzes from '@/app/_components/quiz-landing/featured-quizzes';
import Link from 'next/link';

export const metadata = {
  title: 'Quiz Landing - Test Your Knowledge',
  description: 'Create engaging quizzes, challenge your friends, and generate instant results with shareable QR codes.',
};

export default function QuizLandingPage() {
  return (
    <main className="w-full">
      {/* Hero Section with Parallax */}
      <ParallaxHero />


      {/* Featured Quizzes */}
      <FeaturedQuizzes />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your Own Quiz?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Build interactive quizzes with multiple question types and share results with QR codes
          </p>
          <Link
            href={`/quiz-builder?token=${process.env.NEXT_PUBLIC_QUIZ_BUILDER_TOKEN || ''}`}
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105"
          >
            Start Creating Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Quiz Platform</h3>
              <p className="text-sm">
                Create, share, and learn with interactive quizzes
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
