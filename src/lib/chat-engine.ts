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
 * 专业手法模块（儿童/青少年咨询师核心手法）：
 * 模块1 开场建约与探意愿：首轮共情时追加保密边界/来访意愿/目标引导（仅 child/teen 域），
 *        child 域按“家长代述/孩子本人”区分口吻；“无所谓/不知道聊什么”有温和接住话术
 * 模块2 具体化追问：focus 阶段按“是否有时间/场景锚点”落到具体时刻，取代泛化提问
 * 模块3 身份层/行为层分离：命中明确自我否定语时，把“我这个人不行”与“这一次没做好”拆开
 * 模块4 例外→行动转化：用户给出例外线索后，紧接着把“还行的时刻”放大为下一步起点
 *
 * 简快身心积极疗法专业骨架（通用方法论，模板均为自编）：
 * 模块5 三大限制性信念识别：「应该如此 / 托付心态 / 没有办法」命中时给出破框回应（含误判防护）
 * 模块6 前提假设换框词库：12 条积极前提自编释义，融入小目标阶段，帮来访者松动旧视角
 * 模块7 理解层次探问：focus 阶段已有具体线索时，顺着“环境→行为→能力→信念→身份”向下探一层
 * 模块8 五大自助技法引导：逐步抽离 / 一分为二 / 感知位置平衡 / 接受自己 / 借力，按域匹配、分步引导
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
 * 模块1·家长口吻线索：child 域用户消息命中 → 按“家长代述”模式回应
 * （孩子本人来访者通常用“我/妈妈/老师”自称，不会说“孩子”）
 */
const PARENT_VOICE_CLUES: string[] = [
  '我家', '我孩子', '我儿子', '我女儿', '我闺女', '我家娃', '我家宝',
  '孩子', '宝宝', '宝贝', '娃', '闺女',
];

/** 模块1·“无所谓/不知道聊什么”线索（强信号，直接接住） */
const INDECISION_CLUES: string[] = [
  '无所谓', '随便', '不知道聊什么', '不知道说什么', '没什么想聊',
  '没啥好说', '都可以', '不知道从何说起', '没什么好聊',
];

/** 模块1·“被家人带来”的非自愿线索 */
const UNWILLING_CLUES: string[] = [
  '被爸妈', '被我妈', '被我爸', '被家人', '我妈让我', '我爸让我',
  '被迫来', '不想来', '让我来的', '叫我来',
];

/**
 * 模块2·时间/场景锚点词：用户消息已含具体线索时，顺着线索追问细节
 */
const TIME_SCENE_CLUES: string[] = [
  '上周', '这周', '昨天', '今天', '前天', '早上', '中午', '晚上', '夜里', '凌晨',
  '周一', '周二', '周三', '周四', '周五', '周六', '周日', '周末',
  '那天', '有一次', '每次', '当时', '在学校', '在幼儿园', '在班里', '在家',
  '路上', '放学', '睡前', '吃饭',
];

/**
 * 模块3·自我否定词库（身份层结论）
 * 强信号：自带“我”的完整否定句，直接触发
 * 弱信号：需同时出现“我”（自我指向）或整条消息很短（显然在说自己）才触发，避免误伤
 * 注：刻意不包含“说了没用”这类评价方法/策略的短语
 */
const SELF_NEGATION_STRONG: string[] = [
  '我没用', '我没有用', '我不行', '我就是不行', '我什么都做不好', '我什么都不行',
  '我很失败', '我就是个垃圾', '我是个垃圾', '我是废物', '我就是个废物',
  '我很笨', '我不配', '都是我的错', '我太差劲', '我一事无成', '我是个累赘',
  '我真没用', '我没本事', '我是拖油瓶', '我是多余的', '没人喜欢我',
];

const SELF_NEGATION_WEAK: string[] = [
  '努力也没用', '没救了', '比别人差', '一无是处', '一事无成',
  '废物', '垃圾', '累赘', '差劲',
];

/**
 * 模块3·检测明确的自我否定语；返回命中的原词用于回复中引用
 * 普通情绪表达（如“最近心情不好”）不会命中任何词库，天然不触发
 */
