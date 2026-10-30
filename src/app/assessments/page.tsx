'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { PageHeader } from '@/components/page-header';
import { assessments } from '@/lib/assessments';
import { ChevronRight, AlertTriangle } from 'lucide-react';

export default function AssessmentsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: '全部' },
    { id: '情绪', label: '情绪' },
    { id: '状态', label: '状态' },
    { id: '人际', label: '人际' },
    { id: '儿童', label: '儿童' },
    { id: '青少年', label: '青少年' },
    { id: '婚恋', label: '婚恋' },
    { id: '家庭', label: '家庭' },
    { id: '探索', label: '探索' },
  ];

  const filtered = activeCategory === 'all'
    ? assessments
    : assessments.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader
        title="心理自测中心"
        subtitle="安静地看看自己，结果只留在你的设备上"
        backTo="/"
      />

      <main className="max-w-lg mx-auto px-5 py-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`chip ${
                activeCategory === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Assessment Cards */}
        <div className="space-y-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => router.push(`/assessments/${a.id}`)}
              className="w-full text-left card-interactive p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{a.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{a.questions.length} 题</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">约 {Math.ceil(a.questions.length * 0.5)} 分钟</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-6 notice-soft">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warm-foreground flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">说明：</strong>测评结果仅供筛查参考，不构成医学诊断。如有严重困扰，请及时寻求专业帮助。
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
