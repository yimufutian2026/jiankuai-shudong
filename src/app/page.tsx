'use client';

import Link from 'next/link';
import { BottomNav } from '@/components/bottom-nav';
import { MessageCircle, ClipboardCheck, Calendar, Shield, Heart, Phone } from 'lucide-react';

const features = [
  {
    href: '/chat',
    icon: MessageCircle,
    title: '专家对话',
    desc: '多领域心理专家，简快身心积极疗法风格陪伴',
    color: 'bg-primary/10 text-primary',
  },
  {
    href: '/assessments',
    icon: ClipboardCheck,
    title: '心理自测',
    desc: '6套专业量表，快速了解你的心理状态',
    color: 'bg-warm/10 text-warm-foreground',
  },
  {
    href: '/appointment',
    icon: Calendar,
    title: '免费公益咨询',
    desc: '免费公益心理支持，线上/线下均可',
    color: 'bg-lavender/10 text-lavender-foreground',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/10 to-lavender/5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-warm/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-lavender/10 blur-3xl" />
        </div>
        <div className="relative max-w-lg mx-auto px-5 pt-12 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <span className="text-3xl">🌳</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">简快树洞</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              一个温暖的树洞，安放你的心事。<br />
              用简快身心积极疗法，陪你找到内在的力量。
            </p>
          </div>
        </div>
      </header>

      {/* Feature Cards */}
      <main className="max-w-lg mx-auto px-5 -mt-2">
        <div className="space-y-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="block bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all hover:shadow-sm animate-slide-up"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="mt-8 bg-secondary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">隐私与安全</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span>数据仅存本地</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>不上传服务器</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              <span>离线可用</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>一键清除</span>
            </div>
          </div>
        </div>

        {/* Crisis Banner */}
        <div className="mt-4 bg-crisis/5 border border-crisis/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-crisis flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">需要紧急帮助？</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                全国心理援助热线：<strong className="text-crisis">12356</strong>（24小时免费）<br />
                急救电话：<strong className="text-crisis">120</strong> / 报警电话：<strong className="text-crisis">110</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 mb-2 text-center text-[11px] text-muted-foreground/70 leading-relaxed px-4">
          本平台所有内容定位为心理陪伴与自助支持，非医学诊断，不承诺疗效。<br />
          免费公益咨询不能替代专业心理咨询与危机干预。<br />
          如有严重心理困扰，请及时寻求专业医疗机构帮助。
        </p>
        <p className="mb-4 text-center text-[10px] text-muted-foreground/50 leading-relaxed px-4">
          本网页为免费开源项目，代码开源共享，仅用于心理陪伴与自助支持。
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
