'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, ClipboardCheck, Calendar, FolderOpen, Home } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/chat', label: '专家对话', icon: MessageCircle },
  { href: '/assessments', label: '心理自测', icon: ClipboardCheck },
  { href: '/appointment', label: '公益咨询', icon: Calendar },
  { href: '/records', label: '我的记录', icon: FolderOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
