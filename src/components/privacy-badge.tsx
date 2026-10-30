import { CheckCircle2 } from 'lucide-react';

/**
 * 常驻隐私安心标识（绿色对勾）
 * 全站统一使用：顶部导航 / 各子页面页头
 * compact 模式下小屏只显示对勾图标，sm 及以上显示完整文案
 */
export function PrivacyBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="privacy-badge flex-shrink-0">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span className={compact ? 'hidden sm:inline' : ''}>本地存储 · 不上传</span>
    </span>
  );
}
