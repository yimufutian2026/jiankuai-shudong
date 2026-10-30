'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BottomNav } from '@/components/bottom-nav';
import {
  MessageCircle,
  ClipboardCheck,
  Calendar,
  Armchair,
  ShieldCheck,
  Zap,
  Phone,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';

const advantages = [
  {
    icon: Armchair,
    title: '在家自我疗愈',
    desc: '随时随地，不出门不预约，在家就能获得共建式心理支持。孩子和普通人都适用。',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: ShieldCheck,
    title: '100% 隐私保护',
    desc: '所有内容只保存在你自己的设备上，绝不告诉任何人。不上传、不留痕、支持一键清除。',
    color: 'bg-warm/10 text-warm-foreground',
  },
  {
    icon: Zap,
    title: '简快高效',
    desc: '聚焦解决问题，几轮对话给到结构化建议，不赘不断。',
    color: 'bg-lavender/10 text-lavender-foreground',
  },
];

const features = [
  {
    href: '/chat',
    icon: MessageCircle,
    title: '专家对话',
    desc: '儿童 / 青少年 / 婚恋 / 家庭 / 综合，五个方向的专业陪伴',
  },
  {
    href: '/assessments',
    icon: ClipboardCheck,
    title: '心理自测',
    desc: '6 套量表，快速了解自己的状态',
  },
  {
    href: '/appointment',
    icon: Calendar,
    title: '免费公益咨询',
    desc: '免费公益心理支持，线上 / 线下均可',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20">
      {/* 顶部导航：品牌 + slogan + 本地存储状态标签 */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🌿</span>
            <div className="min-w-0">
              <span className="font-bold text-foreground">简快树洞</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                在家自我疗愈 · 隐私保护
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">本地存储 · 不上传</span>
          </div>
        </div>
      </nav>

      {/* Hero：左侧文案 + 右侧居家插画 */}
      <header className="bg-gradient-to-br from-warm/10 via-background to-primary/5">
        <div className="max-w-3xl mx-auto px-5 pt-8 pb-10 md:pt-14 md:pb-14 grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
              <Lock className="w-3 h-3" />
              <span>这里只有你知道，可以放心说</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-snug mb-4">
              在自己的房间，
              <br />
              也能好好照顾自己
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              不出门、不预约、不必告诉任何人。共建式心理陪伴 + 快速自测量表 +
              结构化建议——所有对话只保存在你自己的设备上。
            </p>
            <div className="flex flex-wrap gap-3 mb-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                开始咨询
              </Link>
              <Link
                href="/assessments"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground rounded-xl px-6 py-3 font-medium hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                <ClipboardCheck className="w-4 h-4" />
                免费心理测评
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              AI 生成内容仅供参考，不构成医疗诊断或治疗建议。
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border/60 shadow-lg animate-fade-in">
            <Image
              src="/hero-home.jpg"
              alt="温馨居家自我疗愈场景：一个人在自己的房间里安心独处"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5">
        {/* 三张优势卡 */}
        <section className="grid sm:grid-cols-3 gap-3 -mt-2">
          {advantages.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.title}
                className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all hover:shadow-sm"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${a.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            );
          })}
        </section>

        {/* 功能入口 */}
        <section className="mt-6 space-y-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group flex items-center gap-4 bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all hover:shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </section>

        {/* 危机提示（保留不动） */}
        <div className="mt-6 bg-crisis/5 border border-crisis/20 rounded-2xl p-4">
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

        {/* 免责声明（保留不动） */}
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
