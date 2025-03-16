interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`inline-block ${sizeStyles[size]} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-2 border-red-600 border-t-transparent"></div>
    </div>
  );
} 