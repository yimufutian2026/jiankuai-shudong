/**
 * 简快身心积极疗法风格的对话响应引擎
 * 流程：共情 → 问题聚焦 → 例外资源探索 → 小目标设定 → 行动建议
 *
 * 优化要点：
 * 1. 共情阶段动态提取用户消息中的具体情境/行为关键词（如“大哭大闹”“不想上学”）
 * 2. 阶段推进按“用户消息条数 + 最近消息内容信号”双因素决定，而非纯条数硬切
 * 3. 儿童域（child）提供差异化例外/小目标/行动模板
 * 4. 行动阶段识别具体问题主题，给出针对性方法与贴合的工具箱推荐
 *
 * 安全边界：危机识别（crisis.ts）为最高优先级，免责声明话术保持原样，纯本地规则引擎。
 */

import type { Expert } from './experts';
import { detectCrisis, CRISIS_RESPONSE } from './crisis';

interface ResponseContext {
  expert: Expert;
  messageHistory: { role: 'user' | 'assistant'; content: string }[];
  userMessage: string;
}

type Phase = 'empathy' | 'focus' | 'exception' | 'goal' | 'action';

const PHASE_ORDER: Phase[] = ['empathy', 'focus', 'exception', 'goal', 'action'];

/**
 * 问题主题表：用于内容感知的阶段推进与针对性回应
 * keywords   —— 用户消息中的具体行为/事件词
 * label      —— 共情/聚焦中引用的问题短语
 * focusProbe —— 聚焦阶段针对性追问
 * actionTip  —— 行动阶段针对性方法
 * tools      —— 优先推荐的工具箱方法（按名称匹配专家 toolbox）
 * domains    —— 限定生效领域，缺省为通用
 */
interface ProblemTopic {
  id: string;
  keywords: string[];
  label: string;
  focusProbe: string;
  actionTip: string;
  tools?: string[];
  domains?: string[];
}

