import React, { useState, useCallback } from 'react';
import { JournalEntry, MoodType } from '../types';
import { Button } from './Button';
import { IconChevronLeft, IconSparkles } from './Icons';
import { GeminiService, isAiAvailable } from '../services/geminiService';

interface EditorProps {
  initialData?: JournalEntry | null;
  onSave: (entryData: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export const Editor: React.FC<EditorProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState<MoodType>(initialData?.mood || MoodType.Neutral);
  const [tags, setTags] = useState<string>(initialData?.tags.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | undefined>(initialData?.aiReflection);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title,
        content,
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        aiReflection
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiAnalysis = useCallback(async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Create a temporary entry object for the service
      const tempEntry = {
        title,
        content,
        mood,
      } as JournalEntry;
      
      const reflection = await GeminiService.generateReflection(tempEntry);
      setAiReflection(reflection);
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Could not generate reflection. Check your API key or try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [title, content, mood]);

  const moods = Object.values(MoodType);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <IconChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <div className="text-sm text-slate-400 font-medium">
          {initialData ? 'Editing Entry' : 'New Entry'}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mood</span>
            <select 
              value={mood}
              onChange={(e) => setMood(e.target.value as MoodType)}
              className="block w-full pl-3 pr-10 py-1.5 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {moods.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
             <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)..."
              className="block w-full px-3 py-1.5 text-sm border-0 bg-transparent placeholder-slate-400 focus:ring-0"
            />
          </div>

          {isAiAvailable() && (
            <Button 
              variant="secondary" 
              onClick={handleAiAnalysis}
              isLoading={isAnalyzing}
              className="text-xs py-1.5"
              title="Generate a reflection using AI"
            >
              <IconSparkles className="h-4 w-4 mr-1.5 text-indigo-500" />
              Reflect
            </Button>
          )}
        </div>

        {/* Editor Area */}
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your day..."
            className="block w-full text-3xl font-serif font-bold text-slate-900 placeholder-slate-300 border-0 focus:ring-0 px-0 mb-4 bg-transparent"
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            className="flex-1 w-full resize-none border-0 focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder-slate-300 px-0 bg-transparent"
          />

          {aiReflection && (
            <div className="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <IconSparkles className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-indigo-900">AI Reflection</h4>
              </div>
              <p className="text-indigo-800 text-sm leading-relaxed italic">
                "{aiReflection}"
              </p>
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={() => setAiReflection(undefined)}
                  className="text-xs text-indigo-400 hover:text-indigo-600"
                >
                  Discard Reflection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Entry
          </Button>
        </div>
      </div>
    </div>
  );
};