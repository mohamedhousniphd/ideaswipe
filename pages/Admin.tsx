import React, { useState, useEffect } from 'react';
import { User, Idea, AppConfig } from '../types';
import { storageService } from '../services/storageService';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [config, setConfig] = useState<AppConfig>({ openRouterApiKey: '', maxIdeasPerUser: 10 });
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(storageService.getUsers());
    setIdeas(storageService.getIdeas());
    const cfg = storageService.getConfig();
    setConfig(cfg);
    setApiKeyInput(cfg.openRouterApiKey);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Delete this user?")) {
      storageService.deleteUser(id);
      refreshData();
    }
  };

  const handleSaveConfig = () => {
    const newConfig = { ...config, openRouterApiKey: apiKeyInput };
    storageService.saveConfig(newConfig);
    setConfig(newConfig);
    alert("Configuration saved.");
  };

  const totalLikes = ideas.reduce((acc, i) => acc + i.likes, 0);
  const totalDislikes = ideas.reduce((acc, i) => acc + i.dislikes, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-24">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-muted-foreground text-sm uppercase font-bold">Total Users</h3>
          <p className="text-4xl font-bold mt-2">{users.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-muted-foreground text-sm uppercase font-bold">Total Ideas</h3>
          <p className="text-4xl font-bold mt-2">{ideas.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
           <h3 className="text-muted-foreground text-sm uppercase font-bold">Engagement</h3>
           <div className="mt-2 flex gap-4 text-sm">
             <span className="text-primary font-bold">{totalLikes} Likes</span>
             <span className="text-destructive font-bold">{totalDislikes} Dislikes</span>
           </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold">Settings</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">OpenRouter API Key (AI Reviewer)</label>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-or-..."
              className="flex-1 p-2 rounded bg-muted/50 border border-input"
            />
            <button 
              onClick={handleSaveConfig}
              className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            If left empty, a mock reviewer will be used for testing purposes.
          </p>
        </div>
        
        <div className="space-y-2 pt-4">
           <label className="text-sm font-medium">Max Ideas Per User</label>
           <input 
             type="number" 
             value={config.maxIdeasPerUser}
             onChange={(e) => {
               const val = parseInt(e.target.value);
               const newConfig = { ...config, maxIdeasPerUser: val };
               storageService.saveConfig(newConfig);
               setConfig(newConfig);
             }}
             className="w-24 p-2 rounded bg-muted/50 border border-input"
           />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 rounded-tl-lg">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{u.id.slice(0, 8)}...</td>
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
