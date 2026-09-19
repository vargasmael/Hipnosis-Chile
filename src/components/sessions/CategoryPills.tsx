'use client';

import React from 'react';
import { Categoria } from '@/types/database';
import { Sparkles, Moon, HeartHandshake, Compass, Activity, Check } from 'lucide-react';

interface CategoryPillsProps {
  categories: Categoria[];
  selectedId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryPills({
  categories,
  selectedId,
  onSelectCategory,
}: CategoryPillsProps) {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'ansiedad-estres':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'sueno-profundo':
        return <Moon className="w-3.5 h-3.5" />;
      case 'autoestima':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'enfoque':
        return <Compass className="w-3.5 h-3.5" />;
      case 'habitos':
        return <Activity className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <button
        onClick={() => onSelectCategory(null)}
        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all ${
          selectedId === null
            ? 'bg-[#a55850] text-white shadow-md shadow-[#a55850]/30 scale-105 font-semibold'
            : 'bg-[#1e1716] hover:bg-[#251d1c] text-[#a89b97] hover:text-[#fbf7f4] border border-[#3b2c29]'
        }`}
      >
        <span>Todas las Sesiones</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all ${
              isSelected
                ? 'bg-[#a55850] text-white shadow-md shadow-[#a55850]/30 scale-105 font-semibold'
                : 'bg-[#1e1716] hover:bg-[#251d1c] text-[#a89b97] hover:text-[#fbf7f4] border border-[#3b2c29]'
            }`}
          >
            {getIcon(cat.slug)}
            <span>{cat.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
