/**
 * 心理自测中心 - 12套测评量表
 * 每题选项计分，结果给筛查参考+建议+推荐专家
 * 题目均为通俗自编题面，不引用任何有版权的标准量表原文
 */

export interface Question {
  id: string;
  text: string;
  options: { label: string; score: number }[];
  isCrisis?: boolean; // 危机条目标记
}

export interface AssessmentResult {
  level: string;
  scoreRange: [number, number];
  description: string;
  suggestion: string;
  recommendedExpert: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  questions: Question[];
  results: AssessmentResult[];
  crisisScore?: number; // 触发危机的分数阈值
}

// 1. 情绪与压力速测
const stressAssessment: Assessment = {
  id: 'stress',
  title: '情绪与压力速测',
  description: '快速了解你当前的情绪状态和压力水平，5分钟完成',
  icon: '🌊',
  category: '情绪',
  questions: [
    { id: 's1', text: '最近一周，你是否感到情绪低落或沮丧？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 's2', text: '你是否感到紧张、焦虑或坐立不安？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 's3', text: '你的睡眠质量如何？', options: [{ label: '很好', score: 0 }, { label: '偶尔失眠', score: 1 }, { label: '经常睡不好', score: 2 }, { label: '严重失眠', score: 3 }] },
    { id: 's4', text: '你是否感到疲惫、没有精力？', options: [{ label: '从不', score: 0 }, { label: '有时', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 's5', text: '你对日常活动的兴趣和愉悦感如何？', options: [{ label: '很感兴趣', score: 0 }, { label: '还可以', score: 1 }, { label: '兴趣减少', score: 2 }, { label: '完全没兴趣', score: 3 }] },
    { id: 's6', text: '你是否感到难以集中注意力？', options: [{ label: '从不', score: 0 }, { label: '有时', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 's7', text: '你的食欲有变化吗？', options: [{ label: '正常', score: 0 }, { label: '稍有变化', score: 1 }, { label: '明显增减', score: 2 }, { label: '大幅变化', score: 3 }] },
    { id: 's8', text: '你是否感到无法控制自己的担忧？', options: [{ label: '从不', score: 0 }, { label: '有时', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  ],
  results: [
    { level: '状态良好', scoreRange: [0, 5], description: '你当前的情绪和压力状态良好，继续保持积极的生活方式。', suggestion: '保持规律作息、适度运动和社交活动，这些都是维持心理健康的好习惯。', recommendedExpert: 'general' },
    { level: '轻度压力', scoreRange: [6, 11], description: '你可能正承受一些压力，这在日常生活中是正常的。', suggestion: '建议尝试一些放松技巧，如深呼吸、冥想或散步。适当调整生活节奏，给自己一些休息时间。', recommendedExpert: 'general' },
    { level: '中度压力', scoreRange: [12, 17], description: '你的压力水平较高，可能已经开始影响到日常生活。', suggestion: '建议寻求专业心理咨询师的帮助，学习更有效的压力管理方法。可以考虑申请一次免费公益咨询。', recommendedExpert: 'general' },
    { level: '高度压力', scoreRange: [18, 24], description: '你正承受很大的压力，建议尽快寻求专业帮助。', suggestion: '强烈建议申请免费公益心理咨询进行面对面评估。如果感到难以承受，请拨打心理援助热线12356。', recommendedExpert: 'general' },
  ],
};

// 2. 抑郁情绪筛查
const depressionAssessment: Assessment = {
  id: 'depression',
  title: '抑郁情绪筛查',
  description: 'PHQ-9简化版抑郁情绪筛查，帮助了解你的情绪状态',
  icon: '🌧️',
  category: '情绪',
  questions: [
    { id: 'd1', text: '做事时提不起劲或没有兴趣', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd2', text: '感到心情低落、沮丧或绝望', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd3', text: '入睡困难、睡不安稳或睡眠过多', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd4', text: '感觉疲倦或没有活力', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd5', text: '食欲不振或吃太多', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd6', text: '觉得自己不好或觉得自己很失败', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd7', text: '对事物专注有困难，例如阅读或看电视', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'd8', text: '有不如死掉或用某种方式伤害自己的念头', options: [{ label: '完全不会', score: 0 }, { label: '好几天', score: 1 }, { label: '一半以上天数', score: 2 }, { label: '几乎每天', score: 3 }], isCrisis: true },
    { id: 'd9', text: '这些困难影响了你的工作、社交或家庭生活吗', options: [{ label: '完全没有', score: 0 }, { label: '有一点', score: 1 }, { label: '相当多', score: 2 }, { label: '非常严重', score: 3 }] },
  ],
  results: [
    { level: '情绪正常', scoreRange: [0, 4], description: '你目前没有明显的抑郁情绪，请继续保持良好的心态。', suggestion: '保持健康的生活方式，规律作息和运动有助于维持良好的情绪状态。', recommendedExpert: 'general' },
    { level: '轻度抑郁情绪', scoreRange: [5, 9], description: '你可能有一些轻度的抑郁情绪，这在压力大的时候是常见的。', suggestion: '建议关注自己的情绪变化，尝试增加运动、社交和放松活动。如果持续两周以上，建议咨询专业人士。', recommendedExpert: 'general' },
    { level: '中度抑郁情绪', scoreRange: [10, 14], description: '你的抑郁情绪可能已经达到中等程度，建议寻求专业帮助。', suggestion: '建议申请免费公益心理咨询进行详细评估。简快身心积极疗法可以帮助你找到内在资源，逐步改善状态。', recommendedExpert: 'general' },
    { level: '中重度抑郁情绪', scoreRange: [15, 19], description: '你正在经历较严重的抑郁情绪，强烈建议寻求专业帮助。', suggestion: '请尽快申请免费公益心理咨询或前往医院心理科就诊。如果感到难以承受，请拨打12356心理援助热线。', recommendedExpert: 'general' },
    { level: '重度抑郁情绪', scoreRange: [20, 27], description: '你的抑郁情绪较为严重，请务必尽快寻求专业医疗帮助。', suggestion: '强烈建议尽快前往医院心理科或精神科就诊。如需紧急帮助，请拨打12356或120。你不需要独自承受。', recommendedExpert: 'general' },
  ],
  crisisScore: 1,
};

// 3. 儿童心理状态（家长版）
const childAssessment: Assessment = {
  id: 'child',
  title: '儿童心理状态评估',
  description: '帮助家长了解3-12岁孩子的心理状态（家长填写）',
  icon: '🧒',
  category: '儿童',
  questions: [
    { id: 'c1', text: '孩子最近是否经常哭闹或发脾气？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'c2', text: '孩子是否不愿意去幼儿园/学校？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'c3', text: '孩子是否很难与其他小朋友相处？', options: [{ label: '不会', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'c4', text: '孩子的睡眠是否有变化（做噩梦、不愿独自睡等）？', options: [{ label: '没有', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '每晚', score: 3 }] },
    { id: 'c5', text: '孩子是否变得特别黏人或害怕分离？', options: [{ label: '不会', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'c6', text: '孩子是否对以前喜欢的活动失去兴趣？', options: [{ label: '不会', score: 0 }, { label: '有些减少', score: 1 }, { label: '明显减少', score: 2 }, { label: '完全没兴趣', score: 3 }] },
    { id: 'c7', text: '孩子的食欲有明显变化吗？', options: [{ label: '正常', score: 0 }, { label: '稍有变化', score: 1 }, { label: '明显变化', score: 2 }, { label: '大幅变化', score: 3 }] },
    { id: 'c8', text: '孩子是否出现退行行为（如尿床、吃手指等）？', options: [{ label: '没有', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '频繁', score: 3 }] },
  ],
  results: [
    { level: '状态良好', scoreRange: [0, 5], description: '孩子的心理状态整体良好，请继续给予关爱和支持。', suggestion: '保持亲子互动时间，多陪伴孩子游戏和交流，关注孩子的情绪变化。', recommendedExpert: 'child' },
    { level: '轻度关注', scoreRange: [6, 11], description: '孩子可能有一些情绪波动，建议多关注和陪伴。', suggestion: '增加亲子互动时间，用游戏和绘画等方式了解孩子的内心世界。如果持续2周以上没有改善，建议咨询专业人士。', recommendedExpert: 'child' },
    { level: '中度关注', scoreRange: [12, 17], description: '孩子的心理状态需要关注，建议寻求专业评估。', suggestion: '建议申请免费公益儿童心理咨询。早期的专业支持可以帮助孩子更好地度过困难时期。', recommendedExpert: 'child' },
    { level: '需要专业帮助', scoreRange: [18, 24], description: '孩子可能需要专业的心理支持，建议尽快咨询。', suggestion: '强烈建议尽快申请免费公益儿童心理咨询进行面对面评估。也可以拨打12356获取专业指导。', recommendedExpert: 'child' },
  ],
};

// 4. 青少年心理状态
const teenAssessment: Assessment = {
  id: 'teen',
  title: '青少年心理状态评估',
  description: '了解12-18岁青少年的心理健康状况',
  icon: '🌱',
  category: '青少年',
  questions: [
    { id: 't1', text: '你是否经常感到心情不好或不开心？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 't2', text: '你是否对学习或学校的事情感到很大的压力？', options: [{ label: '不会', score: 0 }, { label: '有一点', score: 1 }, { label: '压力较大', score: 2 }, { label: '压力很大', score: 3 }] },
    { id: 't3', text: '你和父母/家人的关系怎么样？', options: [{ label: '很好', score: 0 }, { label: '还行', score: 1 }, { label: '经常冲突', score: 2 }, { label: '关系很差', score: 3 }] },
    { id: 't4', text: '你在学校有可以交心的朋友吗？', options: [{ label: '有好几个', score: 0 }, { label: '有一两个', score: 1 }, { label: '几乎没有', score: 2 }, { label: '完全没有', score: 3 }] },
    { id: 't5', text: '你是否花很多时间在手机/游戏上，难以控制？', options: [{ label: '不会', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '无法控制', score: 3 }] },
    { id: 't6', text: '你对自己的未来感到怎样？', options: [{ label: '充满希望', score: 0 }, { label: '有些迷茫', score: 1 }, { label: '不太乐观', score: 2 }, { label: '没有希望', score: 3 }] },
    { id: 't7', text: '你最近是否经常感到焦虑或紧张？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 't8', text: '你的睡眠状况如何？', options: [{ label: '很好', score: 0 }, { label: '偶尔不好', score: 1 }, { label: '经常失眠', score: 2 }, { label: '严重失眠', score: 3 }] },
    { id: 't9', text: '你是否有过想要伤害自己的想法？', options: [{ label: '从不', score: 0 }, { label: '有过一闪而过的念头', score: 1 }, { label: '经常有', score: 2 }, { label: '有具体计划', score: 3 }], isCrisis: true },
  ],
  results: [
    { level: '状态良好', scoreRange: [0, 6], description: '你的心理状态整体不错，继续保持积极的生活态度。', suggestion: '保持运动、社交和兴趣爱好，遇到困难时及时和家人朋友倾诉。', recommendedExpert: 'teen' },
    { level: '轻度困扰', scoreRange: [7, 12], description: '你可能正面临一些青春期的困扰，这是成长中的正常现象。', suggestion: '尝试和信任的人聊聊你的感受，保持运动和良好的作息。如果困扰持续，可以考虑咨询。', recommendedExpert: 'teen' },
    { level: '中度困扰', scoreRange: [13, 18], description: '你可能正经历比较大的心理困扰，建议寻求专业支持。', suggestion: '建议申请免费公益青少年心理咨询。专业的帮助可以让你更快地找到方向。', recommendedExpert: 'teen' },
    { level: '需要专业帮助', scoreRange: [19, 27], description: '你正在经历较严重的心理困扰，请尽快寻求专业帮助。', suggestion: '强烈建议尽快申请免费公益心理咨询或告诉信任的大人。如需紧急帮助，请拨打12356。你值得被帮助。', recommendedExpert: 'teen' },
  ],
  crisisScore: 2,
};

// 5. 婚恋关系满意度
const marriageAssessment: Assessment = {
  id: 'marriage',
  title: '婚恋关系满意度评估',
  description: '了解你们关系中的优势与需要改善的方面',
  icon: '💕',
  category: '婚恋',
  questions: [
    { id: 'm1', text: '你们之间是否能坦诚地交流彼此的感受？', options: [{ label: '总是可以', score: 0 }, { label: '经常可以', score: 1 }, { label: '偶尔可以', score: 2 }, { label: '几乎不能', score: 3 }] },
    { id: 'm2', text: '你是否觉得被对方理解和尊重？', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'm3', text: '你们发生冲突后通常如何解决？', options: [{ label: '和平沟通解决', score: 0 }, { label: '有时能解决', score: 1 }, { label: '经常冷战', score: 2 }, { label: '激烈争吵', score: 3 }] },
    { id: 'm4', text: '你对你们的亲密关系（情感/身体）满意吗？', options: [{ label: '很满意', score: 0 }, { label: '比较满意', score: 1 }, { label: '不太满意', score: 2 }, { label: '很不满意', score: 3 }] },
    { id: 'm5', text: '你们是否还能一起享受快乐的时光？', options: [{ label: '经常', score: 0 }, { label: '偶尔', score: 1 }, { label: '很少', score: 2 }, { label: '几乎没有', score: 3 }] },
    { id: 'm6', text: '你是否信任你的伴侣？', options: [{ label: '完全信任', score: 0 }, { label: '基本信任', score: 1 }, { label: '有些怀疑', score: 2 }, { label: '完全不信任', score: 3 }] },
    { id: 'm7', text: '你对这段关系的未来怎么看？', options: [{ label: '充满信心', score: 0 }, { label: '比较乐观', score: 1 }, { label: '不太确定', score: 2 }, { label: '想要结束', score: 3 }] },
    { id: 'm8', text: '你们在家庭责任分工上是否公平？', options: [{ label: '很公平', score: 0 }, { label: '基本公平', score: 1 }, { label: '有些不公平', score: 2 }, { label: '很不公平', score: 3 }] },
  ],
  results: [
    { level: '关系健康', scoreRange: [0, 6], description: '你们的关系状态良好，有良好的沟通和情感基础。', suggestion: '继续保持开放的沟通和共同的活动。偶尔的关系维护可以帮助感情更加稳固。', recommendedExpert: 'marriage' },
    { level: '需要关注', scoreRange: [7, 12], description: '你们的关系有一些需要关注的地方，但改善空间很大。', suggestion: '建议尝试增加有效沟通的时间，学习表达需求和倾听对方。可以考虑阅读婚恋关系方面的书籍或参加工作坊。', recommendedExpert: 'marriage' },
    { level: '关系紧张', scoreRange: [13, 18], description: '你们的关系正面临较大挑战，建议寻求专业帮助。', suggestion: '建议申请免费公益婚恋咨询。专业的第三方视角可以帮助你们看到彼此的需求，找到改善的方向。', recommendedExpert: 'marriage' },
    { level: '关系危机', scoreRange: [19, 24], description: '你们的关系处于危机状态，强烈建议寻求专业帮助。', suggestion: '建议尽快申请免费公益婚恋咨询进行系统评估和辅导。如果涉及到安全问题，请优先保护自己。', recommendedExpert: 'marriage' },
  ],
};

// 6. 家庭教育方式评估
const familyAssessment: Assessment = {
  id: 'family',
  title: '家庭教育方式评估',
  description: '了解你的教养方式对孩子的影响',
  icon: '🏠',
  category: '家庭',
  questions: [
    { id: 'f1', text: '当孩子犯错时，你通常的反应是？', options: [{ label: '耐心引导', score: 0 }, { label: '讲道理', score: 1 }, { label: '批评指责', score: 2 }, { label: '打骂惩罚', score: 3 }] },
    { id: 'f2', text: '你是否会征求孩子的意见来做家庭决定？', options: [{ label: '经常会', score: 0 }, { label: '有时会', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'f3', text: '你每天有多少时间和孩子进行有质量的互动？', options: [{ label: '1小时以上', score: 0 }, { label: '30分钟-1小时', score: 1 }, { label: '不到30分钟', score: 2 }, { label: '几乎没有', score: 3 }] },
    { id: 'f4', text: '你对孩子的期望值如何？', options: [{ label: '合理适中', score: 0 }, { label: '稍高', score: 1 }, { label: '比较高', score: 2 }, { label: '非常高', score: 3 }] },
    { id: 'f5', text: '你是否经常在孩子面前表达爱意？', options: [{ label: '经常', score: 0 }, { label: '偶尔', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'f6', text: '当孩子表达负面情绪时，你会怎么做？', options: [{ label: '接纳并引导', score: 0 }, { label: '安慰', score: 1 }, { label: '否定情绪', score: 2 }, { label: '惩罚', score: 3 }] },
    { id: 'f7', text: '你的家庭规则是否清晰且一致？', options: [{ label: '清晰一致', score: 0 }, { label: '基本一致', score: 1 }, { label: '不太一致', score: 2 }, { label: '没有规则', score: 3 }] },
    { id: 'f8', text: '你是否会拿孩子和其他孩子比较？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
  ],
  results: [
    { level: '权威型教养', scoreRange: [0, 5], description: '你的教养方式偏向权威型（民主型），这是最有利于孩子发展的方式。', suggestion: '继续保持温暖而有规则的教养方式。你给孩子既提供了安全感，又给了他们成长的空间。', recommendedExpert: 'family' },
    { level: '基本良好', scoreRange: [6, 11], description: '你的教养方式整体不错，有一些方面可以进一步优化。', suggestion: '注意在规则与自由之间找到平衡，多倾听孩子的想法，用鼓励代替批评。', recommendedExpert: 'family' },
    { level: '需要调整', scoreRange: [12, 17], description: '你的教养方式可能需要一些调整，某些模式可能影响孩子的心理发展。', suggestion: '建议学习正面管教或非暴力沟通方法。也可以申请免费公益家庭教育指导。', recommendedExpert: 'family' },
    { level: '建议专业指导', scoreRange: [18, 24], description: '当前的教养方式可能对孩子的心理健康产生不利影响，建议寻求专业帮助。', suggestion: '强烈建议申请免费公益家庭教育咨询。改变教养方式不需要一步到位，从小的改变开始就好。', recommendedExpert: 'family' },
  ],
};

// 7. 焦虑程度自测
const anxietyAssessment: Assessment = {
  id: 'anxiety',
  title: '焦虑程度自测',
  description: '了解紧绷、担忧和不安占据你生活的程度',
  icon: '🍂',
  category: '情绪',
  questions: [
    { id: 'a1', text: '最近是否常常感到心里发紧、放松不下来？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a2', text: '是否总忍不住担心还没发生的事情？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a3', text: '身体是否有紧绷感，比如肩膀僵硬、手心出汗、心跳偏快？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a4', text: '是否容易因为小事而紧张过度？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a5', text: '担忧的念头一旦开始，是否很难停下来？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a6', text: '是否容易坐立不安、很难安静地待一会儿？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a7', text: '是否因为担心而回避一些事情或场合？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a8', text: '夜里是否会越想越清醒、难以入睡？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a9', text: '是否总觉得「万一出事怎么办」？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a10', text: '这种紧绷感是否已经影响到吃饭、学习或工作？', options: [{ label: '完全没有', score: 0 }, { label: '有一点', score: 1 }, { label: '比较明显', score: 2 }, { label: '影响很大', score: 3 }] },
    { id: 'a11', text: '身边人是否说过你最近「太紧张了」？', options: [{ label: '从未', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'a12', text: '紧绷到难受的时候，是否出现过不想继续承受、甚至不想活下去的念头？', options: [{ label: '从未', score: 0 }, { label: '有过一闪而过的念头', score: 1 }, { label: '经常出现', score: 2 }, { label: '有具体打算', score: 3 }], isCrisis: true },
  ],
  results: [
    { level: '状态平稳', scoreRange: [0, 9], description: '你近期的紧绷和担忧处于正常范围，整体状态比较平稳。', suggestion: '保持规律作息和适度运动，给生活留一点空白时间，就是很好的自我照顾。', recommendedExpert: 'general' },
    { level: '轻度紧绷', scoreRange: [10, 18], description: '你最近可能有些紧绷，这是压力下的常见反应，不必因此责怪自己。', suggestion: '可以试试腹式呼吸、渐进式肌肉放松等小练习；每天留十分钟给「担心时间」，其余时间温柔地把自己拉回当下。', recommendedExpert: 'general' },
    { level: '中度紧绷', scoreRange: [19, 27], description: '你的紧绷感比较明显，可能已经开始影响日常生活，值得认真对待。', suggestion: '建议找信任的人聊一聊，或申请一次免费公益咨询。在陪伴下梳理担忧，往往比独自扛着轻得多。', recommendedExpert: 'general' },
    { level: '明显紧绷', scoreRange: [28, 36], description: '你正承受着较重的紧绷与担忧，请不要独自硬撑。', suggestion: '强烈建议申请免费公益心理咨询进行面对面评估。如果感到难以承受，请拨打心理援助热线12356，你一直都不是一个人。', recommendedExpert: 'general' },
  ],
  crisisScore: 1,
};

// 8. 睡眠健康自测
const sleepAssessment: Assessment = {
  id: 'sleep',
  title: '睡眠健康自测',
  description: '看看你的入睡、易醒、多梦和晨起恢复感',
  icon: '🌙',
  category: '状态',
  questions: [
    { id: 'z1', text: '躺下后通常多久能睡着？', options: [{ label: '15分钟内', score: 0 }, { label: '半小时左右', score: 1 }, { label: '1小时左右', score: 2 }, { label: '经常超过1小时', score: 3 }] },
    { id: 'z2', text: '夜里是否容易醒来？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每晚', score: 3 }] },
    { id: 'z3', text: '夜里醒来后是否很难再次入睡？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每晚', score: 3 }] },
    { id: 'z4', text: '是否多梦，醒来觉得像没睡一样？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每晚', score: 3 }] },
    { id: 'z5', text: '早上醒来时感觉恢复精力了吗？', options: [{ label: '基本恢复了', score: 0 }, { label: '恢复一些', score: 1 }, { label: '不太恢复', score: 2 }, { label: '完全没有', score: 3 }] },
    { id: 'z6', text: '白天是否容易犯困、提不起精神？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'z7', text: '睡前是否忍不住刷手机，越刷越晚？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'z8', text: '是否会在睡前反复回想白天的事或担心明天？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每晚', score: 3 }] },
    { id: 'z9', text: '是否比计划的时间早醒，且醒后睡不着？', options: [{ label: '很少', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '几乎每天', score: 3 }] },
    { id: 'z10', text: '睡眠问题是否影响了白天的心情或效率？', options: [{ label: '完全没有', score: 0 }, { label: '有一点', score: 1 }, { label: '比较明显', score: 2 }, { label: '影响很大', score: 3 }] },
    { id: 'z11', text: '你的作息时间是否规律？', options: [{ label: '很规律', score: 0 }, { label: '大致规律', score: 1 }, { label: '不太规律', score: 2 }, { label: '很乱', score: 3 }] },
    { id: 'z12', text: '这种睡眠状态持续多久了？', options: [{ label: '没有困扰', score: 0 }, { label: '不到两周', score: 1 }, { label: '两周到一个月', score: 2 }, { label: '超过一个月', score: 3 }] },
  ],
  results: [
    { level: '睡眠良好', scoreRange: [0, 9], description: '你的睡眠状态整体不错，身体和大脑得到了较好的休息。', suggestion: '继续保持规律作息，睡前一小时远离屏幕，让入睡成为一天中温柔的收尾。', recommendedExpert: 'general' },
    { level: '轻度困扰', scoreRange: [10, 18], description: '你的睡眠有一些小波动，这在忙碌或压力大时很常见。', suggestion: '可以试试固定的睡前仪式：调暗灯光、洗热水澡、深呼吸几轮。白天适度运动、晒晒太阳，也有助于夜里入睡。', recommendedExpert: 'general' },
    { level: '中度困扰', scoreRange: [19, 27], description: '你的睡眠困扰比较明显，可能已经影响到白天的状态，值得认真照顾。', suggestion: '建议建立稳定的起床时间（比入睡时间更重要），下午后减少咖啡因。如果持续困扰，可以申请一次免费公益咨询，聊聊背后的心事。', recommendedExpert: 'general' },
    { level: '明显困扰', scoreRange: [28, 36], description: '你的睡眠正承受着较大困扰，请不要独自硬扛。', suggestion: '强烈建议申请免费公益心理咨询，或前往正规医院睡眠/心理门诊了解。长期睡不好值得被认真对待。', recommendedExpert: 'general' },
  ],
};

// 9. 亲子沟通质量评估（家长自查）
const parentCommAssessment: Assessment = {
  id: 'parentcomm',
  title: '亲子沟通质量评估',
  description: '家长自查：倾听、情绪表达、冲突处理与接纳度',
  icon: '💬',
  category: '家庭',
  questions: [
    { id: 'p1', text: '孩子说话时，我会放下手里的事认真听完', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p2', text: '我会先听完孩子的想法，再表达自己的意见', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p3', text: '孩子愿意主动和我说学校里的事', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p4', text: '孩子哭或发脾气时，我能先接住情绪再讲道理', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p5', text: '发生冲突后，我们会找时间和好、把话说开', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p6', text: '我会在气头上说出让孩子受伤的话', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'p7', text: '孩子犯了错，我愿意听他解释原因', options: [{ label: '总是', score: 0 }, { label: '经常', score: 1 }, { label: '偶尔', score: 2 }, { label: '很少', score: 3 }] },
    { id: 'p8', text: '我能接纳孩子和我期待中不一样的样子', options: [{ label: '完全可以', score: 0 }, { label: '基本可以', score: 1 }, { label: '有些困难', score: 2 }, { label: '很困难', score: 3 }] },
    { id: 'p9', text: '我会向孩子表达「不管怎样，我都爱你」', options: [{ label: '经常', score: 0 }, { label: '偶尔', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'p10', text: '孩子有秘密愿意告诉我，或不怕被我知道', options: [{ label: '基本是', score: 0 }, { label: '部分是', score: 1 }, { label: '不太是', score: 2 }, { label: '完全不是', score: 3 }] },
    { id: 'p11', text: '我们聊天时，多数是轻松的还是审问式的？', options: [{ label: '很轻松', score: 0 }, { label: '比较轻松', score: 1 }, { label: '有点紧张', score: 2 }, { label: '像审问', score: 3 }] },
    { id: 'p12', text: '孩子情绪低落时，会愿意待在我身边', options: [{ label: '基本是', score: 0 }, { label: '有时是', score: 1 }, { label: '不太是', score: 2 }, { label: '完全不是', score: 3 }] },
  ],
  results: [
    { level: '沟通顺畅', scoreRange: [0, 9], description: '你们的亲子沟通整体顺畅，孩子在关系中感到安全，这是很珍贵的。', suggestion: '继续保持倾听和表达爱的习惯。偶尔问一句「今天有什么开心或难过的事吗」，会让联结越来越深。', recommendedExpert: 'family' },
    { level: '基本良好', scoreRange: [10, 18], description: '你们的沟通底子不错，只是在某些时刻容易卡住，这很正常。', suggestion: '可以练习「先听后说」：孩子表达时先复述他的感受（「你觉得很委屈，对吗」），再谈事情。每天十分钟不评价的陪伴就很有效。', recommendedExpert: 'family' },
    { level: '需要调整', scoreRange: [19, 27], description: '你们的沟通可能经常出现卡壳或冲突，孩子在慢慢关上心门，值得停下来看看。', suggestion: '先修复关系再谈教育：从每天一件不批评、不指导的小事开始。也可以申请免费公益家庭咨询，一起找到新的相处方式。', recommendedExpert: 'family' },
    { level: '建议专业支持', scoreRange: [28, 36], description: '你们的亲子沟通正面临较大困难，孩子在关系中可能感到不被理解，建议寻求支持。', suggestion: '强烈建议申请免费公益家庭心理咨询。改变从家长迈出的第一步开始，永远不晚。', recommendedExpert: 'family' },
  ],
};

// 10. 青少年学业压力自测
const academicAssessment: Assessment = {
  id: 'academic',
  title: '青少年学业压力自测',
  description: '看看成绩、比较和期待在你肩上压了多重',
  icon: '📚',
  category: '青少年',
  questions: [
    { id: 'x1', text: '想到考试或成绩，你会感到紧张不安吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x2', text: '看到同学成绩比你好，心里会很难受吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x3', text: '父母或老师的期待，让你觉得喘不过气吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x4', text: '你是否总担心自己「不够好」「比别人差」？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x5', text: '作业或复习任务会拖到很晚才开始吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x6', text: '有没有过假装学习、其实在发呆或逃避的时候？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x7', text: '考试前是否会睡不好、吃不下？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x8', text: '成绩不理想时，你会很难原谅自己吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x9', text: '是否觉得学习只是为了满足大人的期待？', options: [{ label: '不是', score: 0 }, { label: '有一点', score: 1 }, { label: '比较多', score: 2 }, { label: '完全是', score: 3 }] },
    { id: 'x10', text: '放假或休息时，你是否也很难真正放松？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x11', text: '一想到未来（升学、考试），是否感到害怕或麻木？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'x12', text: '压力大的时候，是否出现过不想继续承受、甚至不想活下去的念头？', options: [{ label: '从未', score: 0 }, { label: '有过一闪而过的念头', score: 1 }, { label: '经常出现', score: 2 }, { label: '有具体打算', score: 3 }], isCrisis: true },
  ],
  results: [
    { level: '压力适中', scoreRange: [0, 9], description: '你对学业的感受总体平稳，压力在可以承受的范围。', suggestion: '保持自己的节奏就好。记得给兴趣和休息留位置，它们不是浪费时间，而是给你充电。', recommendedExpert: 'teen' },
    { level: '轻度压力', scoreRange: [10, 18], description: '你肩上有些压力，这在学生时代很常见，不用因此责怪自己。', suggestion: '试试把大任务拆成小块、一次只做一件；学习间隙深呼吸几次。如果心里闷，找信任的人说说，或者来这里聊聊。', recommendedExpert: 'teen' },
    { level: '压力偏大', scoreRange: [19, 27], description: '你正扛着比较重的学业压力，已经开始影响状态，值得被认真看见。', suggestion: '建议申请一次免费公益青少年咨询，把成绩背后的担心说出来。分数是一时的，你的状态更重要。', recommendedExpert: 'teen' },
    { level: '压力明显', scoreRange: [28, 36], description: '你承受的压力已经很重，请一定不要独自硬扛。', suggestion: '强烈建议尽快申请免费公益心理咨询，或告诉信任的大人。如果感到难以承受，请拨打心理援助热线12356，有人愿意听你说。', recommendedExpert: 'teen' },
  ],
  crisisScore: 1,
};

// 11. 社交与自我展现自测
const socialAssessment: Assessment = {
  id: 'social',
  title: '社交与自我展现自测',
  description: '了解「别人的眼光」在你心里占了多大分量',
  icon: '🎭',
  category: '人际',
  questions: [
    { id: 'j1', text: '在人多的场合，你会担心自己被评价吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j2', text: '发言或展示前，是否反复担心「出错出丑」？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j3', text: '是否因为害怕尴尬而回避聚会或活动？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j4', text: '别人没有及时回复消息，你会想「是不是我说错话了」？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j5', text: '发过言后，是否会在心里反复回放刚才的表现？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j6', text: '你是否习惯在心里严厉地批评自己？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j7', text: '认识新朋友对你来说困难吗？', options: [{ label: '很轻松', score: 0 }, { label: '有点紧张', score: 1 }, { label: '比较困难', score: 2 }, { label: '非常回避', score: 3 }] },
    { id: 'j8', text: '在人群中，你是否总尽量降低自己的存在感？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j9', text: '被人注视时（如上台、被点名），身体会不会紧绷、脸红或发抖？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j10', text: '你是否经常拿自己的短处和别人的长处比？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'j11', text: '这种紧张或回避，是否影响了学习、工作或生活？', options: [{ label: '完全没有', score: 0 }, { label: '有一点', score: 1 }, { label: '比较明显', score: 2 }, { label: '影响很大', score: 3 }] },
    { id: 'j12', text: '觉得自己「处处不如人」的时候，是否出现过不想活下去的念头？', options: [{ label: '从未', score: 0 }, { label: '有过一闪而过的念头', score: 1 }, { label: '经常出现', score: 2 }, { label: '有具体打算', score: 3 }], isCrisis: true },
  ],
  results: [
    { level: '自在状态', scoreRange: [0, 9], description: '你在人际中总体自在，别人的目光没有过多地束缚你。', suggestion: '继续保持真实的表达。偶尔的小紧张人人都会有，不必苛求自己表现得完美。', recommendedExpert: 'general' },
    { level: '轻度紧张', scoreRange: [10, 18], description: '你有时会太在意别人的眼光，这很常见，不必因此批评自己。', suggestion: '可以试试「暴露小练习」：从低压力的场合开始，主动说一句话、发一次言，慢慢收集「其实没那么可怕」的体验。', recommendedExpert: 'general' },
    { level: '中度紧张', scoreRange: [19, 27], description: '「被评价」的担心比较明显地影响着你，独处的时间可能越来越多了。', suggestion: '建议申请一次免费公益咨询。在意他人评价的背后，往往藏着对自己的苛刻，陪伴能帮你慢慢松绑。', recommendedExpert: 'general' },
    { level: '明显回避', scoreRange: [28, 36], description: '社交上的紧张和自我批判已经明显影响你的生活，请认真对待这份辛苦。', suggestion: '强烈建议申请免费公益心理咨询。如果心里冒出不想承受的念头，请拨打12356——你比自己以为的更重要。', recommendedExpert: 'general' },
  ],
  crisisScore: 1,
};

// 12. 心理韧性自测
const resilienceAssessment: Assessment = {
  id: 'resilience',
  title: '心理韧性自测',
  description: '看看你面对挫折时的恢复力和自我鼓励能力',
  icon: '🌾',
  category: '状态',
  questions: [
    { id: 'r1', text: '遇到挫折后，你能慢慢调整过来吗？', options: [{ label: '总是能', score: 0 }, { label: '多数能', score: 1 }, { label: '比较难', score: 2 }, { label: '很难', score: 3 }] },
    { id: 'r2', text: '情绪低落时，你有让自己平静下来的办法吗？', options: [{ label: '有好几个', score: 0 }, { label: '有一两个', score: 1 }, { label: '几乎没有', score: 2 }, { label: '完全没有', score: 3 }] },
    { id: 'r3', text: '不顺心的时候，你会对自己说鼓励的话吗？', options: [{ label: '经常会', score: 0 }, { label: '偶尔会', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'r4', text: '你相信自己能想办法渡过难关吗？', options: [{ label: '很相信', score: 0 }, { label: '比较相信', score: 1 }, { label: '不太相信', score: 2 }, { label: '完全不信', score: 3 }] },
    { id: 'r5', text: '失败后，你容易陷入「我就是不行」的想法吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'r6', text: '你觉得自己身上有优点和长处吗？', options: [{ label: '有很多', score: 0 }, { label: '有一些', score: 1 }, { label: '很少', score: 2 }, { label: '想不出来', score: 3 }] },
    { id: 'r7', text: '遇到难题时，你会主动找人商量或求助吗？', options: [{ label: '经常会', score: 0 }, { label: '偶尔会', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'r8', text: '过去的困难经历，你回头看时会觉得「我熬过来了」吗？', options: [{ label: '常常会', score: 0 }, { label: '偶尔会', score: 1 }, { label: '很少', score: 2 }, { label: '从不', score: 3 }] },
    { id: 'r9', text: '生活里有让你感到温暖或期待的小事吗？', options: [{ label: '有很多', score: 0 }, { label: '有一些', score: 1 }, { label: '很少', score: 2 }, { label: '几乎没有', score: 3 }] },
    { id: 'r10', text: '压力大时，你能照顾好自己的吃饭和睡觉吗？', options: [{ label: '基本能', score: 0 }, { label: '多数能', score: 1 }, { label: '比较难', score: 2 }, { label: '很难', score: 3 }] },
    { id: 'r11', text: '你会把一次失败看成「全部完了」吗？', options: [{ label: '从不', score: 0 }, { label: '偶尔', score: 1 }, { label: '经常', score: 2 }, { label: '总是', score: 3 }] },
    { id: 'r12', text: '难到撑不住的时候，是否出现过不想继续承受、甚至不想活下去的念头？', options: [{ label: '从未', score: 0 }, { label: '有过一闪而过的念头', score: 1 }, { label: '经常出现', score: 2 }, { label: '有具体打算', score: 3 }], isCrisis: true },
  ],
  results: [
    { level: '韧性充足', scoreRange: [0, 9], description: '你有不错的心理韧性和自我照顾能力，这是你身上的宝贵资源。', suggestion: '继续保持自我鼓励的习惯。也可以把这份力量分享出去——你的稳定本身就是一种照亮。', recommendedExpert: 'general' },
    { level: '韧性尚可', scoreRange: [10, 18], description: '你有一定的恢复力，只是在压力大的时候容易被耗尽。', suggestion: '建议有意识地储备「能量小事」：列出几件能让你放松的事，在状态好时也坚持做，而不是等到撑不住才想起。', recommendedExpert: 'general' },
    { level: '韧性偏弱', scoreRange: [19, 27], description: '你最近的恢复力偏弱，挫折带来的消耗可能比想象中更大，值得被温柔对待。', suggestion: '建议练习「自我鼓励三句话」：承认辛苦、看见努力、允许慢慢来。也可以申请免费公益咨询，陪你把资源一点点找回来。', recommendedExpert: 'general' },
    { level: '需要支持', scoreRange: [28, 36], description: '你当前的心理韧性几乎耗尽，请一定不要独自硬撑。', suggestion: '强烈建议申请免费公益心理咨询。如果心里冒出不想承受的念头，请拨打心理援助热线12356——你撑了这么久，已经很不容易了。', recommendedExpert: 'general' },
  ],
  crisisScore: 1,
};

export const assessments: Assessment[] = [
  stressAssessment,
  depressionAssessment,
  anxietyAssessment,
  childAssessment,
  teenAssessment,
  academicAssessment,
  marriageAssessment,
  familyAssessment,
  parentCommAssessment,
  sleepAssessment,
  socialAssessment,
  resilienceAssessment,
];

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
