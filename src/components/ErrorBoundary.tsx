import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
          <span className="font-serif text-4xl font-bold tracking-[0.2em] text-neutral-900">
            MB
          </span>
          <p className="mt-6 text-sm text-neutral-500">
            Ocorreu um erro ao carregar esta página.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-8 bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