function detectSelfDeprecation(text: string): string | null {
  for (const p of SELF_NEGATION_STRONG) {
    if (text.includes(p)) return p;
  }
  const selfDirected = text.includes('我') || text.length <= 10;
  if (selfDirected) {
    for (const p of SELF_NEGATION_WEAK) {
      if (text.includes(p)) return p;
    }
  }
  return null;
}

/**
 * 模块5·三大限制性信念（思维陷阱）
 * shouldBe  应该如此——用一把"应该"的尺子量别人，疼的常是拿尺子的自己
 * entrust   托付心态——把开心的钥匙交到别人手里，只能等对方开门
 * noWay     没有办法——不是真的没有路，多是旧的路走了太多遍
 * 关键词均为日常口语，模板全部自编；回应结尾均落到"拿回主动权"的探问上
 */
interface LimitingBelief {
  id: 'shouldBe' | 'entrust' | 'noWay';
  keywords: string[];
  reframes: string[];
  /** 分域深化：特定域的差异化破框（如 child 域家长教养语境） */
  domainReframes?: Record<string, string[]>;
}

const LIMITING_BELIEFS: LimitingBelief[] = [
  {
    id: 'shouldBe',
    keywords: [
      '他应该', '她就该', '他就该', '她就该', '就应该', '本该', '本来就应该',
      '凭什么', '理所当然', '理应如此', '必须得听', '非要他改', '他应该懂',
    ],
    reframes: [
      '你心里那句"他就应该怎样"，像一根一直绷紧的弦——弦的这头是他的做法，那头拽着的却是你的心。我们试着把"他应该"换成"我希望"：你希望的是什么？在这个希望暂时实现不了的时候，你能先为自己做点什么？把"他应该"放下一点点，主动权就回到你手里一点点。',
      '"应该"是一把尺子，量别人的时候，疼的往往是拿尺子的自己。先量量看：这个"应该"背后，你真正在意的是什么？是被尊重、被看见，还是一份安心？找到它，我们就有了别的路可以走——不一定非要等他变成"应该的样子"。',
    ],
    domainReframes: {
      child: [
        '您心里那句"孩子就应该听话"，像一根一直绷紧的弦——弦的这头是孩子的表现，那头拽着的是您的心。试着把"他应该"换成"我希望"：您希望孩子做到什么？在他暂时做不到的时候，我们能陪他练的第一步是什么？把尺子先放下，办法才进得来。',
        '"孩子就应该乖、应该自觉"——这把尺子量孩子的时候，累的常常是拿尺子的您。先看看尺子背后您真正在意的是什么：是他的安全、他的习惯，还是您怕他走弯路？找到它，我们就有别的路可以走。',
      ],
    },
  },
  {
    id: 'entrust',
    keywords: [
      '都怪他', '都怪她', '都是他害', '都是她害', '要不是他', '要不是她',
      '他害的', '只有他改变', '只有她改变', '等他改变', '等她改变', '他不改',
      '她不改', '他先道歉', '她先道歉', '他欠我', '她欠我', '他毁了我',
    ],
    reframes: [
      '把开心的钥匙交到别人手里，就只能等对方开门——这种等待最耗人。钥匙其实可以拿回来：就算他暂时不改变，你依然可以为自己做的一件小事是什么？先拿回一把钥匙，被困住的感觉就会少一分。',
      '怪他很容易，而且你可能真的没怪错。但"他错"和"你好起来"是两件事——他的改变我们决定不了，你的状态可以从今天开始照顾。这周，有没有一件不为任何人、只为你自己做的小事？',
    ],
    domainReframes: {
      child: [
        '"只有孩子改了，我才能不焦虑"——这等于把开心的钥匙交到了孩子手里，他只能让您更着急。先拿回一把钥匙：这周有没有一件不围着孩子转、只为您自己做的小事？您的状态松一分，家里的空气就松一分。',
      ],
    },
  },
  {
    id: 'noWay',
    keywords: [
      '没办法', '没别的办法', '没有别的办法', '只能这样', '只能认命',
      '别无选择', '没法改变', '改变不了现状', '没有出路',
    ],
    reframes: [
      '"没办法"常常不是真的没有路，而是旧的那条路走了太多遍——重复旧的做法，只会得到旧的结果。我们先不找"最好的办法"：关于这件事，哪怕看起来不太靠谱，你还能想到第二个、第三个做法吗？办法一多，选择就回来了。',
      '"没办法"出现的时候，可以换个问法：不问"为什么没办法"，改问"如果有一个办法，它可能长什么样"？哪怕只是个模糊的轮廓，我们也能顺着它往下找。你愿意试着描述一下那个轮廓吗？',
    ],
    domainReframes: {
      child: [
        '"没办法"往往是因为同一招用了太多遍——重复旧的做法，只会得到旧的结果。关于孩子的这个情况，咱们先不找"最好的办法"：除了现在常用的方法，您还能想到第二个、第三个做法吗？哪怕看起来不太靠谱，办法一多，选择就回来了。',
      ],
    },
  },
];

