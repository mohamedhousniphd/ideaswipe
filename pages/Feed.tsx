import React, { useEffect, useState, useRef } from 'react';
import { Idea, User } from '../types';
import { storageService } from '../services/storageService';
import { IdeaCard } from '../components/IdeaCard';

interface FeedProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ user, onNavigate }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [hasVotedOnCurrent, setHasVotedOnCurrent] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);

  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    loadIdeas();
  }, [user.id]);

  const loadIdeas = () => {
    const allIdeas = storageService.getIdeas();
    const interactions = storageService.getInteractions();
    
    // In normal mode, show ideas user hasn't voted on, or ideas they just voted on locally?
    // The prompt says "one idea per screen... swipe right to view new... left to see previous history".
    
    // Strategy: Load ALL approved ideas. 
    // Filter out ideas authored by self (optional, but good UX).
    // Sort: Unseen first? Or just chronological?
    // Let's simple filter: Status Approved.
    
    const approved = allIdeas.filter(i => i.status === 'approved' && i.authorId !== user.id);
    
    // Sort so interacted ones are at the "left" (beginning) and new ones at the "right" (end)?
    // Actually, "History" implies a stack you've passed.
    // Let's maintain a pointer `currentIndex`.
    // Ideas < currentIndex are history. Idea == currentIndex is current. Ideas > currentIndex are next.
    
    setIdeas(approved);
    
    // Find first un-interacted idea to start there
    const interactedIds = new Set(interactions.filter(i => i.userId === user.id).map(i => i.ideaId));
    const firstUnseenIndex = approved.findIndex(i => !interactedIds.has(i.id));
    
    if (firstUnseenIndex !== -1) {
      setCurrentIndex(firstUnseenIndex);
    } else if (approved.length > 0) {
      // All seen, go to end
      setCurrentIndex(approved.length - 1);
      setHasVotedOnCurrent(true);
    }
  };

  const currentIdea = ideas[currentIndex];

  useEffect(() => {
    if (currentIdea) {
      const interactions = storageService.getInteractions();
      const voted = interactions.some(i => i.userId === user.id && i.ideaId === currentIdea.id);
      setHasVotedOnCurrent(voted);
    }
  }, [currentIndex, currentIdea, user.id]);

  const handleVote = (type: 'like' | 'dislike') => {
    if (!currentIdea) return;
    
    storageService.recordInteraction({
      userId: user.id,
      ideaId: currentIdea.id,
      type,
      timestamp: Date.now()
    });

    // Update local state to reflect new counts immediately
    const updatedIdeas = [...ideas];
    if (type === 'like') updatedIdeas[currentIndex].likes++;
    else updatedIdeas[currentIndex].dislikes++;
    setIdeas(updatedIdeas);
    
    setHasVotedOnCurrent(true);
    
    // UX: Delay slightly then move next? 
    // Prompt says: "they only see the counter ... when they make the action".
    // It doesn't explicitly say it auto-swipes.
    // But usually Tinder auto-swipes. 
    // Prompt also says "swipe right to view a new idea".
    // So voting reveals stats. Then user must swipe right to go next.
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      if (direction === 'right') {
        // Next Idea
        if (currentIndex < ideas.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSwipeDirection(null);
        } else {
          // End of feed
          setSwipeDirection(null);
          // Maybe show a "No more ideas" card
        }
      } else {
        // Previous Idea (History)
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setSwipeDirection(null);
        } else {
           setSwipeDirection(null);
        }
      }
    }, 300);
  };

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    if (deltaX > 75) {
      handleSwipe('right');
    } else if (deltaX < -75) {
      handleSwipe('left');
    }
    touchStartX.current = null;
  };

  if (!currentIdea) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No ideas found!</h2>
        <p className="text-muted-foreground mb-6">Be the first to post a startup idea.</p>
        <button 
          onClick={() => onNavigate('profile')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg"
        >
          Post an Idea
        </button>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-between h-[calc(100vh-4rem)] py-6 overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 flex items-center w-full justify-center px-4">
        {/* Navigation Hints */}
        {currentIndex > 0 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-muted/50 rounded-full text-muted-foreground pointer-events-none animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
        )}
        
        <IdeaCard 
          idea={currentIdea} 
          showStats={hasVotedOnCurrent} 
          swipeDirection={swipeDirection}
        />

        {currentIndex < ideas.length - 1 && (
           <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-muted/50 rounded-full text-muted-foreground pointer-events-none animate-pulse">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
           </div>
        )}
      </div>

      {/* Persistent Action Buttons (Sticky at bottom) */}
      <div className="w-full max-w-md px-8 pb-8 flex justify-between gap-6 z-10">
        <button
          onClick={() => handleVote('dislike')}
          disabled={hasVotedOnCurrent}
          className={`flex-1 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${hasVotedOnCurrent ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card text-destructive border-2 border-destructive hover:bg-destructive/10'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <button
          onClick={() => handleVote('like')}
          disabled={hasVotedOnCurrent}
          className={`flex-1 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${hasVotedOnCurrent ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground border-2 border-primary hover:brightness-110'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"/></svg>
        </button>
      </div>
      
      {hasVotedOnCurrent && currentIndex < ideas.length - 1 && (
        <div className="absolute bottom-28 text-sm text-muted-foreground animate-bounce">
          Swipe Right for Next Idea &rarr;
        </div>
      )}
    </div>
  );
};
