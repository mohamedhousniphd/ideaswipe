import React from 'react';
import { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
  showStats: boolean;
  swipeDirection?: 'left' | 'right' | null;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, showStats, swipeDirection }) => {
  // Dynamic transform based on swipe for visual feedback could go here if using a library.
  // We will rely on simple CSS classes passed from parent for animations.

  return (
    <div className={`
      relative w-full max-w-md h-[60vh] sm:h-[500px] 
      bg-card text-card-foreground 
      rounded-xl border border-border shadow-xl 
      flex flex-col items-center justify-center p-8 
      transition-all duration-300 transform
      ${swipeDirection === 'right' ? 'translate-x-full opacity-0 rotate-12' : ''}
      ${swipeDirection === 'left' ? '-translate-x-full opacity-0 -rotate-12' : ''}
    `}>
      
      <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono">
        #{idea.id.slice(-4)}
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <p className="text-2xl sm:text-3xl font-bold text-center leading-tight font-sans">
          {idea.content}
        </p>
      </div>

      {showStats && (
        <div className="mt-8 flex gap-8 w-full justify-center animate-fade-in">
          <div className="flex flex-col items-center text-primary">
            <span className="text-3xl font-bold">{idea.likes}</span>
            <span className="text-xs uppercase tracking-wider font-bold">Likes</span>
          </div>
          <div className="flex flex-col items-center text-destructive">
            <span className="text-3xl font-bold">{idea.dislikes}</span>
            <span className="text-xs uppercase tracking-wider font-bold">Dislikes</span>
          </div>
        </div>
      )}
      
      {!showStats && (
        <div className="mt-8 text-sm text-muted-foreground text-center">
          Vote to see stats
        </div>
      )}
    </div>
  );
};
