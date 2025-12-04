'use client';

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Editor } from '@/components/Editor';
import { Auth } from '@/components/Auth';
import { User, JournalEntry, ViewState } from '@/types';
import { StorageService } from '@/services/storage';
import { IconBook, IconLogOut } from '@/components/Icons';

// Robust ID generator fallback
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('AUTH');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null); // client-side ID

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        const sessionUser = await StorageService.getSession();
        if (sessionUser) {
          setUser(sessionUser);
          const data = await StorageService.getEntries(sessionUser.id);
          setEntries(data);
          setView('DASHBOARD');
        } else {
          setView('AUTH');
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setView('AUTH');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Generate ID for new entry on client only
  useEffect(() => {
    if (!editingEntry) {
      setEntryId(generateId());
    } else {
      setEntryId(editingEntry.id);
    }
  }, [editingEntry]);

  const loadEntries = async (userId: string) => {
    try {
      const data = await StorageService.getEntries(userId);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    setIsLoading(true);
    await loadEntries(userData.id);
    setIsLoading(false);
    setView('DASHBOARD');
  };

  const handleLogout = async () => {
    try {
      await StorageService.logout();
      setUser(null);
      setEntries([]);
      setView('AUTH');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveEntry = async (
    entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !entryId) return;

    const newEntry: JournalEntry = {
      ...entryData,
      id: entryId,
      userId: user.id,
      createdAt: editingEntry
        ? editingEntry.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await StorageService.saveEntry(newEntry);
      await loadEntries(user.id);
      setView('DASHBOARD');
      setEditingEntry(null);
      setEntryId(null); // reset for next new entry
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save your journal entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (
      !user ||
      !window.confirm('Are you sure you want to delete this memory?')
    )
      return;

    setIsDeleting(true);
    try {
      await StorageService.deleteEntry(id);
      await loadEntries(user.id);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Could not delete the entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4'></div>
          <p className='text-slate-500 text-sm font-medium'>
            Loading your journal...
          </p>
        </div>
      </div>
    );
  }

  if (!user || view === 'AUTH') {
    return <Auth onLoginSuccess={handleLogin} />;
  }

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div
              className='flex items-center cursor-pointer group'
              onClick={() => {
                setEditingEntry(null);
                setView('DASHBOARD');
              }}>
              <div className='bg-primary-50 p-2 rounded-lg group-hover:bg-primary-100 transition-colors'>
                <IconBook className='h-6 w-6 text-primary-600' />
              </div>
              <span className='ml-3 text-xl font-serif font-bold text-slate-900 tracking-tight'>
                MindfulJournal
              </span>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-slate-500 hidden sm:block font-medium'>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className='p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors'
                title='Sign out'>
                <IconLogOut className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 flex flex-col'>
        {view === 'DASHBOARD' && (
          <Dashboard
            user={user}
            entries={entries}
            onNewEntry={() => {
              setEditingEntry(null);
              setView('EDITOR');
            }}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setView('EDITOR');
            }}
            onDeleteEntry={handleDeleteEntry}
            isDeleting={isDeleting}
          />
        )}

        {view === 'EDITOR' && entryId && (
          <Editor
            userId={user.id}
            initialData={editingEntry}
            onSave={handleSaveEntry}
            onCancel={() => {
              setEditingEntry(null);
              setView('DASHBOARD');
              setEntryId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
