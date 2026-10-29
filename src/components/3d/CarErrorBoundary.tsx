import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CarErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Car 3D Error Caught:', error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#0a0b0e]/90 backdrop-blur-md text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">3D Stage Exception</h3>
          <p className="text-xs text-neutral-400 max-w-sm mt-1 leading-relaxed">
            {this.state.error?.message || 'Unable to load 3D vehicle assets or WebGL context was lost.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-4 px-4 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-xs text-white flex items-center space-x-1.5 bg-white/[0.05] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload 3D Stage</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
