/**
 * 简快身心积极疗法风格的对话响应引擎
 * 流程：共情 → 问题聚焦 → 例外资源探索 → 小目标设定 → 行动建议
 */

import { Expert } from './experts';
import { detectCrisis, CRISIS_RESPONSE } from './crisis';

interface ResponseContext {
  expert: Expert;
  messageHistory: { role: 'user' | 'assistant'; content: string }[];
  userMessage: string;
}

/**
 * 根据对话阶段生成回复
 */
function getConversationPhase(historyLength: number): string {
  if (historyLength <= 1) return 'empathy';
  if (historyLength <= 3) return 'focus';
  if (historyLength <= 5) return 'exception';
  if (historyLength <= 7) return 'goal';
  return 'action';
}

/**
 * 生成共情阶段回复
 */
function generateEmpathyResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const templates = getEmpathyTemplates(expert.domain);
  const keyword = extractEmotionKeyword(userMessage);
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{keyword}', keyword).replace('{content}', userMessage.slice(0, 50));
}

/**
 * 生成问题聚焦阶段回复
 */
function generateFocusResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const templates = getFocusTemplates(expert.domain);
  const template = templates[Math.floor(Math.random() * templates.length)];
  const topic = extractTopic(userMessage, expert.domain);
  return template.replace('{topic}', topic);
}

/**
 * 生成例外资源探索阶段回复
 */
function generateExceptionResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  const templates = getExceptionTemplates(expert.domain);
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 生成小目标设定阶段回复
 */
function generateGoalResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  const templates = getGoalTemplates(expert.domain);
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 生成行动建议阶段回复
 */
function generateActionResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  const templates = getActionTemplates(expert.domain);
  const tool = expert.toolbox[Math.floor(Math.random() * expert.toolbox.length)];
  return templates[Math.floor(Math.random() * templates.length)].replace('{tool}', tool);
}

function extractEmotionKeyword(text: string): string {
  const emotions = ['难过', '焦虑', '生气', '害怕', '孤独', '疲惫', '迷茫', '委屈', '无助', '烦躁', '压力大', '失眠', '紧张', '失落'];
  for (const e of emotions) {
    if (text.includes(e)) return e;
  }
  return '困扰';
}

function extractTopic(text: string, domain: string): string {
  if (domain === 'child') return '孩子的情况';
  if (domain === 'teen') return '你面临的状况';
  if (domain === 'marriage') return '你们之间的关系';
  if (domain === 'family') return '家庭中的互动';
  return '你提到的情况';
}

// Domain-specific templates
function getEmpathyTemplates(domain: string): string[] {
  const common = [
    '我能感受到你此刻的心情。谢谢你愿意把这些告诉我，这需要勇气。你说的「{keyword}」的感受，很多人都会经历，你并不孤单。',
    '听到你这么说，我能体会到你内心承受了很多。{content}...这些确实让人不好受。你的感受是完全合理的。',
    '感谢你的信任。我能感受到你现在正经历一段不容易的时光。{keyword}的感觉一定让你很不好受吧。',
  ];
  if (domain === 'child') {
    return [...common, '作为家长，看到孩子受苦，心里一定很着急。你的关心本身就是孩子最大的资源。'];
  }
  if (domain === 'teen') {
    return [...common, '青春期的感受有时候真的很复杂，好像全世界都不理解自己。但你愿意说出来，这已经很棒了。'];
  }
  if (domain === 'marriage') {
    return [...common, '感情中的困扰往往最让人疲惫，因为涉及到我们最在意的人。你愿意来聊，说明你还在乎这段关系。'];
  }
  return common;
}

