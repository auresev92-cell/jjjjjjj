import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  className,
  children,
}: {
  value?: string;
  onValueChange?: (val: string) => void;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '');

  const currentValue = value !== undefined ? value : activeTab;
  const handleValueChange = (val: string) => {
    if (value === undefined) {
      setActiveTab(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-2xl bg-gray-100 p-1 text-gray-500 w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  badge,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'relative inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition-all focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isSelected ? 'text-black shadow-xs font-black' : 'text-gray-500 hover:text-gray-800',
        className
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute inset-0 rounded-xl bg-white shadow-xs"
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {children}
        {badge}
      </span>
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-3 focus:outline-hidden', className)}
    >
      {children}
    </motion.div>
  );
}
