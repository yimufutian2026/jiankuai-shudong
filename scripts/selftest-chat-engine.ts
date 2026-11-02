/**
 * chat-engine 快速自测脚本（A~I 九组）
 * 运行：pnpm selftest:engine
 *
 * 模拟真实聊天页调用方式：messageHistory 含专家开场白 + 全部历史消息 + 当前用户消息。
 * A 危机回归 / B 共情针对性 / C 内容驱动阶段 / D 儿童模板多样性 / E 行动针对性
 * F 开场建约与探意愿 / G 具体化追问 / H 身份-行为分离(含误判) / I 例外→行动转化
 * J 量表数据完整性(数量/题量/计分/分级覆盖/危机标记/合规措辞)
 * K 人格风格自测(维度结构/16型覆盖/类型计算/措辞合规)
 */

import { generateResponse } from '../src/lib/chat-engine';
import { experts } from '../src/lib/experts';
import { CRISIS_RESPONSE } from '../src/lib/crisis';
import { assessments, getAssessmentById, computePersonalityType, getPersonalityOutcome } from '../src/lib/assessments';

type Msg = { role: 'user' | 'assistant'; content: string };

const child = experts.find((e) => e.id === 'child')!;
const teen = experts.find((e) => e.id === 'teen')!;
const marriage = experts.find((e) => e.id === 'marriage')!;
const family = experts.find((e) => e.id === 'family')!;
const general = experts.find((e) => e.id === 'general')!;

/** 构造与聊天页一致的历史：开场白 + 交替消息，最后一条为当前用户消息 */
function buildHistory(userTexts: string[]): Msg[] {
  const hist: Msg[] = [{ role: 'assistant', content: '(专家开场白)' }];
  userTexts.forEach((t, i) => {
    hist.push({ role: 'user', content: t });
    if (i < userTexts.length - 1) hist.push({ role: 'assistant', content: '(上轮回复)' });
  });
  return hist;
}

function callChild(userTexts: string[]): string {
  return generateResponse({
    expert: child,
    messageHistory: buildHistory(userTexts),
    userMessage: userTexts[userTexts.length - 1],
  });
}

