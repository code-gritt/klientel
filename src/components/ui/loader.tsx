import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5 h-8 w-24',
        className
      )}
    >
      <div className="h-6 w-1.5 bg-gradient-to-b from-primary/60 to-primary animate-pulse rounded-full [animation-delay:-0.3s]"></div>
      <div className="h-6 w-1.5 bg-gradient-to-b from-primary/60 to-primary animate-pulse rounded-full [animation-delay:-0.15s]"></div>
      <div className="h-6 w-1.5 bg-gradient-to-b from-primary/60 to-primary animate-pulse rounded-full"></div>
    </div>
  );
};
