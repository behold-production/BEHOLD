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
    try {
      const stored = localStorage.getItem('behold_user');
      if (stored) {
        const user = JSON.parse(stored);
        const role = user?.role?.toUpperCase();
        if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') {
          window.location.href = '/admin';
          return;
        } else if (role === 'PSYCHOLOGIST' || role === 'COUNSELLOR') {
          window.location.href = '/counsellor';
          return;
        } else if (role === 'USER' || role === 'CUSTOMER' || role === 'STUDENT') {
          window.location.href = '/profile';
          return;
        }
      }
    } catch (e) { }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050707] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans text-left">
          {/* Decorative glow elements */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#0e7490]/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#0891b2]/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

          <div className="max-w-xl w-full relative z-10 space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-[10px] flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-955/20 float-slow mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-header font-semibold tracking-tight leading-none text-white ">
                Interface Encounters An Issue
              </h1>
              <p className="text-[#9aa29f] text-sm max-w-md mx-auto leading-relaxed mt-2">
                A localized runtime exception was caught by the system guards. Try reloading the console or going back to safety.
              </p>
            </div>

            {/* Diagnostic Details card */}
            <div className="bg-[#0e1111] border border-[#243033] p-6 rounded-[10px] shadow-2xl space-y-4">
              <div>
                <span className="text-xs tracking-widest text-[#7c8785] font-semibold block mb-1">Error Diagnostics</span>
                <p className="text-sm font-semibold text-rose-450 break-all leading-normal">
                  {this.state.error ? this.state.error.toString() : 'Unknown App Runtime Error'}
                </p>
              </div>

              {this.state.errorInfo && (
                <div className="space-y-1.5">
                  <span className="text-xs tracking-widest text-[#7c8785] font-semibold block">Component Callstack</span>
                  <div className="max-h-[160px] overflow-y-auto pr-1 bg-[#050707]/60 border border-[#0f2a32] p-3 rounded-[10px] text-[10px] font-mono text-[#9aa29f] whitespace-pre-wrap leading-normal custom-scrollbar select-text">
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
                className="px-8 py-3.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white font-semibold text-xs tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-md w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97]"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-8 py-3.5 bg-[#243033] hover:bg-[#3c4747] text-white font-semibold text-xs tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#3c4747] w-full sm:w-auto hover:scale-[1.03] active:scale-[0.97]"
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
