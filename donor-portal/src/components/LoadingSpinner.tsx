interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({
  size = 'medium',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  const content = (
    <div className={`loading-spinner ${sizeClasses[size]}`} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      {message && <p className="loading-message">{message}</p>}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;

