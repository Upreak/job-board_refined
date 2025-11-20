import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' : 
                toast.type === 'error' ? 'bg-white border-red-200 text-slate-800' : 
                toast.type === 'warning' ? 'bg-white border-amber-200 text-slate-800' : 
                'bg-white border-blue-200 text-slate-800'}
            `}
          >
            <div className={`
              mt-0.5 shrink-0
              ${toast.type === 'success' ? 'text-green-500' : 
                toast.type === 'error' ? 'text-red-500' : 
                toast.type === 'warning' ? 'text-amber-500' : 
                'text-blue-500'}
            `}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-sm capitalize mb-0.5
                 ${toast.type === 'success' ? 'text-green-700' : 
                   toast.type === 'error' ? 'text-red-700' : 
                   toast.type === 'warning' ? 'text-amber-700' : 
                   'text-blue-700'}
              `}>{toast.type}</h4>
              <p className="text-sm text-slate-600 font-medium leading-snug">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};