const PROBLEM_TOPICS: ProblemTopic[] = [
  // ---------- 儿童域 ----------
  {
    id: 'tantrum',
    domains: ['child'],
    keywords: ['大哭大闹', '哭闹', '发脾气', '撒泼', '躺地上', '情绪失控'],
    label: '孩子哭闹发脾气',
    focusProbe: '孩子发脾气通常在什么情况下最容易出现？是累了、饿了，还是被拒绝之后？发完脾气后他一般是怎么平静下来的？',
    actionTip: '试试「情绪命名法」：在孩子平静下来后，帮他把感受说出来——“刚才你很生气，因为想要那个玩具，对吗？”被命名的情绪更容易被消化。也可以在家设置一个「冷静角」（放上抱枕和绘本），告诉孩子那里是可以安心平静的地方，这不是惩罚，而是陪伴。',
    tools: ['亲子互动指导', '游戏治疗'],
  },
  {
    id: 'school_refusal',
    domains: ['child'],
    keywords: ['不想上学', '不上学', '不肯上学', '不愿去学校', '拒学', '不去幼儿园', '入园焦虑', '分离焦虑'],
    label: '孩子不想上学',
    focusProbe: '孩子是从什么时候开始不想去学校的？学校里有没有发生什么让他不舒服的事，比如和同学相处、或者害怕某个环节？',
    actionTip: '先接纳再了解：早上不催促、不指责，试着问“妈妈知道你不太想去学校，能和我说说学校里的感觉吗？”同时和班主任保持沟通，了解孩子在园/在校的真实状态；放学后安排一段轻松的亲子时光，避免反复追问“今天为什么不高兴”。',
    tools: ['沙盘治疗', '游戏治疗'],
  },
  {
    id: 'bullied',
    domains: ['child', 'teen'],
    keywords: ['被欺负', '校园欺凌', '被同学欺负', '被排挤', '被孤立', '被嘲笑'],
    label: '孩子被欺负的经历',
    focusProbe: '这种情况持续多久了？发生在学校还是上下学路上？老师知道吗？孩子自己是怎么应对的？',
    actionTip: '首先明确告诉孩子：“被欺负不是你的错，谢谢你愿意告诉我。”认真倾听、不责怪孩子软弱。及时与学校老师沟通具体情况，家校配合处理；平时可以通过角色扮演，教孩子大声说“不”、离开现场、向大人求助。',
    tools: ['沙盘治疗', '绘画投射'],
  },
  {
    id: 'aggression',
    domains: ['child'],
    keywords: ['打人', '咬人', '推人', '抓人', '动手打', '攻击小朋友'],
    label: '孩子出现动手行为',
    focusProbe: '孩子动手通常发生在和谁、什么情境下？动手之前发生了什么，动手之后大人是怎么反应的？',
    actionTip: '先冷静而坚定地制止动作（轻轻抓住手、蹲下来平视），简短说“不可以打人”，然后帮孩子说出背后的情绪：“你很生气，因为积木被拿走了。”事后和孩子一起演练替代方式：“下次可以说‘请还给我’。”规则要提前约定，全家一致执行。',
    tools: ['行为观察分析', '亲子互动指导'],
  },
  {
    id: 'sleep_child',
    domains: ['child'],
    keywords: ['不睡觉', '入睡困难', '不肯睡', '晚睡', '夜醒', '做噩梦'],
    label: '孩子的睡眠问题',
    focusProbe: '孩子入睡困难大概持续多久了？睡前一小时通常在做什么，有没有看屏幕或者特别兴奋的活动？',
    actionTip: '规律作息 + 睡前仪式：固定睡觉和起床时间，睡前30-60分钟进入“安静程序”（洗澡→绘本→拥抱→关灯），睡前一小时远离电子屏幕。孩子夜醒时保持安静、简短地安抚，不开灯不玩耍。',
    tools: ['亲子互动指导'],
  },
  {
    id: 'attention',
    domains: ['child'],
    keywords: ['注意力不集中', '注意力', '坐不住', '多动', '分心', '走神', '专注力'],
    label: '孩子的注意力问题',
    focusProbe: '孩子做什么活动时能专注比较久？玩积木、看绘本的时候能坐得住吗，还是几乎所有事情都很难集中？',
    actionTip: '把任务切小 + 即时反馈：把作业分成10-15分钟的小段，每完成一段给予具体肯定（“这15分钟你一直很专心”）。桌面上只留当前任务，用计时器把“专注”变成游戏。如果孩子连喜欢的事也很难集中，建议寻求专业评估。',
    tools: ['行为观察分析', '游戏治疗'],
  },
  {
    id: 'screen',
    domains: ['child', 'teen', 'family'],
    keywords: ['沉迷手机', '玩手机', '玩游戏', '平板', '短视频', '网瘾', '刷视频'],
    label: '孩子沉迷电子屏幕',
    focusProbe: '孩子每天大概用多长时间屏幕？通常是在什么情况下拿到手机/平板的？不给玩的时候他是什么反应？',
    actionTip: '约定先行：和孩子一起制定“屏幕时间约定”（时长 + 使用场景），用闹钟代替家长催促。关键是提供替代活动——亲子游戏、户外运动，让现实生活比屏幕更有趣。家长自己也要示范少刷手机。',
    tools: ['亲子互动指导'],
  },
  {
    id: 'homework',
    domains: ['child', 'family'],
    keywords: ['写作业', '作业拖拉', '作业磨蹭', '做作业', '成绩下降', '厌学'],
    label: '孩子的学习与作业',
    focusProbe: '孩子写作业磨蹭时，具体在做什么？是发呆、玩东西，还是频繁喊你？题目对他来说难不难？',
    actionTip: '固定作业流程：回家先休息15分钟 → 固定书桌 → 先易后难。家长做“陪伴者”而不是“监工”，和孩子在同一空间安静做自己的事即可。用“完成后我们一起……”代替催促和批评。',
    tools: ['行为观察分析', '亲子互动指导'],
  },
  // ---------- 青少年/家庭/婚恋/综合 ----------
  {
    id: 'parent_child_conflict',
    domains: ['teen', 'family'],
    keywords: ['顶嘴', '叛逆', '不听话', '对着干', '拒绝交流', '不沟通', '关上房门'],
    label: '亲子间的冲突与疏远',
    focusProbe: '你们最近一次好好说话是什么时候？冲突通常在什么话题上爆发？爆发之后家里是什么气氛？',
    actionTip: '每天15分钟“不评价时间”：只听孩子说，不批评、不指导、不给建议。把“你作业写完了吗”换成“今天学校有什么好玩的事吗”。关系先于教育，联结修复了，沟通才会回来。',
    tools: ['非暴力沟通', '叙事治疗'],
  },
  {
    id: 'academic_pressure',
    domains: ['teen'],
    keywords: ['考试', '成绩', '排名', '升学', '学习压力', '考砸'],
    label: '学业压力',
    focusProbe: '这种压力更多来自自己对自己的要求，还是来自父母老师的期待？压力最大的时候，你身体上有什么感觉？',
    actionTip: '把“大目标”拆成“下一小步”：不谈期末考多少分，只定“今晚弄懂这一道错题”。睡前写下今天完成的3件小事，训练大脑关注“已做到”而不是“还不够”。',
    tools: ['认知行为疗法', '正念减压'],
  },
  {
    id: 'couple_conflict',
    domains: ['marriage'],
    keywords: ['吵架', '冷战', '争执', '拌嘴', '闹矛盾'],
    label: '你们之间的冲突',
    focusProbe: '你们的冲突通常由什么事情引发？吵完之后是怎么和好的，还是一直冷着？',
    actionTip: '和伴侣约定一个“暂停信号”：任何一方说出约定词，双方暂停20分钟，等情绪降温再谈。表达时用“我感到……”代替“你总是……”，指责会唤起防御，感受会唤起理解。',
    tools: ['沟通分析', '情绪聚焦疗法(EFT)'],
  },
  {
    id: 'trust',
    domains: ['marriage'],
    keywords: ['出轨', '背叛', '怀疑', '查手机', '不信任', '外遇'],
    label: '信任危机',
    focusProbe: '这种不信任感是从什么时候开始的？在那之前，你们的关系是什么样的？',
    actionTip: '信任的重建需要“透明 + 时间”：双方约定一段坦诚期，主动分享行程与感受；受伤一方可以表达不安，但避免用查岗代替沟通。如果反复陷入猜疑循环，建议寻求专业的婚恋咨询支持。',
    tools: ['依恋理论', '情绪聚焦疗法(EFT)'],
  },
  {
    id: 'insomnia',
    domains: ['general', 'teen', 'marriage', 'family'],
    keywords: ['失眠', '睡不着', '睡不好', '熬夜', '睡不好觉'],
    label: '睡眠困扰',
    focusProbe: '睡不着的时候，脑子里通常在想什么？这种状态持续多久了，白天精神状态怎么样？',
    actionTip: '睡前一小时调暗灯光、远离屏幕；如果躺下20分钟仍睡不着，起身做点放松的事（如听轻音乐）再回床。固定起床时间比固定入睡时间更重要，白天适量运动但睡前3小时避免剧烈运动。',
    tools: ['正念减压', '认知行为疗法'],
  },
  {
    id: 'anxiety_stress',
    keywords: ['焦虑', '压力大', '紧张', '心慌', '不安', '崩溃'],
    label: '焦虑与压力',
    focusProbe: '这种紧张感通常在什么时候最强烈？如果给现在的压力打0-10分，你会打几分？',
    actionTip: '试试“478呼吸法”：吸气4秒、屏息7秒、呼气8秒，重复4轮，能快速安抚神经系统。再把担心的事写下来，分成“能行动的”和“只能接受的”两列，从“能行动的”那一列里挑一件最小的事去做。',
    tools: ['正念减压', '认知行为疗法'],
  },
  {
    id: 'low_mood',
    keywords: ['情绪低落', '提不起劲', '没兴趣', '空虚', '郁闷', '不开心'],
    label: '情绪状态',
    focusProbe: '这种低落的状态持续多久了？吃饭、睡觉、工作/学习有受到影响吗？',
    actionTip: '从“行为激活”开始：不等心情好了才行动，而是先做一点点行动让心情有机会变好。今天只定一个最小目标——出门走10分钟、晒晒太阳，或者给自己做一顿简单的饭。如果低落持续两周以上并影响生活，建议寻求专业帮助。',
    tools: ['认知行为疗法', '积极心理学'],
  },
];

