'use client';

import { motion } from 'motion/react';
import { easeInOut } from 'framer-motion';
import React from 'react';

interface LoaderProps {
  visible?: boolean;
}

export const LoaderFour: React.FC<LoaderProps> = ({ visible = true }) => {
  if (!visible) return null;

  const transition = (x: number) => ({
    duration: 2,
    repeat: Infinity,
    repeatType: 'loop' as const,
    delay: x * 0.2,
    ease: easeInOut,
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, 20, 0] }}
          transition={transition(0)}
          className="h-4 w-4 rounded-full bg-neutral-200 shadow-md dark:bg-neutral-500"
        />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, 20, 0] }}
          transition={transition(0.4)}
          className="h-4 w-4 rounded-full bg-neutral-200 shadow-md dark:bg-neutral-500"
        />
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, 20, 0] }}
          transition={transition(0.8)}
          className="h-4 w-4 rounded-full bg-neutral-200 shadow-md dark:bg-neutral-500"
        />
      </div>
    </div>
  );
};
