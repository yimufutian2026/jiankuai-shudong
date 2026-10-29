import type { Metadata } from 'next';
import './globals.css';
import { DisclaimerProvider } from '@/components/disclaimer-provider';

export const metadata: Metadata = {
  title: '简快树洞 - 你的心理自助陪伴平台',
  description: '简快树洞是一个免费开源的心理自助平台，提供免费公益心理支持、数字人专家对话、心理自测等服务，用简快身心积极疗法陪伴你的每一步成长。',
  keywords: ['心理咨询', '心理自助', '简快身心积极疗法', '情绪管理', '心理健康', '树洞'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <DisclaimerProvider>
          {children}
        </DisclaimerProvider>
      </body>
    </html>
  );
}