/**
 * 例外线索：用户在回应探究时给出的“问题没那么糟”的信号
 */
const EXCEPTION_CLUES: string[] = [
  '没那么糟', '好一点', '好了一点', '还不错', '也有好',
  '乖的时候', '配合的时候', '听话的时候', '不闹的时候',
  '安静的时候', '心情好的时候', '有时候还行', '有时候没',
  '除外', '除非', '偶尔能', '偶尔还',
];

/**
 * 统计历史中的用户消息数（历史里包含专家开场白，不能直接用 length）
 */
function countUserMessages(history: ResponseContext['messageHistory']): number {
  return history.filter((m) => m.role === 'user').length;
}

/**
 * 收集最近的用户发言文本（含当前这条），用于内容信号判断
 */
function collectRecentUserText(ctx: ResponseContext, count = 3): string {
  const recent = ctx.messageHistory
    .filter((m) => m.role === 'user')
    .slice(-count)
    .map((m) => m.content);
  return [...recent, ctx.userMessage].join(' ');
}

/**
 * 匹配问题主题（领域过滤 + 关键词命中）
 */
function matchProblemTopic(text: string, domain: string): ProblemTopic | null {
  for (const topic of PROBLEM_TOPICS) {
    if (topic.domains && !topic.domains.includes(domain)) continue;
    for (const kw of topic.keywords) {
      if (text.includes(kw)) return topic;
    }
  }
  return null;
}

