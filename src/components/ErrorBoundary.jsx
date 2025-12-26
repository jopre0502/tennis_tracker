import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    // Clear error state and reload the app
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Clear localStorage to reset app state
    localStorage.removeItem('tennolino-match-state');
    // Reload page to start fresh
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 p-4 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-4 text-red-800">
              Fehler aufgetreten
            </h1>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Es ist ein unerwarteter Fehler aufgetreten. Die Anwendung kann möglicherweise nicht korrekt funktionieren.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-red-700 mb-2">
                    Fehlerdetails (nur im Entwicklungsmodus)
                  </summary>
                  <div className="mt-2 text-xs font-mono break-all">
                    <p className="font-bold">Fehler:</p>
                    <p className="text-red-600 mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <>
                        <p className="font-bold mt-2">Stack Trace:</p>
                        <pre className="whitespace-pre-wrap text-gray-600">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full p-4 bg-red-600 text-white rounded-lg text-lg font-bold hover:bg-red-700"
              >
                App zurücksetzen und neu starten
              </button>

              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full p-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
              >
                Erneut versuchen
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-600 text-center">
              Hinweis: Durch das Zurücksetzen werden alle nicht gespeicherten Daten gelöscht.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
