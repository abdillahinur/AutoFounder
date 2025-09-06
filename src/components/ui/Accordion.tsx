import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  isOpen: boolean;
  toggle: () => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ children, className = '' }: AccordionItemProps) {
  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function AccordionTrigger({ children, className = '' }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionTrigger must be used within an Accordion');
  }

  const { isOpen, toggle } = context;

  return (
    <button
      onClick={toggle}
      className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${className}`}
      aria-expanded={isOpen}
    >
      <span className="font-medium text-gray-900">{children}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </motion.div>
    </button>
  );
}

export function AccordionContent({ children, className = '' }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionContent must be used within an Accordion');
  }

  const { isOpen } = context;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className={`p-4 pt-0 ${className}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom hook to manage accordion state
export function useAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, toggle };
}