/**
 * 基于用户消息条数的阶段下限（保证流程单调前进）
 */
function phaseFloorByCount(userMsgCount: number): Phase {
  if (userMsgCount <= 1) return 'empathy';
  if (userMsgCount <= 2) return 'focus';
  if (userMsgCount <= 3) return 'exception';
  if (userMsgCount <= 4) return 'goal';
  return 'action';
}

/**
 * 基于最近消息内容的阶段信号：
 * - 命中具体问题主题 → 至少进入 focus
 * - 命中例外线索     → 至少进入 exception
 */
function detectContentPhase(ctx: ResponseContext): Phase | null {
  const text = collectRecentUserText(ctx, 2);
  if (EXCEPTION_CLUES.some((k) => text.includes(k))) return 'exception';
  if (matchProblemTopic(text, ctx.expert.domain)) return 'focus';
  return null;
}

/**
 * 阶段判定：条数下限 + 内容信号加速，只前进不后退。
 * 首轮固定共情（先接住情绪，再聚焦问题）。
 */
function getConversationPhase(ctx: ResponseContext): Phase {
  const userMsgCount = countUserMessages(ctx.messageHistory);
  if (userMsgCount <= 1) return 'empathy';

  const floor = phaseFloorByCount(userMsgCount);
  const contentPhase = detectContentPhase(ctx);
  if (contentPhase && PHASE_ORDER.indexOf(contentPhase) > PHASE_ORDER.indexOf(floor)) {
    return contentPhase;
  }
  return floor;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从用户消息中提取具体情境/行为短语（取用户自己的原词，最多2个）
 * 例如输入“孩子最近大哭大闹，不想上学” → “大哭大闹、不想上学”
 */
function extractSituation(text: string, domain: string): string | null {
  const matches: string[] = [];
  for (const topic of PROBLEM_TOPICS) {
    if (topic.domains && !topic.domains.includes(domain)) continue;
    for (const kw of topic.keywords) {
      if (text.includes(kw) && !matches.includes(kw)) {
        matches.push(kw);
      }
    }
    if (matches.length >= 2) break;
  }
  return matches.length > 0 ? matches.slice(0, 2).join('、') : null;
}

/**
 * 生成共情阶段回复：优先使用具体情境模板，否则退回情绪关键词模板
 */
function generateEmpathyResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const emotion = extractEmotionKeyword(userMessage);
  const situation = extractSituation(userMessage, expert.domain);

  if (situation) {
    const templates = getSituationEmpathyTemplates(expert.domain);
    return pick(templates)
      .replace('{situation}', situation)
      .replace('{emotion}', emotion);
  }

  const templates = getEmpathyTemplates(expert.domain);
  return pick(templates)
    .replace('{keyword}', emotion)
    .replace('{content}', userMessage.slice(0, 50));
}

