import React, { useState } from 'react';
import { JournalEntry, MoodType, User } from '../types';
import { Button } from './Button';
import { IconPen, IconPlus, IconSparkles, IconTrash } from './Icons';

interface DashboardProps {
  user: User;
  entries: JournalEntry[];
  onNewEntry: () => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  isDeleting: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  entries, 
  onNewEntry, 
  onEditEntry, 
  onDeleteEntry,
  isDeleting
}) => {
  const [filterMood, setFilterMood] = useState<string>('all');

  const getMoodEmoji = (mood: MoodType) => {
    switch (mood) {
      case MoodType.Happy: return '😊';
      case MoodType.Calm: return '😌';
      case MoodType.Excited: return '🤩';
      case MoodType.Sad: return '😢';
      case MoodType.Stressed: return '😫';
      default: return '😐';
    }
  };

  const filteredEntries = filterMood === 'all' 
    ? entries 
    : entries.filter(e => e.mood === filterMood);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-500 mt-1">
            You have {entries.length} entries in your journal.
          </p>
        </div>
        <Button onClick={onNewEntry} className="w-full sm:w-auto">
          <IconPlus className="mr-2 h-5 w-5" />
          Write Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setFilterMood('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterMood === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          All Memories
        </button>
        {Object.values(MoodType).map(mood => (
          <button
            key={mood}
            onClick={() => setFilterMood(mood)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${filterMood === mood ? 'bg-primary-100 text-primary-800 border-primary-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            {getMoodEmoji(mood)} {mood}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
            <IconPen className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No entries found</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating a new journal entry.</p>
          <div className="mt-6">
            <Button variant="secondary" onClick={onNewEntry}>
              <IconPlus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl" role="img" aria-label={entry.mood}>
                      {getMoodEmoji(entry.mood)}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2 line-clamp-1">
                  {entry.title}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {entry.content}
                </p>

                {entry.aiReflection && (
                  <div className="bg-primary-50 p-3 rounded-lg flex gap-3 items-start mt-4">
                    <IconSparkles className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-primary-800 italic leading-snug">
                      "{entry.aiReflection}"
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEditEntry(entry)}
                    className="p-2 text-slate-400 hover:text-primary-600 rounded-full hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <IconPen className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-white transition-colors"
                    title="Delete"
                    disabled={isDeleting}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};