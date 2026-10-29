'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { isDisclaimerAgreed, setDisclaimerAgreed } from '@/lib/storage';

interface DisclaimerContextType {
  agreed: boolean;
  setAgreed: () => void;
}

const DisclaimerContext = createContext<DisclaimerContextType>({
  agreed: false,
  setAgreed: () => {},
});

export function useDisclaimer() {
  return useContext(DisclaimerContext);
}

export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const [agreed, setAgreedState] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasAgreed = isDisclaimerAgreed();
    if (hasAgreed) {
      setAgreedState(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleAgree = () => {
    setDisclaimerAgreed();
    setAgreedState(true);
    setShowModal(false);
  };

  return (
    <DisclaimerContext.Provider value={{ agreed, setAgreed: handleAgree }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 max-w-lg w-full bg-card rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🌿</div>
              <h2 className="text-xl font-bold text-foreground">欢迎来到简快树洞</h2>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed mb-6">
              <p className="font-medium text-foreground">在开始之前，请了解以下事项：</p>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <p>1. <strong>定位说明</strong>：本平台所有内容定位为心理陪伴与自助支持，<strong>非医学诊断</strong>，不能替代专业医疗。</p>
                <p>2. <strong>隐私保护</strong>：你的所有数据仅保存在本地浏览器中，不会上传至任何服务器，支持一键清除。</p>
                <p>3. <strong>危机说明</strong>：如果你正处于心理危机中，请立即拨打全国心理援助热线 <strong className="text-crisis">12356</strong> 或急救电话 <strong className="text-crisis">120</strong>。</p>
                <p>4. <strong>不承诺疗效</strong>：对话和建议仅供参考，每个人的情况不同，效果因人而异。免费公益咨询不能替代专业心理咨询与危机干预。</p>
                <p>5. <strong>开源声明</strong>：本网页为免费开源项目，代码开源共享，仅用于心理陪伴与自助支持，不包含任何商业收费内容。</p>
              </div>
              <p className="text-xs text-center">继续使用即表示你已阅读并同意以上声明</p>
            </div>

            <button
              onClick={handleAgree}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              我已了解，开始使用
            </button>
          </div>
        </div>
      )}
    </DisclaimerContext.Provider>
  );
}