/**
 * 生成问题聚焦阶段回复：命中主题则针对性追问
 */
function generateFocusResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const recentText = collectRecentUserText(ctx, 2);
  const topic = matchProblemTopic(recentText, expert.domain);

  if (topic) {
    const leadIns = [
      `谢谢你愿意多说一些。关于${topic.label}，我想更深入地了解一点。`,
      `我明白了，那我们先把注意力放在${topic.label}上。`,
      `好的，关于${topic.label}，我们一起来理一理。`,
    ];
    return `${pick(leadIns)}${topic.focusProbe}`;
  }

  const templates = getFocusTemplates(expert.domain);
  const topicFallback = extractTopic(userMessage, expert.domain);
  return pick(templates).replace('{topic}', topicFallback);
}

/**
 * 生成例外资源探索阶段回复
 */
function generateExceptionResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  return pick(getExceptionTemplates(expert.domain));
}

/**
 * 生成小目标设定阶段回复
 */
function generateGoalResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  return pick(getGoalTemplates(expert.domain));
}

/**
 * 挑选工具箱方法：主题优先匹配，否则随机
 */
function pickTool(expert: Expert, topic: ProblemTopic | null): string {
  if (topic?.tools) {
    for (const name of topic.tools) {
      if (expert.toolbox.includes(name)) return name;
    }
  }
  return pick(expert.toolbox);
}

const ACTION_DISCLAIMER =
  '\n\n⚠️ 温馨提示：以上建议仅供参考，不构成医学诊断或治疗方案。如果困扰持续影响生活，建议寻求专业咨询师的帮助，你也可以点击下方「公益咨询」申请免费公益心理支持。';

/**
 * 生成行动建议阶段回复：命中主题则给出针对性方法 + 贴合的工具箱推荐
 */
function generateActionResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  const recentText = collectRecentUserText(ctx, 3);
  const topic = matchProblemTopic(recentText, expert.domain);
  const tool = pickTool(expert, topic);

  if (topic) {
    const leadIns = [
      `谢谢你一路跟我分享这么多。针对${topic.label}，我想给你一个具体的建议：`,
      `聊了这么多，关于${topic.label}，我们可以从一个具体的方法开始：`,
    ];
    return `${pick(leadIns)}\n\n${topic.actionTip}\n\n如果想更系统地练习，「${tool}」也很适合你们的情况，咨询中可以请老师带你一起做。${ACTION_DISCLAIMER}`;
  }

  const templates = getActionTemplates(expert.domain);
  return pick(templates).replace('{tool}', tool);
}

