interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div 
      className="mt-8 text-center text-xl animate-pulse"
      role="status" 
      aria-live="polite"
    >
      <span className="sr-only">{message}</span>
      {message}
    </div>
  );
}
