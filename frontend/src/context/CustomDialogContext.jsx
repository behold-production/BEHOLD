import React, { createContext, useState, useContext } from 'react';
import { AlertCircle, HelpCircle, Info, CheckCircle2, X } from 'lucide-react';

const CustomDialogContext = createContext(null);

export const useCustomDialog = () => {
  const context = useContext(CustomDialogContext);
  if (!context) {
    throw new Error('useCustomDialog must be used within a CustomDialogProvider');
  }
  return context;
};

export const CustomDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm' | 'prompt'
    title: '',
    message: '',
    defaultValue: '',
    placeholder: '',
    isTextarea: false,
    resolve: null,
  });

  const [inputValue, setInputValue] = useState('');

  const showAlert = (message, title = 'Notification') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        defaultValue: '',
        placeholder: '',
        resolve,
      });
    });
  };

  const showConfirm = (message, title = 'Are you sure?') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        defaultValue: '',
        placeholder: '',
        resolve,
      });
    });
  };

  const showPrompt = (message, defaultValue = '', title = 'Input Required', placeholder = '', isTextarea = false) => {
    setInputValue(defaultValue);
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder,
        isTextarea,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    const { resolve, type } = dialogState;
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolve) {
      if (type === 'prompt') {
        resolve(inputValue);
      } else if (type === 'confirm') {
        resolve(true);
      } else {
        resolve(true);
      }
    }
  };

  const handleCancel = () => {
    const { resolve, type } = dialogState;
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolve) {
      if (type === 'prompt') {
        resolve(null);
      } else {
        resolve(false);
      }
    }
  };

  const getIcon = () => {
    const { type, message } = dialogState;
    const msgLower = message.toLowerCase();
    
    if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('denied') || msgLower.includes('cannot')) {
      return <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />;
    }
    if (msgLower.includes('success') || msgLower.includes('updated') || msgLower.includes('uploaded') || msgLower.includes('saved')) {
      return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
    }
    if (type === 'confirm') {
      return <HelpCircle className="w-12 h-12 text-brand" />;
    }
    return <Info className="w-12 h-12 text-indigo-400" />;
  };

  return (
    <CustomDialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white relative">
            
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition duration-200 cursor-pointer border-none"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3 mt-2">
              <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-850 shadow-inner">
                {getIcon()}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white font-header">
                {dialogState.title}
              </h3>
            </div>

            {/* Message Body */}
            <div className="mt-4 text-center text-sm text-zinc-300 font-semibold leading-relaxed font-sans px-2">
              {dialogState.message}
            </div>

            {/* Input field for Prompts */}
            {dialogState.type === 'prompt' && (
              <div className="mt-4 w-full">
                {dialogState.isTextarea ? (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dialogState.placeholder || "Enter value..."}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition duration-200 placeholder-zinc-500 text-sm font-semibold min-h-[100px] resize-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dialogState.placeholder || "Enter value..."}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10 transition duration-200 placeholder-zinc-500 text-sm font-semibold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 w-full">
              {dialogState.type !== 'alert' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-sm capitalize rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 font-bold text-sm capitalize rounded-xl cursor-pointer transition border-none shadow-md ${
                  dialogState.type === 'alert' && (dialogState.message.toLowerCase().includes('failed') || dialogState.message.toLowerCase().includes('error') || dialogState.message.toLowerCase().includes('denied'))
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : dialogState.title.toLowerCase().includes('delete') || dialogState.title.toLowerCase().includes('remove') || dialogState.title.toLowerCase().includes('reject')
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-brand hover:bg-brand-dark text-zinc-955'
                }`}
              >
                {dialogState.type === 'alert' ? 'OK' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomDialogContext.Provider>
  );
};
