import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Drawer({ open, onOpenChange, children, title, description }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onOpenChange(false);
              }
            }}
            className="relative z-10 w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />

            {(title || description) && (
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <div>
                  {title && <h3 className="font-black text-lg text-gray-900 tracking-tight">{title}</h3>}
                  {description && <p className="text-xs text-gray-500 font-medium">{description}</p>}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
