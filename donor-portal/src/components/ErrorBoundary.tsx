import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>
              We're sorry, but something unexpected happened. Please try refreshing
              the page or contact support if the problem continues.
            </p>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-actions">
              <button
                type="button"
                className="button primary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <a href="/" className="button secondary">
                Go to Home
              </a>
              <a href="mailto:donations@vitalita.com" className="button secondary">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

