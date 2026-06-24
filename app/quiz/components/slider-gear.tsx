'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Quiz } from '@/lib/types';
import Link from 'next/link';
import { Markdown } from '@/app/_components/markdown';

interface props {
    item: Quiz;
    index: number;
    inView: boolean;
}
const itemImage = [
  {
    id: 'motorcycle',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
  },
  {
    id: 'manor',
    url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=85',
  },
  {
    id: 'pistols',
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&q=85',
  },
  {
    id: 'pendant',
    url: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=600&q=85',
  },
  
];

function SliderGearCard({ item, index, inView }: props) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current?.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative flex-shrink-0 w-60 md:w-50 cursor-pointer group"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ background: '#ffde4e' }}>
        {/* Cursor spotlight */}
        {hovered && (
          <div className="absolute inset-0 pointer-events-none z-10 transition-opacity"
            style={{ 
              background: `radial-gradient(
                160px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.18) 0%, transparent 70%
              )`
            }}
          />
        )}

        {/* Corner brackets */}
        {[['top-2 left-2 border-t-2 border-l-2'], 
          ['top-2 right-2 border-t-2 border-r-2'], 
          ['bottom-2 left-2 border-b-2 border-l-2'], 
          ['bottom-2 right-2 border-b-2 border-r-2']].map(([cls], i) => (
          <div key={i} className={`absolute w-4 h-4 border-[#ffde4e] z-20 ${cls}`} />
        ))}

        {/* Image */}
        <div className="aspect-square overflow-hidden relative">
          <motion.img
            src={itemImage[index % itemImage.length].url}
            alt={item.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#e8dcc8]/60 
            via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Card text */}
        <div className="px-5 pt-3 pb-5 text-center">
          <h3 className="font-cinzel font-bold text-[#1a1208] text-sm tracking-[0.1em] uppercase mb-1">{item.title}</h3>

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="font-cormorant text-[#5a4020] text-sm leading-snug mb-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                {item.description && <Markdown content={item.description} />}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#5a4a2a] 
              group-hover:text-[#434ee6] transition-colors duration-300">
              Learn More
            </span>
            <motion.svg viewBox="0 0 80 6" className="w-16 mt-1" fill="none">
              <motion.path
                d="M0 3 Q20 1 40 3 Q60 5 80 3"
                stroke="#434ee6" strokeWidth="1.2" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SliderGear({ quizzes }: { quizzes: Quiz[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 270, behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="relative bg-grey py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-16 mb-10 flex items-end justify-between">
        <div>
          <motion.p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#434ee6]/60 mb-3"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.8 }}>
            The Arsenal // Recovery Log
          </motion.p>
          <motion.h2
            className="font-cinzel font-black text-black text-3xl md:text-5xl uppercase tracking-[0.1em] mb-3"
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9 }}
          >
            Iconic <span className="text-[#434ee6]">Quiz</span>
          </motion.h2>
          <motion.svg viewBox="0 0 200 8" className="w-44" fill="none">
            <motion.path d="M0 4 Q50 1 100 4 Q150 7 200 4"
              stroke="#434ee6" strokeWidth="1.5" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
            />
          </motion.svg>
        </div>
        {/* Scroll controls */}
        <div className="flex gap-2">
          {[-1, 1].map(dir => (
            <button key={dir} onClick={() => scroll(dir)}
              className="w-10 h-10 border border-black/20 hover:border-[#434ee6]/60 
                hover:bg-[#434ee6]/5 flex items-center justify-center transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                {dir === -1
                  ? <path d="M8 1L3 6L8 11" stroke="black" 
                    strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M4 1L9 6L4 11" stroke="black" 
                    strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
                }
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-5 px-6 md:px-16 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {quizzes?.length > 0 && quizzes.map((quiz) => (
          <Link
            key={quiz.sys.id}
            href={`/quiz/${quiz.slug}`}
            className="group"
          >
            <SliderGearCard key={quiz.sys.id} item={quiz} index={quizzes.indexOf(quiz)} inView={inView} />
          </Link>
        ))}
      </div>
    </section>
  );
}