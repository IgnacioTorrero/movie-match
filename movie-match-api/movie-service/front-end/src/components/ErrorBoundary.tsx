import React from "react";

type State = { hasError: boolean };
type Props = { children: React.ReactNode };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        return (
        <div className="h-screen flex items-center justify-center text-center bg-gray-100">
            <div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">⚠️ Unexpected error</h1>
            <p className="text-gray-700 mb-4">Something went wrong. You can try reloading the page.</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                Reload
            </button>
            </div>
        </div>
        );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
