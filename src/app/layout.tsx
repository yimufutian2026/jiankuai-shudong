import type { Metadata } from 'next';
import './globals.css';
import { DisclaimerProvider } from '@/components/disclaimer-provider';

export const metadata: Metadata = {
  title: '简快树洞 - 在家自我疗愈 · 隐私保护的心理陪伴空间',
  description: '简快树洞是一个免费开源的心理自助平台：不出门、不预约、不必告诉任何人，在家就能获得共建式心理支持。所有内容只保存在你自己的设备上，不上传、可一键清除。',
  keywords: ['心理咨询', '心理自助', '在家自我疗愈', '隐私保护', '简快身心积极疗法', '情绪管理', '心理健康', '树洞'],
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
