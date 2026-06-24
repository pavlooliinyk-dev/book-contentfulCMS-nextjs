'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection({ total }: { total: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const adventureX = useTransform(scrollYProgress, [0, 0.6], ['0%', '-38%']);
  const awaitsX = useTransform(scrollYProgress, [0, 0.6], ['0%', '38%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.2]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.55, 0.82]);

  return (
    <section  id="QuizHeroSection" ref={ref} className="relative bg-[#434ee6] h-screen overflow-hidden">
      {/* Headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div style={{ opacity: textOpacity }} className="text-center px-4">
          {/* Gold line above */}
          <motion.div
            className="h-px bg-gold mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
          />

          <div className="overflow-hidden">
            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <motion.span
                className="font-cinzel font-black text-white text-5xl 
                  sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.12em] uppercase block"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ x: adventureX }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Adventure
              </motion.span>
              <motion.span
                className="font-cinzel font-black text-gold text-5xl 
                  sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.12em] uppercase block"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ x: awaitsX }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Awaits
              </motion.span>
            </motion.div>
          </div>

          {/* Subtext */}
          <motion.p
            className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-white/60 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            The Legend Lives On {total} quizzes
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
