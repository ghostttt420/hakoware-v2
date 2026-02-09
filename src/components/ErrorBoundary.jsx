/**
 * Error Boundary - Catches JavaScript errors anywhere in child component tree
 * Prevents entire app from crashing when one component fails
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: 'linear-gradient(145deg, #111, #0a0a0a)',
          borderRadius: '16px',
          margin: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#ff4444', margin: '0 0 8px 0' }}>
            Something went wrong
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
            {this.props.fallback || 'Try refreshing the page'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,215,0,0.15)',
              color: '#ffd700',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
