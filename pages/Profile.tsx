import React, { useState, useEffect } from 'react';
import { User, Idea, IdeaStatus } from '../types';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { generateId } from '../utils';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setIdeas(storageService.getUserIdeas(user.id).sort((a, b) => b.createdAt - a.createdAt));
  }, [user.id, refreshTrigger]);

  const validateInput = (text: string): string | null => {
    if (text.length < 60) return "Idea must be at least 60 characters.";
    if (text.length > 120) return "Idea must be less than 120 characters.";
    return null;
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateInput(newIdeaText);
    if (validationError) {
      setError(validationError);
      return;
    }

    const config = storageService.getConfig();
    const activeIdeas = ideas.filter(i => i.status !== IdeaStatus.REJECTED); // Assuming rejected don't count towards limit? Prompt says "exceed 10 number".
    if (activeIdeas.length >= config.maxIdeasPerUser) {
      setError(`You have reached the limit of ${config.maxIdeasPerUser} active ideas.`);
      return;
    }

    const hasPending = ideas.some(i => i.status === IdeaStatus.PENDING);
    if (hasPending) {
      setError("You already have an idea pending review. Please wait.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Pending Idea
      const newIdea: Idea = {
        id: generateId(),
        authorId: user.id,
        content: newIdeaText,
        status: IdeaStatus.PENDING,
        createdAt: Date.now(),
        likes: 0,
        dislikes: 0
      };

      // Save pending state immediately to lock UI
      storageService.addIdea(newIdea);
      setIdeas(prev => [newIdea, ...prev]);
      setNewIdeaText('');

      // 2. Perform AI Review (Async)
      const review = await aiService.reviewIdea(newIdea.content);

      const processedIdea: Idea = {
        ...newIdea,
        status: review.approved ? IdeaStatus.APPROVED : IdeaStatus.REJECTED,
        rejectionReason: review.reason
      };

      storageService.updateIdea(processedIdea);
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      setError("Something went wrong posting your idea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this idea?")) {
      storageService.deleteIdea(id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const pendingIdea = ideas.find(i => i.status === IdeaStatus.PENDING);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-24">
      <section className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center text-primary-foreground text-3xl font-bold">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-muted-foreground">{user.role}</p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{ideas.reduce((acc, curr) => acc + curr.likes, 0)}</div>
            <div className="text-xs text-muted-foreground uppercase">Total Likes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{ideas.length}</div>
            <div className="text-xs text-muted-foreground uppercase">Ideas</div>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Post New Idea</h3>
        <form onSubmit={handlePost} className="space-y-4">
          <div className="relative">
            <textarea
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              placeholder="Describe your startup idea (60-120 chars)..."
              className="w-full p-4 bg-background text-foreground rounded-lg resize-none border-2 border-input focus:border-ring focus:outline-none transition-all"
              rows={3}
              disabled={isSubmitting || !!pendingIdea}
            />
            <div className={`absolute bottom-2 right-2 text-xs font-mono ${newIdeaText.length < 60 || newIdeaText.length > 120 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {newIdeaText.length}/120
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              {error}
            </div>
          )}

          {pendingIdea && (
            <div className="p-3 bg-secondary/10 text-secondary text-sm rounded-lg flex items-center gap-2 animate-pulse">
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Idea under AI review...
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!pendingIdea || newIdeaText.length < 60 || newIdeaText.length > 120}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Posting...' : 'Post Idea'}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Your Ideas</h3>
        {ideas.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No ideas posted yet.</p>
        ) : (
          ideas.map(idea => (
            <div key={idea.id} className="bg-card border border-border rounded-xl p-4 shadow-sm relative group">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${idea.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  idea.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                  {idea.status}
                </span>
                <button
                  onClick={() => handleDelete(idea.id)}
                  className="text-muted-foreground hover:text-destructive transition p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
              </div>

              <p className="text-lg font-medium mb-4">{idea.content}</p>

              {idea.status === 'rejected' && idea.rejectionReason && (
                <p className="text-sm text-destructive mb-3">Reason: {idea.rejectionReason}</p>
              )}

              <div className="flex gap-4 text-sm font-mono">
                <div className="flex items-center gap-1 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>
                  {idea.likes}
                </div>
                <div className="flex items-center gap-1 text-destructive">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  {idea.dislikes}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
