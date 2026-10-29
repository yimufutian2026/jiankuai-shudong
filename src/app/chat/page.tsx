'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { experts } from '@/lib/experts';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const domains = [
    { id: 'all', label: '全部' },
    { id: 'child', label: '儿童' },
    { id: 'teen', label: '青少年' },
    { id: 'marriage', label: '婚恋' },
    { id: 'family', label: '家庭' },
    { id: 'general', label: '综合' },
  ];

  const filteredExperts = selectedDomain === 'all'
    ? experts
    : experts.filter((e) => e.domain === selectedDomain);

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">专家对话</h1>
              <p className="text-xs text-muted-foreground">选择一位专家，开始倾诉</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-4">
        {/* Domain Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedDomain === d.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Expert Cards */}
        <div className="space-y-3">
          {filteredExperts.map((expert) => (
            <button
              key={expert.id}
              onClick={() => router.push(`/chat/${expert.id}`)}
              className="w-full text-left bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                  {expert.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{expert.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{expert.domainLabel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{expert.intro}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {expert.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary/40 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-6 bg-secondary/30 rounded-xl p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">温馨提示：</strong>对话基于简快身心积极疗法风格，遵循「共情-聚焦-探索-目标-行动」流程。所有回复仅供参考，不做医学诊断。
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
