'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { saveAppointmentRecord, type AppointmentRecord } from '@/lib/storage';
import { ArrowLeft, MapPin, Clock, CreditCard, MessageSquare, CheckCircle, Phone, Copy } from 'lucide-react';

const consultationTypes = [
  { id: 'individual', label: '个体咨询', desc: '一对一深度咨询' },
  { id: 'couple', label: '伴侣咨询', desc: '双人关系咨询' },
  { id: 'family', label: '家庭咨询', desc: '家庭成员共同参与' },
  { id: 'child', label: '儿童咨询', desc: '儿童心理评估与辅导' },
  { id: 'teen', label: '青少年咨询', desc: '青少年心理支持' },
];

export default function AppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    preferredTime: '',
    consultationType: '',
    description: '',
    contactName: '',
    contactPhone: '',
  });
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (!formData.preferredTime || !formData.consultationType || !formData.contactName || !formData.contactPhone) {
      alert('请填写必要信息');
      return;
    }

    const record: AppointmentRecord = {
      id: `appt_${Date.now()}`,
      preferredTime: formData.preferredTime,
      consultationType: formData.consultationType,
      description: formData.description,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      createdAt: Date.now(),
    };
    saveAppointmentRecord(record);
    setStep('success');
  };

  const handleCopyWechat = () => {
    navigator.clipboard.writeText('13737983666').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen pb-20 bg-background">
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-5 py-4">
            <h1 className="text-lg font-bold text-foreground">预约提交成功</h1>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-5 py-8">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">预约已提交</h2>
            <p className="text-sm text-muted-foreground">请添加咨询师微信确认预约详情</p>
          </div>

          {/* WeChat Contact */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 animate-slide-up">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">添加咨询师微信</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-2xl font-bold text-foreground tracking-wider">13737983666</span>
                <button
                  onClick={handleCopyWechat}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-primary mb-3">已复制到剪贴板</p>
              )}
              <p className="text-xs text-muted-foreground">
                添加时请备注「简快树洞预约」
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-3 animate-slide-up">
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">收费标准</p>
                  <p className="text-xs text-muted-foreground mt-1">个体咨询：300元 / 50分钟</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">改期规则</p>
                  <p className="text-xs text-muted-foreground mt-1">提前24小时可免费改期或取消</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">咨询方式</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    线下：广西宜州区第三人民医院<br />
                    线上：视频咨询（微信沟通确认）
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">支付方式</p>
                  <p className="text-xs text-muted-foreground mt-1">支持微信支付 / 支付宝</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            返回首页
          </button>
        </main>

        <BottomNav />
      </div>
    );
  }

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
              <h1 className="text-lg font-bold text-foreground">预约咨询</h1>
              <p className="text-xs text-muted-foreground">专业咨询师为你服务</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-4">
        {/* Info Banner */}
        <div className="bg-primary/5 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">预约流程</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                填写预约信息 → 添加咨询师微信确认 → 按时咨询
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Consultation Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              咨询类型 <span className="text-crisis">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {consultationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData((prev) => ({ ...prev, consultationType: type.label }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.consultationType === type.label
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              意向时间 <span className="text-crisis">*</span>
            </label>
            <input
              type="text"
              value={formData.preferredTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))}
              placeholder="如：每周三下午 / 尽快安排"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              诉求描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="简要描述你想咨询的内容（选填）"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              姓名 <span className="text-crisis">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
              placeholder="你的称呼"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              联系电话 <span className="text-crisis">*</span>
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="方便联系的手机号"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 bg-secondary/30 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">个体咨询</span>
            <span className="text-foreground font-medium">300元 / 50分钟</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">支付方式</span>
            <span className="text-foreground">微信 / 支付宝</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">改期规则</span>
            <span className="text-foreground">提前24小时免费</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">咨询方式</span>
            <span className="text-foreground">线下 / 线上视频</span>
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 bg-secondary/30 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">线下地址</p>
              <p className="text-xs text-muted-foreground mt-1">广西宜州区第三人民医院</p>
              <p className="text-xs text-muted-foreground">也支持线上视频咨询</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          提交预约
        </button>

        {/* Contact */}
        <div className="mt-4 text-center">
          <a
            href="tel:13737983666"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4" />
            直接联系咨询师：13737983666
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