let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? `\n     实际输出: ${detail.slice(0, 120)}` : ''}`);
  }
}

// ---------- A 组：危机识别回归（安全边界不可破坏） ----------
console.log('\n【A组】危机识别回归');
const a1 = callChild(['我不想活了']);
check('A1 "我不想活了" 触发危机话术', a1 === CRISIS_RESPONSE, a1);
const a2 = callChild(['感觉活着好累，想结束一切']);
check('A2 "结束一切" 触发危机话术', a2 === CRISIS_RESPONSE, a2);
const a3 = callChild(['孩子最近有点闹脾气']);
check('A3 正常消息不误触发危机', a3 !== CRISIS_RESPONSE && !a3.includes('12356'), a3);
const a4 = generateResponse({
  expert: child,
  messageHistory: buildHistory(['孩子闹', '嗯', '还是闹', '怎么办呢', '我真的不想活了']),
  userMessage: '我真的不想活了',
});
check('A4 多轮后触发危机仍即时拦截', a4 === CRISIS_RESPONSE, a4);

// ---------- B 组：共情阶段针对性（情境提取） ----------
console.log('\n【B组】共情阶段针对性');
const b1 = callChild(['我家孩子最近总是大哭大闹，不想上学，我真的好累']);
check('B1 共情融入具体情境词(大哭大闹/不想上学)', b1.includes('大哭大闹') || b1.includes('不想上学'), b1);
check('B1 保持共情语气(含感受/勇气/爱等)', /感受|勇气|心疼|不是滋味|爱|坦诚/.test(b1), b1);
const b2 = callChild(['我最近心情不太好，说不上来为什么']);
check('B2 无情境词时退回通用共情模板', b2.length > 10 && !b2.includes('{'), b2);
const b3 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['最近考试压力特别大，晚上睡不着']),
  userMessage: '最近考试压力特别大，晚上睡不着',
});
check('B3 青少年域情境共情(考试/压力)', b3.includes('考试') || b3.includes('压力'), b3);

// ---------- C 组：内容驱动的阶段推进 ----------
console.log('\n【C组】内容驱动的阶段推进');
const c1 = callChild(['孩子最近不太好', '他总是打人，我都不知道怎么办了']);
check('C1 第2条消息含具体问题→聚焦阶段针对性追问', c1.includes('动手') || c1.includes('打人'), c1);
const c2 = callChild(['孩子最近不太好', '不过周末他乖的时候还挺配合的']);
check(
  'C2 用户给出例外线索→提前进入例外探索/转化',
  /好一点|没那么糟|成功时刻|线索很宝贵|钥匙|还不错|起点|放大|多出现|正反馈/.test(c2),
  c2,
);
const c3 = callChild(['孩子有点闹', '就是脾气大', '有时候也不闹', '他打人最频繁是在幼儿园']);
// 第4条用户消息：下限为 goal，虽含"打人"主题但不得倒退到 focus
check('C3 阶段不倒退(第4条仍为目标设定)', /小目标|这周|一周|一小步|亲子时光|改善|小事/.test(c3), c3);
const c4 = callChild(['孩子有点闹']);
check('C4 首轮固定共情(不直接进聚焦)', !c4.includes('我想更深入') && !c4.includes('先把注意力'), c4);

// ---------- D 组：儿童域模板个性化（模板池多样性） ----------
console.log('\n【D组】儿童域模板个性化');
const exceptionSet = new Set<string>();
for (let i = 0; i < 60; i++) {
  // 第3条用户消息 → 例外阶段
  exceptionSet.add(callChild(['孩子有点闹', '嗯', '就是脾气大，说也不听']));
}
check(`D1 例外阶段差异化模板 ≥4 种 (实际 ${exceptionSet.size} 种)`, exceptionSet.size >= 4);

const goalSet = new Set<string>();
for (let i = 0; i < 60; i++) {
  // 第4条用户消息 → 目标阶段
  goalSet.add(callChild(['孩子有点闹', '嗯', '就是脾气大', '好的我明白了']));
}
check(`D2 小目标阶段差异化模板 ≥4 种 (实际 ${goalSet.size} 种)`, goalSet.size >= 4);

const actionTexts: string[] = [];
for (let i = 0; i < 200; i++) {
  // 第5条用户消息 → 行动阶段（中性文本，不命中主题）
  actionTexts.push(callChild(['孩子有点闹', '嗯', '好的', '我明白了', '谢谢你，还有别的建议吗']));
}
check(
  'D3 儿童行动模板覆盖: 情绪命名/冷静角/作息/地板时光',
  ['情绪命名', '冷静角', '作息', '地板时光'].every((k) => actionTexts.some((t) => t.includes(k))),
);

// ---------- E 组：行动阶段针对性 + 工具箱贴合 ----------
console.log('\n【E组】行动阶段针对性');
const e1 = callChild(['孩子有点闹', '嗯', '他经常动手', '说了没用', '他还是打人，怎么办']);
check('E1 行动阶段针对"打人"给具体方法', e1.includes('不可以打人') || e1.includes('动手'), e1);
check('E1 工具箱贴合儿童域(toolbox 中出现)', child.toolbox.some((t) => e1.includes(t)), e1);
check('E1 保留免责声明', e1.includes('不构成医学诊断'), e1);
const e2 = callChild(['孩子闹', '晚上也不睡', '嗯', '是的', '他还是不肯睡，每天要哄到很晚']);
check('E2 行动阶段针对"睡眠"给具体方法', e2.includes('睡前') && e2.includes('仪式'), e2);
const e3 = callChild(['孩子闹', '嗯', '好的', '明白', '谢谢你，还有别的建议吗']);
check('E3 无主题命中时行动建议仍含工具箱方法', child.toolbox.some((t) => e3.includes(t)), e3);

// ---------- F 组：模块1·开场建约与探意愿 ----------
console.log('\n【F组】开场建约与探意愿（仅 child/teen 域）');
const f1 = callChild(['我家孩子最近总是大哭大闹']);
check('F1 家长口吻: 保留共情(大哭大闹)', f1.includes('大哭大闹'), f1);
check('F1 家长口吻: 家长版保密约定+目标引导', /不会原样转达|只保存在您自己的设备/.test(f1) && f1.includes('最想先解决孩子'), f1);
const f2 = callChild(['我在学校被欺负了']);
check('F2 孩子本人口吻: 保密边界+意愿探询+目标', f2.includes('不会原样告诉爸爸妈妈') && /自己想聊|爸爸妈妈让你来/.test(f2) && f2.includes('最想聊什么'), f2);
check('F2 孩子本人口吻: 不用家长口吻(无“您的设备”)', !f2.includes('您的设备'), f2);
const f3 = generateResponse({ expert: teen, messageHistory: buildHistory(['我最近心里很难受']), userMessage: '我最近心里很难受' });
check('F3 teen域: 保密边界含危险例外', f3.includes('不会原样告诉你的家人') && f3.includes('伤害自己或他人的危险'), f3);
check('F3 teen域: 意愿+目标引导', /自己想聊聊|被家人带来/.test(f3) && f3.includes('最想聊哪一件'), f3);
const f4 = generateResponse({ expert: marriage, messageHistory: buildHistory(['我们最近总吵架']), userMessage: '我们最近总吵架' });
check('F4 非child/teen域不追加建约', !f4.includes('不会原样') && !f4.includes('最想聊'), f4);
const f5 = callChild(['你好', '无所谓，不知道聊什么']);
check('F5 “无所谓/不知道聊什么”温和接住', /没关系|不急|随便聊|轻松/.test(f5) && f5 !== CRISIS_RESPONSE, f5);
const f6 = generateResponse({ expert: teen, messageHistory: buildHistory(['嗯', '随便吧']), userMessage: '随便吧' });
check('F6 teen“随便吧”温和接住', /没关系|不急|随便聊|轻松|最小的地方/.test(f6), f6);
const f7 = generateResponse({ expert: teen, messageHistory: buildHistory(['嗯', '我妈让我来的，我其实不想来']), userMessage: '我妈让我来的，我其实不想来' });
check('F7 “被家人带来”非自愿接住', /没关系|不急|别扭|只聊你愿意聊|轻松|最小的地方/.test(f7), f7);
const f8 = callChild(['孩子闹', '他总是打人，我都不知道怎么办了']);
check('F8 有明确主题时“不知道怎么办”不触发接住', f8.includes('动手') || f8.includes('打人'), f8);

// ---------- G 组：模块2·具体化追问 ----------
console.log('\n【G组】具体化追问');
const g1 = callChild(['孩子不太好', '他最近总是发脾气']);
check('G1 无锚点→追问落到哪一天/什么时刻', /哪一天|什么时刻|什么时候|什么时间|具体的例子/.test(g1) && g1.includes('发脾气'), g1);
const g2 = callChild(['孩子不太好', '他上周二在幼儿园打人']);
check('G2 有锚点→顺着线索追问细节', /当时|接下来|之后|在场|之前|对比/.test(g2), g2);
const g3 = generateResponse({ expert: teen, messageHistory: buildHistory(['我有点烦', '最近考试压力特别大']), userMessage: '最近考试压力特别大' });
check('G3 teen无锚点→落到最近一次/哪一天', /哪一天|什么时候|什么时间|最近一次|最近的一次/.test(g3), g3);
const g4 = generateResponse({ expert: teen, messageHistory: buildHistory(['嗯', '我昨天晚上又失眠了']), userMessage: '我昨天晚上又失眠了' });
check('G4 teen有锚点→顺线索追问', /当时|接下来|第一个念头|之前/.test(g4), g4);
const g5 = generateResponse({ expert: marriage, messageHistory: buildHistory(['嗯', '就是感觉最近不太对劲']), userMessage: '就是感觉最近不太对劲' });
check('G5 无主题时退回通用聚焦模板', g5.length > 10 && !g5.includes('{'), g5);

// ---------- H 组：模块3·身份层/行为层分离（含误判测试） ----------
console.log('\n【H组】身份层/行为层分离');
const h1 = callChild(['我觉得我没用，什么都做不好']);
check('H1 强信号“我没用”触发分离', /这一次|这次/.test(h1) && h1.includes('这个人'), h1);
check('H1 分离回应非危机话术', h1 !== CRISIS_RESPONSE, h1);
const h2 = generateResponse({ expert: teen, messageHistory: buildHistory(['这次考砸了，我就是个废物，努力也没用']), userMessage: '这次考砸了，我就是个废物，努力也没用' });
check('H2 弱信号+自我指向(废物/努力也没用)触发分离', h2.includes('这个人') && /一次|这一次/.test(h2), h2);
const h3 = callChild(['最近心情不好，有点烦躁']);
check('H3 误判测试: 普通情绪不触发分离', !h3.includes('你这个人') && !h3.includes('我这个人') && h3 !== CRISIS_RESPONSE, h3);
check('H3 普通情绪走正常共情(含建约)', h3.includes('不会原样'), h3);
const h4 = callChild(['孩子有点闹', '嗯', '好的', '明白', '我说了他也不听，说了没用']);
check('H4 误判测试: “说了没用”(评价方法)不触发分离', !h4.includes('你这个人') && !h4.includes('我这个人'), h4);
check('H5 分离回应不做诊断/承诺，且以提问收尾', !/诊断|治疗|保证|治愈/.test(h1) && h1.includes('？'), h1);
const h6 = generateResponse({ expert: teen, messageHistory: buildHistory(['我没救了']), userMessage: '我没救了' });
check('H6 弱信号短句“我没救了”触发分离', h6.includes('这个人'), h6);

// ---------- I 组：模块4·例外→行动转化 ----------
console.log('\n【I组】例外→行动转化');
const i1Texts: string[] = [];
for (let i = 0; i < 60; i++) {
  i1Texts.push(callChild(['孩子有点闹', '嗯', '不过周末他乖的时候还挺配合']));
}
check('I1 有例外线索→直接进入起点放大转化', i1Texts.every((t) => /起点|放大|多出现|配方/.test(t)), i1Texts[0]);
check('I2 child域转化含正反馈引导(60次覆盖)', i1Texts.some((t) => t.includes('正反馈') || t.includes('具体的肯定')));
const i3 = callChild(['孩子有点闹', '嗯', '就是脾气大，说也不听']);
check('I3 无例外线索→保持例外探索提问', /好一点|没那么糟|成功时刻|线索|钥匙|比较好|力量/.test(i3), i3);
const i4 = generateResponse({ expert: teen, messageHistory: buildHistory(['压力大', '嗯', '不过有时候没考砸的时候还行']), userMessage: '不过有时候没考砸的时候还行' });
check('I4 teen域例外→转化', /起点|多出现|放大|配方/.test(i4), i4);
const i5 = generateResponse({ expert: marriage, messageHistory: buildHistory(['我们经常吵架', '唉', '不过也有好的时候']), userMessage: '不过也有好的时候' });
check('I5 marriage域例外→转化', /起点|多出现|放大|配方/.test(i5), i5);

// ---------- J 组：量表数据完整性 ----------
console.log('\n【J组】量表数据完整性');
const scaleAssessments = assessments.filter((a) => a.type !== 'personality');
check('J1 共13套测评(12套量表+1套人格)', assessments.length === 13 && scaleAssessments.length === 12, `实际 ${assessments.length} 套`);
const newScaleIds = ['anxiety', 'sleep', 'parentcomm', 'academic', 'social', 'resilience'];
const newScales = newScaleIds.map((id) => assessments.find((a) => a.id === id));
check('J2 新增6套全部存在', newScales.every((a) => a !== undefined), newScaleIds.join(','));
check(
  'J3 每套量表题量达标',
  scaleAssessments.every((a) => a.questions.length >= 6 && a.questions.length <= 15),
  scaleAssessments.map((a) => `${a.id}:${a.questions.length}`).join(' ')
);
check(
  'J4 新增6套每套12-15题',
  newScales.every((a) => a !== undefined && a.questions.length >= 12 && a.questions.length <= 15),
  newScales.map((a) => `${a?.id}:${a?.questions.length}`).join(' ')
);
check(
  'J5 量表题目选项为0-3分计分且带id',
  scaleAssessments.every((a) =>
    a.questions.every(
      (q) =>
        q.id.length > 0 &&
        q.options.length >= 2 &&
        q.options.every((o) => o.score >= 0 && o.score <= 3)
    )
  ),
  ''
);
check(
  'J6 每套量表结果分级连续覆盖满分区间',
  scaleAssessments.every((a) => {
    const maxScore = a.questions.length * 3;
    for (let s = 0; s <= maxScore; s++) {
      if (!a.results.some((r) => s >= r.scoreRange[0] && s <= r.scoreRange[1])) return false;
    }
    return true;
  }),
  ''
);
check(
  'J7 危机条目均标记isCrisis且推荐专家有效',
  assessments.every((a) => a.results.every((r) => experts.some((e) => e.id === r.recommendedExpert))) &&
    ['anxiety', 'academic', 'social', 'resilience'].every((id) => {
      const a = assessments.find((x) => x.id === id);
      return a !== undefined && a.questions.some((q) => q.isCrisis === true) && (a.crisisScore ?? 0) >= 1;
    }),
  ''
);
check(
  'J8 危机条目文案包含危机指向词',
  assessments.every((a) =>
    a.questions.every((q) => !q.isCrisis || /不想活|伤害自己|活不下去|结束|念头/.test(q.text))
  ),
  ''
);
check(
  'J9 建议文案不做诊断/不承诺疗效',
  assessments.every((a) => a.results.every((r) => !/诊断|确诊|治疗疾病|保证治愈|包治/.test(r.description + r.suggestion))),
  ''
);
check(
  'J10 量表id唯一',
  new Set(assessments.map((a) => a.id)).size === assessments.length,
  ''
);

// ---------- K 组：人格风格自测 ----------
console.log('\n【K组】人格风格自测');
const personality = getAssessmentById('personality');
check('K1 人格测试存在且类型为personality', personality !== undefined && personality.type === 'personality', '');
check(
  'K2 4维度定义完整(EI/NS/TF/JP)',
  personality?.dimensions?.length === 4 &&
    ['EI', 'NS', 'TF', 'JP'].every((k) => personality.dimensions?.some((d) => d.key === k)),
  personality?.dimensions?.map((d) => d.key).join(',') ?? ''
);
check(
  'K3 共20题且每维度5题',
  personality !== undefined &&
    personality.questions.length === 20 &&
    (personality.dimensions ?? []).every(
      (d) => personality.questions.filter((q) => q.dimension === d.key).length === 5
    ),
  personality ? `总${personality.questions.length}题` : ''
);
check(
  'K4 每题2个选项且pole合法(与维度两极一致)',
  personality !== undefined &&
    personality.questions.every((q) => {
      const dim = personality.dimensions?.find((d) => d.key === q.dimension);
      return (
        q.options.length === 2 &&
        q.options.every((o) => o.pole === dim?.leftPole || o.pole === dim?.rightPole) &&
        new Set(q.options.map((o) => o.pole)).size === 2
      );
    }),
  ''
);
check(
  'K5 16种类型画像全覆盖',
  personality?.typeProfiles !== undefined &&
    ['E', 'I'].every((e) =>
      ['N', 'S'].every((n) =>
        ['T', 'F'].every((t) =>
          ['J', 'P'].every((j) => personality.typeProfiles?.[`${e}${n}${t}${j}`] !== undefined)
        )
      )
    ) &&
    Object.keys(personality.typeProfiles).length === 16,
  personality?.typeProfiles ? `${Object.keys(personality.typeProfiles).length}种` : ''
);
// K6 计算正确性：全左极答案 → ENTP 等待验证。构造全选左极(score=1)与全选右极(score=2)
if (personality) {
  const allLeft: Record<string, number> = {};
  const allRight: Record<string, number> = {};
  personality.questions.forEach((q) => {
    allLeft[q.id] = q.options[0].score;
    allRight[q.id] = q.options[1].score;
  });
  check('K6a 全选左极→ENTJ', computePersonalityType(personality, allLeft) === 'ENTJ', computePersonalityType(personality, allLeft));
  check('K6b 全选右极→ISFP', computePersonalityType(personality, allRight) === 'ISFP', computePersonalityType(personality, allRight));
  // 混合：EI左(E)、NS右(S)、TF左(T)、JP右(P) → ESTP
  const mixed: Record<string, number> = {};
  personality.questions.forEach((q) => {
    mixed[q.id] = q.dimension === 'EI' || q.dimension === 'TF' ? q.options[0].score : q.options[1].score;
  });
  check('K6c 混合答案→ESTP', computePersonalityType(personality, mixed) === 'ESTP', computePersonalityType(personality, mixed));
  const outcome = getPersonalityOutcome(personality, allLeft);
  check(
    'K6d getPersonalityOutcome返回类型/画像/4条维度明细',
    outcome !== null && outcome.type === 'ENTJ' && outcome.dimensionLines.length === 4 &&
      outcome.dimensionLines.every((l) => l.count === 5 && l.total === 5),
    outcome ? `${outcome.type} ${outcome.profile.title}` : 'null'
  );
} else {
  check('K6 类型计算', false, 'personality 未找到');
}
check(
  'K7 画像措辞温和且无诊断/疗效表述',
  personality !== undefined &&
    Object.values(personality.typeProfiles ?? {}).every(
      (p) => !/诊断|确诊|治疗|治愈|疾病|正常吗|有病|障碍/.test(p.title + p.description + p.suggestion)
    ),
  ''
);
check(
  'K8 人格测试无危机条目、无分级结果(自我探索向)',
  personality !== undefined &&
    personality.questions.every((q) => q.isCrisis !== true) &&
    personality.results.length === 0,
  ''
);

// ---------- L 组：模块5/6·限制性信念破框与前提假设 ----------
console.log('\n【L组】限制性信念破框与前提假设');
const l1 = generateResponse({
  expert: marriage,
  messageHistory: buildHistory(['我们最近关系很僵', '我老公就应该懂我，可他什么都不说']),
  userMessage: '我老公就应该懂我，可他什么都不说',
});
check('L1 “应该如此”→破框回应', /尺子|我希望|主动权|在意的是/.test(l1) && l1 !== CRISIS_RESPONSE, l1);
const l2 = generateResponse({
  expert: family,
  messageHistory: buildHistory(['家里关系很紧张', '都是他妈害的，只有她改变我们家才能好']),
  userMessage: '都是他妈害的，只有她改变我们家才能好',
});
check('L2 “托付心态”→拿回主动权', /钥匙|拿回|两件事|你自己做|为自己/.test(l2), l2);
const l3 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['学习压力大', '我没办法了，只能这样忍着']),
  userMessage: '我没办法了，只能这样忍着',
});
check('L3 “没有办法”→三个办法破框', /旧的做法|第二个、第三个|办法一多|如果有一个办法/.test(l3), l3);
const l4 = generateResponse({
  expert: marriage,
  messageHistory: buildHistory(['心情不好', '他没办法来接我，我很失望']),
  userMessage: '他没办法来接我，我很失望',
});
check('L4 误判防护:“他没办法”(陈述事实)不触发破框', !/旧的做法|办法一多|如果有一个办法/.test(l4), l4);
const l5 = generateResponse({
  expert: general,
  messageHistory: buildHistory(['心里烦', '最近心情不好，做什么都没劲']),
  userMessage: '最近心情不好，做什么都没劲',
});
check('L5 误判防护:普通情绪不触发破框', !/尺子|钥匙|旧的做法|第二个、第三个/.test(l5), l5);
const l6Texts: string[] = [];
for (let i = 0; i < 40; i++) {
  l6Texts.push(generateResponse({
    expert: child,
    messageHistory: buildHistory(['我家孩子不听话', '我没办法了，打也打了骂也骂了']),
    userMessage: '我没办法了，打也打了骂也骂了',
  }));
}
check('L6 均命中“没有办法”破框(40次)', l6Texts.every((t) => /旧的做法|第二个、第三个|如果有一个办法|办法一多/.test(t)), l6Texts[0]);
check('L6b child域含家长版破框变体(40次覆盖)', l6Texts.some((t) => t.includes('同一招') || t.includes('孩子')), l6Texts[0]);
const l7 = generateResponse({
  expert: marriage,
  messageHistory: buildHistory(['他应该懂我']),
  userMessage: '他应该懂我',
});
check('L7 首轮不触发破框(保留共情)', !/尺子|主动权|钥匙/.test(l7), l7);
const l8 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['压力大', '嗯', '好的', '那我接下来做点什么']),
  userMessage: '那我接下来做点什么',
});
check('L8 目标阶段前置前提假设换框句', /两个人|改变不了另一个人|有效果比有道理|旧的做法|三个解决办法|资源|情绪没有对错|动机|沟通的意义|旧地图|正面的需要|换一条走法/.test(l8), l8);
check(
  'L9 破框/前提模板不做诊断不承诺疗效',
  [l1, l2, l3, l8, ...l6Texts].every((t) => !/诊断|确诊|治疗疾病|保证治愈|包治/.test(t)),
  ''
);

// ---------- M 组：模块7/8·理解层次与五大技法 ----------
console.log('\n【M组】理解层次与五大技法');
const m1 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['我有点烦', '上周三考试前我慌得不行']),
  userMessage: '上周三考试前我慌得不行',
});
check('M1 有锚点focus→追加理解层次探问', /标签|信了它多久|从什么时候开始|对自己说了句什么|能做到/.test(m1), m1);
const m2 = generateResponse({
  expert: general,
  messageHistory: buildHistory(['心里有事', '那件忘不掉的事总是反复想起，晚上睡不好']),
  userMessage: '那件忘不掉的事总是反复想起，晚上睡不好',
});
check('M2 反复想起→逐步抽离法', m2.includes('逐步抽离') && /第一步|第二步/.test(m2), m2);
check('M2b 抽离法含安全提示(太强烈就停下)', /停下来|回到当下|掌控/.test(m2), m2);
const m3 = generateResponse({
  expert: marriage,
  messageHistory: buildHistory(['心里有气', '我咽不下这口气，无法原谅他']),
  userMessage: '我咽不下这口气，无法原谅他',
});
check('M3 怨恨→一分为二法', m3.includes('一分为二') && /第一步|第二步/.test(m3), m3);
const m4 = generateResponse({
  expert: marriage,
  messageHistory: buildHistory(['关系紧张', '我们一说话就吵，他根本不理解我']),
  userMessage: '我们一说话就吵，他根本不理解我',
});
check('M4 沟通僵局→感知位置平衡法', m4.includes('感知位置') && /第一位置|第二位置|第三位置/.test(m4), m4);
const m5 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['心情不好', '我讨厌这样的自己']),
  userMessage: '我讨厌这样的自己',
});
check('M5 自我厌恶→接受自己法', m5.includes('接受自己') && /第一步|第二步/.test(m5), m5);
const m6 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['有点紧张', '下周要演讲比赛，我特别没信心，怕自己不行']),
  userMessage: '下周要演讲比赛，我特别没信心，怕自己不行',
});
check('M6 信心不足→借力法', m6.includes('借力') && /第一步|第二步/.test(m6), m6);
const m7 = generateResponse({
  expert: child,
  messageHistory: buildHistory(['孩子不听话', '我们一说话就吵']),
  userMessage: '我们一说话就吵',
});
check('M7 域限制:child域不触发感知位置(仅teen/marriage/family)', !m7.includes('感知位置'), m7);
const m8 = generateResponse({
  expert: teen,
  messageHistory: buildHistory(['聊聊', '他害怕失败，所以不敢报名']),
  userMessage: '他害怕失败，所以不敢报名',
});
check('M8 误判防护:无“我”不触发借力法', !m8.includes('借力'), m8);
const m9 = generateResponse({
  expert: child,
  messageHistory: buildHistory(['聊聊孩子', '我对孩子没信心，总觉得他做不好']),
  userMessage: '我对孩子没信心，总觉得他做不好',
});
check('M9 误判防护:“对孩子没信心”不触发借力法', !m9.includes('借力'), m9);
check(
  'M10 技法脚本不做诊断不承诺疗效',
  [m2, m3, m4, m5, m6].every((t) => !/诊断|确诊|治疗疾病|保证治愈|包治/.test(t)),
  ''
);

// ---------- 汇总 ----------
console.log(`\n========== 自测结果: ${passed} 通过, ${failed} 失败 ==========\n`);
if (failed > 0) process.exit(1);
