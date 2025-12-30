import { Idea, IdeaStatus, Interaction, User, UserRole, AppConfig } from '../types';
import { generateId } from '../utils';

const STORAGE_KEYS = {
  USERS: 'ideaswipe_users',
  IDEAS: 'ideaswipe_ideas',
  INTERACTIONS: 'ideaswipe_interactions',
  CONFIG: 'ideaswipe_config',
  CURRENT_USER_ID: 'ideaswipe_current_user_id',
};

const DEFAULT_CONFIG: AppConfig = {
  openRouterApiKey: '',
  maxIdeasPerUser: 10,
};

// Seed data helper
const seedData = () => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const adminEmail = 'admin@ideaswipe.com';

  // Ensure Admin exists
  if (!users.find((u: User) => u.email === adminEmail)) {
    const adminUser: User = {
      id: 'admin-1',
      name: 'Super Admin',
      email: adminEmail,
      password: 'password123',
      role: UserRole.ADMIN,
      createdAt: Date.now()
    };
    users.push(adminUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
    const ideas: Idea[] = [
      {
        id: 'idea-1',
        authorId: 'admin-1',
        content: 'Uber but for dog walking specifically for senior citizens who need help.',
        status: IdeaStatus.APPROVED,
        createdAt: Date.now() - 100000,
        likes: 12,
        dislikes: 2
      },
      {
        id: 'idea-2',
        authorId: 'admin-1',
        content: 'A marketplace for leftover construction materials to reduce waste.',
        status: IdeaStatus.APPROVED,
        createdAt: Date.now() - 50000,
        likes: 45,
        dislikes: 1
      }
    ];
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  }
};

seedData();

export const storageService = {
  getConfig: (): AppConfig => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  },

  saveConfig: (config: AppConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  getCurrentUser: (): User | null => {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!id) return null;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.find((u: User) => u.id === id) || null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.location.href = "/";
  },

  login: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      return user;
    }
    return null;
  },

  signup: (name: string, email: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already exists");
    }

    const newUser: User = {
      id: generateId(),
      name,
      email,
      password,
      role: UserRole.USER,
      createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    return newUser;
  },

  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  deleteUser: (userId: string) => {
    let users = storageService.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getIdeas: (): Idea[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEAS) || '[]');
  },

  getUserIdeas: (userId: string): Idea[] => {
    const ideas = storageService.getIdeas();
    return ideas.filter(i => i.authorId === userId);
  },

  addIdea: (idea: Idea) => {
    const ideas = storageService.getIdeas();
    ideas.push(idea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  },

  updateIdea: (updatedIdea: Idea) => {
    const ideas = storageService.getIdeas();
    const index = ideas.findIndex(i => i.id === updatedIdea.id);
    if (index !== -1) {
      ideas[index] = updatedIdea;
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    }
  },

  deleteIdea: (ideaId: string) => {
    let ideas = storageService.getIdeas();
    ideas = ideas.filter(i => i.id !== ideaId);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  },

  getInteractions: (): Interaction[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERACTIONS) || '[]');
  },

  recordInteraction: (interaction: Interaction) => {
    const interactions = storageService.getInteractions();
    // Remove previous interaction for this user/idea interaction if exists
    const filtered = interactions.filter(i => !(i.userId === interaction.userId && i.ideaId === interaction.ideaId));
    filtered.push(interaction);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(filtered));

    // Update counters on idea
    const ideas = storageService.getIdeas();
    const ideaIndex = ideas.findIndex(i => i.id === interaction.ideaId);
    if (ideaIndex !== -1) {
      if (interaction.type === 'like') {
        ideas[ideaIndex].likes++;
      } else {
        ideas[ideaIndex].dislikes++;
      }
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    }
  },

  getUserInteractionHistory: (userId: string): string[] => {
    const interactions = storageService.getInteractions();
    return interactions
      .filter(i => i.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(i => i.ideaId);
  }
};
