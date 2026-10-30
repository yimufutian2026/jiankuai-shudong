'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PrivacyBadge } from '@/components/privacy-badge';

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 副标题（安心、温和语气的引导文案） */
  subtitle?: string;
  /** 返回行为：默认 router.back()，可传自定义路径如 '/chat' */
  backTo?: string;
  /** 是否隐藏返回按钮（默认显示） */
  hideBack?: boolean;
  /** 标题下方是否隐藏隐私标识（默认显示） */
  hideBadge?: boolean;
  /** 右侧额外内容（如操作按钮），渲染在隐私标识左侧 */
  right?: React.ReactNode;
  /** 头部下方追加内容（如进度条） */
  children?: React.ReactNode;
}

/**
 * 全站统一子页面页头
 * 风格与新首页顶部导航一致：毛玻璃底 + 极细边线 + 「本地存储 · 不上传」常驻标识
 */
export function PageHeader({
  title,
  subtitle,
  backTo,
  hideBack = false,
  hideBadge = false,
  right,
  children,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <header className="header-blur">
      <div className="max-w-lg mx-auto px-5 py-3.5">
        <div className="flex items-center gap-3">
          {!hideBack && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          {right}
          {!hideBadge && <PrivacyBadge compact />}
        </div>
        {children}
      </div>
    </header>
  );
}