/**
 * 模块5·检测限制性信念；返回命中的陷阱定义
 * 误判防护：
 * - 「没有办法」类采用位置守卫：关键词前 2 字内出现"他/她"（如"他没办法来接我""拿她没办法"）
 *   是在陈述他人的情况，不视为自我卡壳，不触发
 * - 首轮用户消息不触发（保留共情与建约空间），由调用处按消息条数控制
 */
function detectLimitingBelief(text: string): LimitingBelief | null {
  for (const belief of LIMITING_BELIEFS) {
    for (const k of belief.keywords) {
      const idx = text.indexOf(k);
      if (idx === -1) continue;
      if (belief.id === 'noWay') {
        const preceding = text.slice(Math.max(0, idx - 2), idx);
        if (preceding.includes('他') || preceding.includes('她')) continue;
      }
      return belief;
    }
  }
  return null;
}

/** 模块5·破框回应：通用池 + 当前域差异化模板合并抽取 */
function generateBeliefReframeResponse(belief: LimitingBelief, domain: string): string {
  const pool = [...belief.reframes, ...(belief.domainReframes?.[domain] ?? [])];
  return pick(pool);
}

/**
 * 模块6·简快前提假设换框词库（自编释义）
 * 每条 = 一句前提 + 一句落地提醒；在小目标阶段随机融入一条，帮来访者松动旧视角
 */
const PRESUPPOSITION_LINES: string[] = [
  '没有两个人是一模一样的——你们的不同不是问题本身，而是相处的起点。',
  '一个人改变不了另一个人，但可以营造一个让对方愿意改变的环境。',
  '有效果比有道理更重要——争赢了道理，别输了关系。',
  '重复旧的做法，只会得到旧的结果——哪怕只换一个动作，也可能不一样。',
  '凡事必有至少三个解决办法——一个办法太少，两个办法两难，三个以上才有选择。',
  '你本来就具备让自己好起来的资源——它们只是暂时没被看见，不是不存在。',
  '情绪没有对错，它只是在提醒你：有些需要还没被照顾到。',
  '动机本身总不会错，只是行为有时达不到效果——把"想做好"和"没做好"分开看。',
  '沟通的意义在于对方的回应——没传达到，就换一种说法，而不是更大的音量。',
  '旧地图到不了新地方——过去有效的做法，未必适合现在的处境。',
  '每个让你苦恼的行为背后，都可能藏着一个想被满足的正面需要。',
  '感觉路不通的时候，往往不是路的问题，而是可以换一条走法。',
];

/** 模块6·取一条前提假设换框句 */
function getPresuppositionLine(): string {
  return pick(PRESUPPOSITION_LINES);
}

/**
 * 模块8·五大自助技法引导脚本（通用方法，脚本内容全部自编）
 * 每条 = 识别信号 + 生效域 + 分步引导脚本；均以来访者自己可在家完成为前提
 * 抽离法附安全提示：太强烈就停下回到当下；所有技法不替代专业咨询
 */
