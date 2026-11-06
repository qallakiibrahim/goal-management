/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global trigger support for non-component calls
let globalToastFn: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = (message: string, type: ToastType = 'info', duration: number = 3500) => {
  if (globalToastFn) {
    globalToastFn(message, type, duration);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Connect to global helper
  React.useEffect(() => {
    globalToastFn = showToast;
    return () => {
      globalToastFn = null;
    };
  }, [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0" />;
    }
  };

  const getToastBorder = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/60 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/60 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
      case 'info':
      default:
        return 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-100';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex items-center justify-between gap-3 text-xs font-medium ${getToastBorder(
                t.type
              )}`}
            >
              <div className="flex items-center gap-2.5 text-left">
                {getToastIcon(t.type)}
                <span className="leading-snug">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition cursor-pointer shrink-0 opacity-70 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: toast
    };
  }
  return context;
}
