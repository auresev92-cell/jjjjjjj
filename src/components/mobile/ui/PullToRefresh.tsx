import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'motion/react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative h-full ${className}`}
      onPanEnd={handleDragEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isRefreshing ? 1 : 0 }}
      >
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </motion.div>
      {children}
    </motion.div>
  );
}