function extractEmotionKeyword(text: string): string {
  const emotions = [
    '压力大', '崩溃', '心累', '难过', '焦虑', '生气', '害怕', '孤独',
    '疲惫', '迷茫', '委屈', '无助', '烦躁', '失眠', '紧张', '失落',
    '着急', '担心', '压抑', '沮丧', '愧疚', '心慌', '郁闷', '痛苦',
  ];
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

// ---------- 共情模板（情境版） ----------
function getSituationEmpathyTemplates(domain: string): string[] {
  const common = [
    '听到你说「{situation}」，我能感受到这对你来说真的很不容易。谢谢你愿意把这些告诉我，这本身就需要很大的勇气。',
    '你提到的「{situation}」，光是读出来都让人感到心疼。你此刻心里的{emotion}，是完全正常的反应，换作是谁都不好受。',
    '谢谢你这么坦诚。「{situation}」确实会让人感到{emotion}，但你愿意把它说出来，这已经是照顾自己的第一步了。',
  ];
  if (domain === 'child') {
    return [
      ...common,
      '看到孩子{situation}，做父母的心里一定很不是滋味。你这么上心地在寻找办法，恰恰说明了孩子在你心里的分量。',
      '孩子{situation}，最揪心的往往是家长。先抱抱你自己——你的着急和心疼，都是因为爱。我们一起来看看能做点什么。',
    ];
  }
  if (domain === 'teen') {
    return [
      ...common,
      '经历「{situation}」的时候，心里那种{emotion}的感觉，别人未必看得见，但它是真实存在的。你愿意说出来，我会认真对待。',
    ];
  }
  if (domain === 'marriage') {
    return [
      ...common,
      '感情里遇到「{situation}」，往往最让人疲惫，因为对方是我们在乎的人。你愿意来聊，说明这段关系对你很重要。',
    ];
  }
  return common;
}

// ---------- 共情模板（通用版，兜底） ----------
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
    return [
      ...common,
      '孩子有没有在某些时刻表现得比较好？那些时候周围的环境是怎样的？大人做了什么不一样的事？',
      '孩子情绪比较平稳的时候，通常在做什么？是玩喜欢的玩具、和某个人在一起，还是在某个固定的时间段？这些线索很宝贵。',
      '有没有哪一次，孩子快要发脾气但最后没有爆发？那时候你做了什么、说了什么？那可能就是你们家的「成功时刻」。',
      '孩子最喜欢和谁在一起？做什么的时候他最投入、最安静？这些时刻里，往往藏着帮助他的钥匙。',
    ];
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
    return [
      ...common,
      '关于孩子，这周我们可以尝试做一件什么样的小改变？哪怕是很小的一步。',
      '这周我们先定一个小目标：每天睡前留出10分钟「不看手机的亲子时光」，只陪孩子做他想做的事，不指导、不批评。你觉得可以做到吗？',
      '如果这周孩子能有一次用说的代替哭闹，你希望那个场景是什么样的？我们可以先为那个场景做一点准备。',
      '从小处开始：这周选一个做得还不错的瞬间，具体地夸孩子一次，比如“你自己把玩具收好了，真能干”。每天一次就好。',
    ];
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
    '根据我们聊的内容，你可以试试「{tool}」这个方法。记住，改变不需要很大，每天进步一点点就很好。如果感觉难以独自应对，也可以申请免费公益咨询。',
  ];
  if (domain === 'child') {
    return [
      ...common,
      '关于孩子的情况，建议你可以尝试「{tool}」的方法。同时，家长的稳定情绪是孩子最大的安全感来源，也请照顾好自己。',
      '给你一个具体的小方法——「情绪命名」：当孩子情绪波动时，蹲下来帮他说出感受，“你很生气，因为……对吗？”被说出来的情绪，威力就会小一半。这与「{tool}」的思路是一致的，咨询中可以请老师带你练习。',
      '试试在家布置一个「冷静角」：放上抱枕、绘本，告诉孩子那里是安心平静的地方，不是惩罚区。孩子情绪上来时，陪他去那里待一会儿。如果想学更多类似的方法，「{tool}」会很适合你。',
      '孩子的状态往往和作息相关：固定睡觉和起床时间，睡前一小时安排“安静程序”（洗澡→绘本→拥抱→关灯），坚持一到两周通常会看到变化。「{tool}」可以帮你更细致地设计适合你们家的节奏。',
      '每天给孩子15分钟「地板时光」：孩子主导玩什么，家长只跟随、不指挥、不教。这段全神贯注的陪伴，是很多行为问题的“预防针”。「{tool}」里还有更多这样的亲子联结技巧。',
    ];
  }
  return common;
}

/**
 * 主响应生成函数
 */
export function generateResponse(ctx: ResponseContext): string {
  // 1. 危机检测（最高优先级，不可改动）
  const crisisCheck = detectCrisis(ctx.userMessage);
  if (crisisCheck.isCrisis) {
    return CRISIS_RESPONSE;
  }

  // 2. 阶段判定：用户消息条数下限 + 最近消息内容信号
  const phase = getConversationPhase(ctx);

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
