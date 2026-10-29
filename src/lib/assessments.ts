/**
 * 心理自测中心 - 6套测评量表
 * 每题选项计分，结果给筛查参考+建议+推荐专家
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

export const assessments: Assessment[] = [
  stressAssessment,
  depressionAssessment,
  childAssessment,
  teenAssessment,
  marriageAssessment,
  familyAssessment,
];

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}
