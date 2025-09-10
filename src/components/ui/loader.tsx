'use client';
import { motion } from 'motion/react';
import React from 'react';

export const LoaderFour = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      {/* Animated Loader */}
      <div className="relative font-bold text-white text-2xl md:text-3xl">
        <motion.span
          animate={{
            skewY: [0, -40, 0],
            scaleX: [1, 2, 1],
          }}
          transition={{
            duration: 0.05,
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 2,
            ease: 'linear',
            times: [0, 0.2, 0.5, 0.8, 1],
          }}
          className="relative z-20 inline-block"
        >
          {text}
        </motion.span>

        {/* Green glow */}
        <motion.span
          className="absolute inset-0 text-[#00e571]/50 blur-[0.5px]"
          animate={{
            x: [-2, 4, -3, 1.5, -2],
            y: [-2, 4, -3, 1.5, -2],
            opacity: [0.3, 0.9, 0.4, 0.8, 0.3],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
            times: [0, 0.2, 0.5, 0.8, 1],
          }}
        >
          {text}
        </motion.span>

        {/* Purple glow */}
        <motion.span
          className="absolute inset-0 text-[#8b00ff]/50"
          animate={{
            x: [0, 1, -1.5, 1.5, -1, 0],
            y: [0, -1, 1.5, -0.5, 0],
            opacity: [0.4, 0.8, 0.3, 0.9, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
            times: [0, 0.3, 0.6, 0.8, 1],
          }}
        >
          {text}
        </motion.span>
      </div>
    </div>
  );
};
