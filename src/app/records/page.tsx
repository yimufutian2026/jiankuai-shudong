'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import {
  getChatRecords,
  getAssessmentRecords,
  getAppointmentRecords,
  deleteChatRecord,
  clearAllRecords,
  exportAllRecords,
  type ChatRecord,
  type AssessmentRecord,
  type AppointmentRecord,
} from '@/lib/storage';
import { ArrowLeft, MessageCircle, ClipboardCheck, Calendar, Trash2, Download, AlertTriangle } from 'lucide-react';

type TabType = 'chat' | 'assessment' | 'appointment';

export default function RecordsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [chatRecords, setChatRecords] = useState<ChatRecord[]>([]);
  const [assessmentRecords, setAssessmentRecords] = useState<AssessmentRecord[]>([]);
  const [appointmentRecords, setAppointmentRecords] = useState<AppointmentRecord[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setChatRecords(getChatRecords());
    setAssessmentRecords(getAssessmentRecords());
    setAppointmentRecords(getAppointmentRecords());
  };

  const handleDeleteChat = (id: string) => {
    deleteChatRecord(id);
    loadData();
  };

  const handleClearAll = () => {
    clearAllRecords();
    loadData();
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    const data = exportAllRecords();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `简快树洞_记录导出_${new Date().toLocaleDateString('zh-CN')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'chat' as const, label: '对话记录', icon: MessageCircle },
    { id: 'assessment' as const, label: '测评记录', icon: ClipboardCheck },
    { id: 'appointment' as const, label: '预约记录', icon: Calendar },
  ];

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">我的记录</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="导出记录"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-crisis hover:bg-crisis/10 transition-colors"
                title="清除所有记录"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Records */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {chatRecords.length === 0 ? (
              <EmptyState text="暂无对话记录" />
            ) : (
              chatRecords.map((record) => (
                <div key={record.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{record.expertName}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(record.updatedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{record.messages.length} 条消息</span>
                      <button
                        onClick={() => handleDeleteChat(record.id)}
                        className="p-1 text-muted-foreground hover:text-crisis transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {record.messages[record.messages.length - 1]?.content.slice(0, 100)}...
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Assessment Records */}
        {activeTab === 'assessment' && (
          <div className="space-y-3">
            {assessmentRecords.length === 0 ? (
              <EmptyState text="暂无测评记录" />
            ) : (
              assessmentRecords.map((record) => (
                <div key={record.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{record.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.crisisTriggered && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-crisis/10 text-crisis">需关注</span>
                      )}
                      <span className="text-sm font-bold text-primary">{record.totalScore} 分</span>
                    </div>
                  </div>
                  {record.result && (
                    <p className="text-xs text-muted-foreground">{record.result}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Appointment Records */}
        {activeTab === 'appointment' && (
          <div className="space-y-3">
            {appointmentRecords.length === 0 ? (
              <EmptyState text="暂无预约记录" />
            ) : (
              appointmentRecords.map((record) => (
                <div key={record.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-foreground">{record.consultationType}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>意向时间：{record.preferredTime}</p>
                    <p>联系人：{record.contactName}</p>
                    {record.description && <p>诉求：{record.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 max-w-sm w-full bg-card rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-crisis/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-crisis" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">确认清除</h3>
                <p className="text-xs text-muted-foreground">此操作不可恢复</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              将清除所有对话记录、测评记录和预约记录。数据仅保存在本地，清除后无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 bg-crisis text-crisis-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3 opacity-40">📝</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
