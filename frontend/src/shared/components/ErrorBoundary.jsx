import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-955 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans text-left">
          {/* Decorative glow elements */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

          <div className="max-w-xl w-full relative z-10 space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-[10px] flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-955/20 float-slow mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-header font-black tracking-tight leading-none text-white capitalize">
                Interface Encounters An Issue
              </h1>
              <p className="text-zinc-450 text-sm max-w-md mx-auto leading-relaxed mt-2">
                A localized runtime exception was caught by the system guards. Try reloading the console or going back to safety.
              </p>
            </div>

            {/* Diagnostic Details card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[10px] shadow-2xl space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold block mb-1">Error Diagnostics</span>
                <p className="text-sm font-black text-rose-450 break-all leading-normal">
                  {this.state.error ? this.state.error.toString() : 'Unknown App Runtime Error'}
                </p>
              </div>

              {this.state.errorInfo && (
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">Component Callstack</span>
                  <div className="max-h-[160px] overflow-y-auto pr-1 bg-zinc-950/60 border border-zinc-850 p-3 rounded-[10px] text-[10px] font-mono text-zinc-400 whitespace-pre-wrap leading-normal custom-scrollbar select-text">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-xs capitalize rounded-[10px] transition cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-lg shadow-brand/10 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs capitalize rounded-[10px] transition cursor-pointer flex items-center justify-center gap-1.5 border border-zinc-700 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
