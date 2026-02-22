import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-zinc-400 text-sm mb-4">Something went wrong.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-mono text-xs uppercase border border-white/10 hover:bg-white/15"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