interface TechniqueGuide {
  id: 'distancing' | 'splitting' | 'positions' | 'selfAccept' | 'borrowing';
  name: string;
  keywords: string[];
  domains: string[];
  script: string;
  /** 需自我指向（含"我"）才触发，防止误伤描述他人的句子 */
  selfDirected?: boolean;
  /** 含这些片段时不触发（如"对孩子没信心"非自我挑战场景） */
  excludeKeywords?: string[];
}

const TECHNIQUE_GUIDES: TechniqueGuide[] = [
  {
    id: 'distancing',
    name: '逐步抽离法',
    keywords: ['总是想起', '忘不掉', '忘不了', '一闭眼就', '反复想起', '反复出现', '阴影', '做噩梦'],
    domains: ['child', 'teen', 'marriage', 'family', 'general'],
    script:
      '这段回忆对你影响很大，我们用一个温和的方法，和它拉开一点距离：\n\n' +
      '第一步：坐稳，双脚踩实地面，做三次缓慢的深呼吸，先让自己安定下来。\n' +
      '第二步：想象那件事像一段视频，在远处一个小小的屏幕上播放，而你是坐在安全距离外的观众。\n' +
      '第三步：在心里把画面调小一点、调暗一点、调慢一点，直到它对你的冲击变弱。\n' +
      '第四步：看着画面里那个经历事情的自己，轻轻说一句：那时候的你，已经尽力了。\n\n' +
      '如果哪一步感觉太强烈，就停下来、睁开眼回到当下——节奏完全由你掌控。做完之后，现在的感觉比刚刚好一点了吗？',
  },
  {
    id: 'splitting',
    name: '一分为二法',
    keywords: ['恨他', '恨她', '恨死他', '恨死她', '无法原谅', '不能原谅', '咽不下这口气'],
    domains: ['teen', 'marriage', 'family', 'general'],
    script:
      '对一个人的怨恨背久了很重，试试把人和事分开：\n\n' +
      '第一步：想象把这个人分成两个——"作为整个人的他"，和"做出那件事的他"。\n' +
      '第二步：看着"整个人的他"，在心里说：你也许无法喜欢这个人，但你愿意把人和事分开来看。\n' +
      '第三步：把让你受伤的那个行为，放回"那一件事"里——你抗拒的是那件事，不必让整个人的重量都压在你身上。\n' +
      '第四步：问自己：分开之后，心里有没有松一点点？\n\n' +
      '一分为二不是要你原谅他，而是把你自己从怨恨的重担里解放出来。这和你的感受接近吗？',
  },
  {
    id: 'positions',
    name: '感知位置平衡法',
    keywords: ['不理解我', '无法沟通', '说不通', '讲不通', '冷战', '天天吵架', '总是吵架', '一说话就吵'],
    domains: ['teen', 'marriage', 'family'],
    script:
      '卡在"他根本不理解我"的时候，可以试试换几个位置看一看：\n\n' +
      '第一位置：先站稳自己这边，把感受和需要说清楚——"我感到……，我需要……"。\n' +
      '第二位置：想象坐到他的椅子上，用他的眼睛看这件事——他可能在担心什么、在意什么？哪怕只是猜测。\n' +
      '第三位置：再退到旁观者的位置，看着这两个人——如果是朋友遇到这一幕，你会给他们什么建议？\n' +
      '最后回到第一位置：带着刚才看到的，重新想想下一次怎么开口。\n\n' +
      '换位置不是要你认同他，而是让你手里多几张牌。刚才换位置的时候，有没有看到一点之前没看到的？',
  },
  {
    id: 'selfAccept',
    name: '接受自己法',
    keywords: ['讨厌自己', '讨厌这样的自己', '讨厌现在这个', '不喜欢自己', '看不起自己', '接受不了自己', '恨自己', '嫌弃自己'],
    domains: ['child', 'teen', 'marriage', 'family', 'general'],
    script:
      '对自己苛刻久了会很累，试着和"自己"重新做朋友：\n\n' +
      '第一步：想象对面站着另一个你——那个一直在努力撑着、却常被批评的你。\n' +
      '第二步：看着TA，先承认TA这些年的不容易：TA一直在尽力，只是有些做法没达到想要的效果。\n' +
      '第三步：在心里对TA说："我看见你了，我愿意接受你，包括你的不完美。"\n' +
      '第四步：想象自己向TA走近一步，直到你们站在一起。\n\n' +
      '接受自己不是放弃变好，而是不再把力气花在和自己打仗上。说完那句话的时候，身体里有什么感觉？',
  },
  {
    id: 'borrowing',
    name: '借力法',
    keywords: ['没信心', '没有信心', '怕自己不行', '害怕失败', '没底气', '不敢上台', '心里没底'],
    domains: ['teen', 'marriage', 'family', 'general'],
    selfDirected: true,
    // “我对孩子没信心”是对他人没把握，非自我挑战场景，不借
    excludeKeywords: ['对孩子', '对他没', '对她没'],
    script:
      '面对没把握的场合，可以先向"榜样"借一点力量：\n\n' +
      '第一步：想一个你佩服的人——身边的、书中的、影视里的都可以，想象TA就站在你面前。\n' +
      '第二步：想象TA身上你最需要的那份力量（镇定、勇气、表达力），化作一团温暖的光。\n' +
      '第三步：缓慢深呼吸，想象这团光随吸气进入身体，流到肩膀、胸口、手心。\n' +
      '第四步：带着这份借来的力量，在心里预演一遍那个场合——留意自己的站姿和呼吸，有没有稳一点？\n\n' +
      '借力只是引子，点着的是你本来就有的部分。预演完，心里有几成把握了？',
  },
];

