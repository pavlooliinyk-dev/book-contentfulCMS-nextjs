'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Parallax transforms using framer-motion (disabled if user prefers reduced motion)
  const bgOffset = useTransform(
    scrollY,
    [0, 500],
    [0, prefersReducedMotion || !isDesktop ? 0 : -250]
  );
  const midOffset = useTransform(
    scrollY,
    [0, 500],
    [0, prefersReducedMotion || !isDesktop ? 0 : -350]
  );
  const fgOffset = useTransform(
    scrollY,
    [0, 500],
    [0, prefersReducedMotion || !isDesktop ? 0 : -450]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500"
      role="banner"
    >
      {/* Background Layer - slowest */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-60"
        style={{
          y: bgOffset,
        }}
        aria-hidden="true"
      >
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2"
          aria-hidden="true"
        ></div>
      </motion.div>

      {/* Mid Layer - medium speed */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          y: midOffset,
        }}
        aria-hidden="true"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-white opacity-5 rounded-lg blur-2xl"
            aria-hidden="true"
          ></div>
          <div
            className="absolute bottom-32 right-20 w-48 h-48 bg-yellow-300 opacity-5 rounded-full blur-3xl"
            aria-hidden="true"
          ></div>
        </div>
      </motion.div>

      {/* Foreground Layer - Content */}
      <motion.section
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        style={{
          y: fgOffset,
        }}
      >
        <div className="text-center max-w-3xl z-10">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Test Your Knowledge
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 drop-shadow-md">
            Create engaging quizzes, challenge your friends, and generate instant results with shareable QR codes
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a
              href="/quiz"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all transform hover:scale-105 shadow-lg"
              aria-label="Browse and take available quizzes"
            >
              Take a Quiz
            </a>
            <a
              href={`/quiz-builder?token=${process.env.NEXT_PUBLIC_QUIZ_BUILDER_TOKEN || ''}`}
              className="px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-blue-600 transition-all transform hover:scale-105 shadow-lg"
              aria-label="Create a new quiz"
            >
              Create Quiz
            </a>
          </div>
        </div>
      </motion.section>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        animate={prefersReducedMotion ? { y: 0 } : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center text-white">
          <p className="text-sm font-semibold mb-2">Scroll to explore</p>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
