'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getExpertById } from '@/lib/experts';
import { generateResponse } from '@/lib/chat-engine';
import { detectCrisis } from '@/lib/crisis';
import { getChatRecords, saveChatRecord, type ChatMessage, type ChatRecord } from '@/lib/storage';
import { ArrowLeft, Send, Phone, AlertTriangle } from 'lucide-react';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const expertId = params.expertId as string;
  const expert = getExpertById(expertId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState('');
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat
  useEffect(() => {
    if (!expert) return;
    const id = `chat_${expertId}_${Date.now()}`;
    setChatId(id);

    // Check for existing chat
    const records = getChatRecords();
    const existing = records.find((r) => r.expertId === expertId);
    if (existing && existing.messages.length > 0) {
      setMessages(existing.messages);
      setChatId(existing.id);
    } else {
      const greeting: ChatMessage = {
        role: 'assistant',
        content: expert.greeting,
        timestamp: Date.now(),
      };
      setMessages([greeting]);
    }
  }, [expert, expertId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !expert || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Check crisis
    const crisisCheck = detectCrisis(input.trim());
    if (crisisCheck.isCrisis) {
      setShowCrisisBanner(true);
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Generate response with delay for natural feel
    setTimeout(() => {
      const response = generateResponse({
        expert,
        messageHistory: newMessages,
        userMessage: userMessage.content,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      // Save to localStorage
      const record: ChatRecord = {
        id: chatId,
        expertId: expert.id,
        expertName: expert.name,
        messages: [...newMessages, assistantMessage],
        createdAt: Date.now() - newMessages.length * 60000,
        updatedAt: Date.now(),
      };
      saveChatRecord(record);
    }, 800 + Math.random() * 1200);
  }, [input, expert, isTyping, messages, chatId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">专家不存在</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/chat')} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            {expert.avatar}
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground text-sm">{expert.name}</h1>
            <p className="text-xs text-muted-foreground">{expert.domainLabel}</p>
          </div>
        </div>
      </header>

      {/* Crisis Banner */}
      {showCrisisBanner && (
        <div className="flex-shrink-0 bg-crisis/10 border-b border-crisis/20 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-crisis flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-crisis font-medium">检测到你可能正经历严重困扰</p>
              <p className="text-xs text-muted-foreground mt-1">
                请拨打 <strong className="text-crisis">12356</strong> 获取24小时专业帮助
              </p>
            </div>
            <button onClick={() => setShowCrisisBanner(false)} className="text-xs text-muted-foreground underline">
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex animate-bubble-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border rounded-bl-md'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{formatMessage(msg.content)}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-bubble-in">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="说说你的想法..."
                rows={1}
                className="w-full resize-none rounded-xl bg-secondary/50 border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                style={{ maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-muted-foreground">
              按 Enter 发送，Shift+Enter 换行
            </p>
            <a
              href="tel:12356"
              className="flex items-center gap-1 text-[10px] text-crisis hover:underline"
            >
              <Phone className="w-3 h-3" />
              紧急热线 12356
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMessage(content: string): React.ReactNode {
  // Simple markdown-like formatting
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold text
    const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <span key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
      </span>
    );
  });
}