/**
 * 模块8·匹配当前消息适合的自助技法
 * selfDirected 的技法要求消息含"我"，避免"他害怕失败"这类描述误触发
 */
function matchTechnique(text: string, domain: string): TechniqueGuide | null {
  for (const guide of TECHNIQUE_GUIDES) {
    if (!guide.domains.includes(domain)) continue;
    if (guide.selfDirected && !text.includes('我')) continue;
    if (guide.excludeKeywords?.some((k) => text.includes(k))) continue;
    if (guide.keywords.some((k) => text.includes(k))) return guide;
  }
  return null;
}

/** 模块8·生成技法引导回应 */
function generateTechniqueResponse(guide: TechniqueGuide): string {
  const leadIns = [
    `你描述的状态，让我想到一个可以现在就试试的方法——${guide.name}。`,
    `针对你现在的困扰，有一个在家就能做的练习：${guide.name}。`,
  ];
  return `${pick(leadIns)}\n\n${guide.script}`;
}

/**
 * 模块1·判断 child 域是否为家长口吻
 */
function isParentVoice(text: string): boolean {
  return PARENT_VOICE_CLUES.some((k) => text.includes(k));
}

/**
 * 模块1·“无所谓/不知道/被带来”的接住判定
 * 弱信号“不知道”仅在整条消息很短时触发（如“不知道”），避免误伤“我不知道他为什么打人”
 */
function needsWarmCatch(text: string): boolean {
  if (INDECISION_CLUES.some((k) => text.includes(k))) return true;
  if (UNWILLING_CLUES.some((k) => text.includes(k))) return true;
  if (text.includes('不知道') && text.length <= 8) return true;
  return false;
}

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
 * 模块1·开场建约文案：保密边界 + 来访意愿 + 目标引导
 * 仅 child/teen 域生效；child 域区分家长代述与孩子本人两种口吻
 */
function getOpeningContract(domain: string, parentVoice: boolean): string {
  if (domain === 'teen') {
    return '\n\n正式开始前，先和你约定两件事：① 我们聊的内容我不会原样告诉你的家人，除非你正处于伤害自己或他人的危险中——那是唯一的例外，因为安全最重要。② 今天是你自己想聊聊，还是被家人带来的？都可以，说实话就好。如果今天只聊一件事，你最想聊哪一件？';
  }
  if (domain === 'child') {
    if (parentVoice) {
      return '\n\n也请您放心：我们的聊天内容只保存在您自己的设备上，我不会原样转达给任何人，除非涉及安全风险。如果之后孩子愿意自己聊聊，我同样会尊重他的节奏。——那么，今天您最想先解决孩子的哪一件事？';
    }
    return '\n\n开始前先和你拉个勾：① 我们聊的内容我不会原样告诉爸爸妈妈，除非你正处于伤害自己或他人的危险中，因为安全最重要。② 今天是你自己想聊，还是爸爸妈妈让你来的？都可以告诉我。如果今天只聊一件事，你最想聊什么？';
  }
  return '';
}