function getFocusTemplates(domain: string): string[] {
  const common = [
    '我想更了解一下，关于{topic}，你觉得最让你困扰的是哪个部分呢？是最近才发生的，还是已经持续一段时间了？',
    '你提到的{topic}，我想多了解一些。在什么情况下这种感觉会特别强烈？有没有什么特定的触发点？',
    '关于{topic}，如果用一个词来形容你现在的状态，你会用什么词呢？',
  ];
  if (domain === 'child') {
    return [...common, '孩子最近的行为或情绪变化，是从什么时候开始的呢？在那之前有没有发生什么特别的事情？'];
  }
  if (domain === 'teen') {
    return [...common, '你觉得现在最让你头疼的是哪方面？学业、朋友关系，还是和家人相处？'];
  }
  return common;
}

function getExceptionTemplates(domain: string): string[] {
  const common = [
    '在你描述的这些困难中，有没有一些时候情况会稍微好一点？哪怕只是一点点不同。那些时候发生了什么？',
    '回想过去一周，有没有哪个时刻你觉得「还不错」或者「没那么糟糕」？那时候你在做什么？和谁在一起？',
    '你觉得自己过去面对类似困难时，是用什么方式度过的？你身上有哪些力量是可以帮助自己的？',
  ];
  if (domain === 'child') {
    return [...common, '孩子有没有在某些时刻表现得比较好？那些时候周围的环境是怎样的？大人做了什么不一样的事？'];
  }
  if (domain === 'marriage') {
    return [...common, '在你们的关系中，有没有一些时刻是让你觉得温暖的？那时候你们是怎么互动的？'];
  }
  return common;
}

function getGoalTemplates(domain: string): string[] {
  const common = [
    '如果接下来的一周，情况能有一点点改善，你希望是哪方面先变好？不需要很大，一小步就好。',
    '想象一下，如果问题解决了，你的生活会有什么不同？你最先会做的一件小事是什么？',
    '我们来定一个小目标：这周你可以为自己做一件什么样的小事，让自己感觉好一点点？',
  ];
  if (domain === 'child') {
    return [...common, '关于孩子，这周我们可以尝试做一件什么样的小改变？哪怕是很小的一步。'];
  }
  if (domain === 'teen') {
    return [...common, '如果这周你可以为自己做一件小事让自己感觉好一点，那会是什么？'];
  }
  return common;
}

function getActionTemplates(domain: string): string[] {
  const common = [
    '基于我们的交流，我想建议你尝试一下「{tool}」的方法。具体来说，你可以每天花5分钟，在一个安静的地方，写下今天让你感觉不错的3件小事。不需要多大的事，一杯好喝的水、一个好天气都算。',
    '我建议你试试用「{tool}」的方式来调整。关键点是：当你感到困扰时，先停下来做3次深呼吸，然后问自己「此刻我能做的一件小事是什么」。',
    '根据我们聊的内容，你可以试试「{tool}」这个方法。记住，改变不需要很大，每天进步一点点就很好。如果感觉难以独自应对，也可以考虑预约面对面的咨询。',
    '\n\n⚠️ 温馨提示：我的建议仅供参考，不构成医学诊断或治疗方案。如果困扰持续影响你的生活，建议寻求专业咨询师的帮助。\n\n你可以点击下方「预约咨询」，与专业咨询师面对面交流。',
  ];
  if (domain === 'child') {
    return [...common, '关于孩子的情况，建议你可以尝试「{tool}」的方法。同时，家长的稳定情绪是孩子最大的安全感来源，也请照顾好自己。'];
  }
  return common;
}

/**
 * 主响应生成函数
 */
export function generateResponse(ctx: ResponseContext): string {
  // 1. 危机检测（最高优先级）
  const crisisCheck = detectCrisis(ctx.userMessage);
  if (crisisCheck.isCrisis) {
    return CRISIS_RESPONSE;
  }

  // 2. 根据对话阶段生成回复
  const phase = getConversationPhase(ctx.messageHistory.length);

  switch (phase) {
    case 'empathy':
      return generateEmpathyResponse(ctx);
    case 'focus':
      return generateFocusResponse(ctx);
    case 'exception':
      return generateExceptionResponse(ctx);
    case 'goal':
      return generateGoalResponse(ctx);
    case 'action':
      return generateActionResponse(ctx);
    default:
      return generateEmpathyResponse(ctx);
  }
}
