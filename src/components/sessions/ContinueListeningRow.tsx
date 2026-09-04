'use client';

import React from 'react';
import { Sesion } from '@/types/database';
import { SessionCard } from './SessionCard';
import { History } from 'lucide-react';

interface ContinueListeningItem {
  session: Sesion;
  progressSeconds: number;
}

interface ContinueListeningRowProps {
  items: ContinueListeningItem[];
}

export function ContinueListeningRow({ items }: ContinueListeningRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          Continuar escuchando
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ session, progressSeconds }) => (
          <SessionCard
            key={session.id}
            session={session}
            variant="horizontal"
            progressSeconds={progressSeconds}
          />
        ))}
      </div>
    </div>
  );
}