/**
 * 生成共情阶段回复：优先使用具体情境模板，否则退回情绪关键词模板
 * 模块1：child/teen 域首轮追加开场建约（保密边界/意愿探询/目标引导）
 */
function generateEmpathyResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const emotion = extractEmotionKeyword(userMessage);
  const situation = extractSituation(userMessage, expert.domain);

  let empathy: string;
  if (situation) {
    const templates = getSituationEmpathyTemplates(expert.domain);
    empathy = pick(templates)
      .replace('{situation}', situation)
      .replace('{emotion}', emotion);
  } else {
    const templates = getEmpathyTemplates(expert.domain);
    empathy = pick(templates)
      .replace('{keyword}', emotion)
      .replace('{content}', userMessage.slice(0, 50));
  }

  // 模块1：仅儿童/青少年域追加开场建约；child 域家长代述时用家长口吻，不强行用青少年口吻
  if (expert.domain === 'child' || expert.domain === 'teen') {
    const parentVoice = expert.domain === 'child' && isParentVoice(userMessage);
    return empathy + getOpeningContract(expert.domain, parentVoice);
  }
  return empathy;
}

/**
 * 模块1·接住话术：来访者说“无所谓/不知道聊什么/被带来的”时的温和回应
 */
function getCatchTemplates(domain: string): string[] {
  const common = [
    '没关系，不知道从哪里开始，本身就很正常。我们不急着找“正事”——随便聊聊最近的一天是怎么过的，也可以。',
    '不知道聊什么都可以。那我们从最小的地方开始：最近有没有哪一个瞬间，让你稍微觉得轻松一点点？',
    '被带过来的话，有点别扭、不太想说，都很正常。你可以只聊你愿意聊的部分，我们不急。我很好奇：你平时最喜欢做的一件事是什么？',
  ];
  if (domain === 'child') {
    return [
      ...common,
      '没关系，不急着说出个所以然。我们就随便聊：今天学校里发生了什么好玩的事吗？哪怕是吃午饭时的小事也行。',
    ];
  }
  return common;
}

/**
 * 模块2·具体化追问父模板族
 * 有时间/场景锚点 → 顺着线索追问细节；无锚点 → 落到“哪一天/什么时刻/在做什么”
 * parentVoice 区分 child 域家长代述口吻
 */
function getSpecificityProbe(parentVoice: boolean, label: string, hasAnchor: boolean): string {
  if (hasAnchor) {
    const direct = [
      '你刚才提到的那个时刻很关键。顺着它往下想：当时具体发生了什么？谁先做了什么，接下来呢？',
      '在那个场景里，还有谁在场？他们做了什么反应？你当时心里闪过的第一个念头是什么？',
      '那一刻之前的一小时，和平时有什么不一样吗？有时候线索就藏在前后的对比里。',
    ];
    const parent = [
      '你刚才提到的那个时刻很关键。顺着它往下想：当时孩子具体在做什么？之前发生了什么，之后大人是怎么回应的？',
      '那个场景里还有谁在场？他们的反应是什么？孩子之后的状态怎么样？',
      '那一刻之前，和平时有什么不一样吗？比如当天的作息、刚经历过的事。线索常常藏在前后的对比里。',
    ];
    return pick(parentVoice ? parent : direct);
  }
  const direct = [
    `能不能想到一个具体的例子？比如最近一次${label}是在哪一天、什么时间？当时你在做什么？`,
    `我们先把它落到一个画面上：上一次${label}发生在什么时候？是在家里、学校，还是别的地方？`,
    `如果只回忆最近的一次：那天是什么时间、什么场景？当时周围有谁？`,
  ];
  const parent = [
    `能不能想到一个具体的例子？比如最近一次${label}是在哪一天、什么时刻？当时孩子在做什么，您在做什么？`,
    `我们先把它落到一个画面上：上一次${label}发生在什么时候？在家里还是在外面？当时周围有谁？`,
    `只回忆最近的一次就好：那天是什么时间、什么场景？孩子之前刚经历了什么？`,
  ];
  return pick(parentVoice ? parent : direct);
}

