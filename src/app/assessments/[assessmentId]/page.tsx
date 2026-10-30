'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssessmentById } from '@/lib/assessments';
import { saveAssessmentRecord, type AssessmentRecord } from '@/lib/storage';
import { ASSESSMENT_CRISIS_RESPONSE } from '@/lib/crisis';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;
  const assessment = getAssessmentById(assessmentId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [crisisTriggered, setCrisisTriggered] = useState(false);

  const currentQuestion = assessment?.questions[currentIndex];
  const totalQuestions = assessment?.questions.length ?? 0;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, v) => sum + v, 0);
  }, [answers]);

  const result = useMemo(() => {
    if (!assessment || !showResult) return null;
    return assessment.results.find(
      (r) => totalScore >= r.scoreRange[0] && totalScore <= r.scoreRange[1]
    ) ?? assessment.results[assessment.results.length - 1];
  }, [assessment, totalScore, showResult]);

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">测评不存在</p>
      </div>
    );
  }

  const handleSelect = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));

    // Check crisis item
    const question = assessment.questions.find((q) => q.id === questionId);
    if (question?.isCrisis && score >= (assessment.crisisScore ?? 2)) {
      setCrisisTriggered(true);
    }

    // Auto advance after delay
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Show result
        setShowResult(true);
        // Save record
        const record: AssessmentRecord = {
          id: `assess_${Date.now()}`,
          type: assessment.id,
          title: assessment.title,
          answers: { ...answers, [questionId]: score },
          totalScore: Object.values(answers).reduce((s, v) => s + v, 0) + score,
          result: '',
          suggestion: '',
          recommendedExpert: '',
          crisisTriggered: question?.isCrisis === true && score >= (assessment.crisisScore ?? 2),
          createdAt: Date.now(),
        };
        saveAssessmentRecord(record);
      }
    }, 300);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setCrisisTriggered(false);
  };

  // Result view
  if (showResult && result) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader
          title={`${assessment.title} · 结果`}
          subtitle="结果只保存在你自己的设备上"
          backTo="/assessments"
        />

        <main className="max-w-lg mx-auto px-5 py-6">
          {/* Crisis Alert */}
          {crisisTriggered && (
            <div className="mb-6 bg-crisis/10 border border-crisis/20 rounded-2xl p-5 animate-slide-up">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-crisis flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-crisis mb-2">重要提醒</p>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {ASSESSMENT_CRISIS_RESPONSE}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Card */}
          <div className="card-soft p-6 text-center mb-4 animate-slide-up">
            <div className="text-4xl mb-3">{assessment.icon}</div>
            <h2 className="text-xl font-bold text-foreground mb-2">{result.level}</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-4">
              <span className="text-sm text-muted-foreground">总分</span>
              <span className="text-lg font-bold text-primary">{totalScore}</span>
              <span className="text-sm text-muted-foreground">/ {totalQuestions * 3}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
          </div>

          {/* Suggestion */}
          <div className="bg-secondary/30 rounded-2xl p-5 mb-4 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              建议
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.suggestion}</p>
          </div>

          {/* Recommended Expert */}
          <div className="bg-primary/5 rounded-2xl p-5 mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-2">推荐专家</h3>
            <p className="text-sm text-muted-foreground mb-3">
              根据你的测评结果，推荐你咨询 <strong className="text-foreground">{getExpertName(result.recommendedExpert)}</strong>
            </p>
            <button
              onClick={() => router.push(`/chat/${result.recommendedExpert}`)}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              开始对话
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重新测评
            </button>
            <button
              onClick={() => router.push('/assessments')}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              返回自测中心
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Question view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title={assessment.title}
        subtitle={`第 ${currentIndex + 1} / ${totalQuestions} 题 · 凭直觉选就好`}
        backTo="/assessments"
        hideBadge
      >
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </PageHeader>

      {/* Question */}
      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="animate-fade-in" key={currentIndex}>
          <h2 className="text-lg font-medium text-foreground mb-8 leading-relaxed">
            {currentQuestion?.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((opt, i) => {
              const isSelected = answers[currentQuestion.id] === opt.score;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(currentQuestion.id, opt.score)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-card border-border hover:border-primary/30 text-foreground'
                  }`}
                >
                  <span className="text-sm">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            上一题
          </button>
          <span className="text-xs text-muted-foreground self-center">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <button
            onClick={() => {
              if (currentIndex < totalQuestions - 1) setCurrentIndex((prev) => prev + 1);
            }}
            disabled={currentIndex >= totalQuestions - 1 || !answers[currentQuestion?.id ?? '']}
            className="flex items-center gap-1 px-4 py-2 text-sm text-primary hover:text-primary/80 disabled:opacity-30 transition-opacity"
          >
            下一题
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function getExpertName(id: string): string {
  const map: Record<string, string> = {
    child: '林老师（儿童心理专家）',
    teen: '陈老师（青少年心理专家）',
    marriage: '王老师（婚恋关系专家）',
    family: '张老师（家庭教育专家）',
    general: '李老师（综合心理专家）',
  };
  return map[id] ?? '李老师（综合心理专家）';
}