/**
 * 模块7·理解层次探问：已有具体线索（时间/场景锚点）时，顺着细节
 * 再向下探一层——从“环境/行为”落到“能力/信念/身份”，帮来访者看到深层模式
 * parentVoice 区分 child 域家长代述口吻
 */
function getLevelsProbe(parentVoice: boolean): string {
  const direct = [
    '再往下探一层：那一刻，你心里对自己说了句什么？那句话，你信了它多久了？',
    '顺着这个场景再深一点：当时你觉得自己"能做到吗"？这个判断是从什么时候开始跟着你的？',
    '如果给那一刻的自己贴一个标签，你会贴什么？——我们先一起看看这个标签，不急着认下它。',
  ];
  const parent = [
    '再往下探一层：那一刻，您心里对孩子闪过的判断是什么？比如"他就是不听话"？这个判断从什么时候开始的？',
    '顺着这个场景再深一点：当时您心里有没有一个声音，比如"我不是个好家长"？我们把这个声音先放在桌上，一起看看它。',
    '那一刻除了着急，您对自己说了什么？那句话跟着您多久了？',
  ];
  return pick(parentVoice ? parent : direct);
}

/**
 * 生成问题聚焦阶段回复：
 * - 模块1后续：child/teen 域“无所谓/不知道聊什么/被带来”且无明确主题 → 温和接住
 * - 模块2：命中主题 → 具体化追问（有无时间/场景锚点双分支），取代泛化提问
 * - 模块7：有锚点时追加理解层次探问，从场景细节落到信念/身份层
 */
function generateFocusResponse(ctx: ResponseContext): string {
  const { expert, userMessage } = ctx;
  const recentText = collectRecentUserText(ctx, 2);
  const topic = matchProblemTopic(recentText, expert.domain);

  // 模块1后续：仅在儿童/青少年域、且没有明确问题可聊时，先接住再引导
  if ((expert.domain === 'child' || expert.domain === 'teen') && !topic && needsWarmCatch(userMessage)) {
    return pick(getCatchTemplates(expert.domain));
  }

  if (topic) {
    const leadIns = [
      `谢谢你愿意多说一些。关于${topic.label}，我想更深入地了解一点。`,
      `我明白了，那我们先把注意力放在${topic.label}上。`,
      `好的，关于${topic.label}，我们一起来理一理。`,
    ];
    const parentVoice = expert.domain === 'child' && isParentVoice(recentText);
    const hasAnchor = TIME_SCENE_CLUES.some((k) => recentText.includes(k));
    const specificity = getSpecificityProbe(parentVoice, topic.label, hasAnchor);
    if (hasAnchor) {
      return `${pick(leadIns)}${specificity}\n\n${getLevelsProbe(parentVoice)}`;
    }
    return `${pick(leadIns)}${specificity}`;
  }

  const templates = getFocusTemplates(expert.domain);
  const topicFallback = extractTopic(userMessage, expert.domain);
  return pick(templates).replace('{topic}', topicFallback);
}

/**
 * 模块4·例外→行动转化模板：用户已给出“还行/稍好”的例外线索时，
 * 不再停留在“问”，而是把这个时刻放大为下一步起点。
 * child 域补充“起点放大”引导：复现成功时刻 + 具体正反馈。
 */
function getExceptionConversionTemplates(domain: string): string[] {
  const common = [
    '你提到的这个“没那么糟”的时刻特别重要——它说明问题并不是时时刻刻都在。我们把它当成一个可以放大的起点：这周，能不能让这样的时刻再多出现一点点？哪怕只多一次，也是改变的开始。',
    '这些还不错的时刻是怎么发生的？当时你做了什么、周围有什么不一样？找到那个“配方”，这周试着再用一次——让这样的时刻多出现一点点。从已经有效的部分出发，比从零开始容易得多。',
  ];
  if (domain === 'child') {
    return [
      ...common,
      '孩子那个表现好的时刻，就是你们的起点。这周试着让它再多出现一次：同样的时间、同样的做法；当他做到时，给他具体的正反馈——“刚才你自己做到了，真棒”。好行为被看见，才会越来越多。',
      '既然有“乖的时候”，说明孩子本来就具备那样的能力。这周只做一件事：盯住那个还不错的时刻，放大它——一个拥抱、一句具体的肯定。起点被放大，改变就会滚雪球。',
    ];
  }
  return common;
}

/**
 * 生成例外资源探索阶段回复
 * 模块4：用户已给出例外线索 → 直接转入“起点放大”转化；否则继续探索例外
 */
function generateExceptionResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  const recentText = collectRecentUserText(ctx, 2);
  const hasClue = EXCEPTION_CLUES.some((k) => recentText.includes(k));
  if (hasClue) {
    return pick(getExceptionConversionTemplates(expert.domain));
  }
  return pick(getExceptionTemplates(expert.domain));
}

/**
 * 生成小目标设定阶段回复
 * 模块6：前置一条简快前提假设换框句，帮来访者松动旧视角后再定小目标
 */
function generateGoalResponse(ctx: ResponseContext): string {
  const { expert } = ctx;
  return `${getPresuppositionLine()}\n\n${pick(getGoalTemplates(expert.domain))}`;
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
 * 模块3·身份层/行为层分离模板
 * 把“我这个人不行”（身份层结论）和“这一次事情没做好”（行为层）拆开。
 * 边界：只做反映与提问，不做诊断、不承诺疗效。
 */
function getIdentitySeparationTemplates(domain: string): string[] {
  const common = [
    '我听到你说“{phrase}”。我想轻轻地和你区分一下：是“这一次事情没做好”，还是“我这个人不行”？没做好，是一件具体的事，可以想办法；而“我这个人不行”，是一个太重的结论——一件事的结果，不足以定义你这个人。愿意说说，刚刚发生的那件具体的事是什么吗？',
    '你说“{phrase}”的时候，我注意到你把一次的结果，和“你这个人”划上了等号。我想陪你把它们分开：行为可以调整，事情可以重来，而你这个人的价值，不由任何一次结果决定。我们先只聊“这一次具体发生了什么”，好吗？',
  ];
  if (domain === 'teen') {
    return [
      ...common,
      '“{phrase}”——这句话有点重，我想先轻轻放下它。一次考试、一次冲突，是事情层面的；而你这个人，远远大于任何一次结果。能和我具体说说，是哪件事让你这样看自己吗？',
    ];
  }
  if (domain === 'child') {
    return [
      ...common,
      '当你说“{phrase}”时，我想陪你区分一下：是“这次某件事没做好”，还是“你这个人不够好”？事情可以练习、可以再来，而你这个人的价值不是由一次结果决定的。能和我说说刚才发生了什么吗？',
    ];
  }
  return common;
}

/**
 * 模块3·身份层/行为层分离回应
 */
function generateIdentitySeparationResponse(ctx: ResponseContext, phrase: string): string {
  return pick(getIdentitySeparationTemplates(ctx.expert.domain)).replace('{phrase}', phrase);
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

  // 2. 模块3：检测到明确的自我否定语 → 身份层/行为层分离回应（优先于常规阶段推进）
  const selfNegation = detectSelfDeprecation(ctx.userMessage);
  if (selfNegation) {
    return generateIdentitySeparationResponse(ctx, selfNegation);
  }

  // 3. 模块5：限制性信念（三大陷阱）破框——第 2 条用户消息起生效，首轮保留共情建约
  if (countUserMessages(ctx.messageHistory) >= 2) {
    const belief = detectLimitingBelief(ctx.userMessage);
    if (belief) {
      return generateBeliefReframeResponse(belief, ctx.expert.domain);
    }

    // 4. 模块8：命中自助技法信号 → 直接给出分步引导脚本（按域匹配）
    const guide = matchTechnique(ctx.userMessage, ctx.expert.domain);
    if (guide) {
      return generateTechniqueResponse(guide);
    }
  }

  // 5. 阶段判定：用户消息条数下限 + 最近消息内容信号
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
