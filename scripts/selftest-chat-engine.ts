/**
 * chat-engine 快速自测脚本（A/B/C/D/E 五组）
 * 运行：pnpm selftest:engine
 *
 * 模拟真实聊天页调用方式：messageHistory 含专家开场白 + 全部历史消息 + 当前用户消息。
 */

import { generateResponse } from '../src/lib/chat-engine';
import { experts } from '../src/lib/experts';
import { CRISIS_RESPONSE } from '../src/lib/crisis';

type Msg = { role: 'user' | 'assistant'; content: string };

const child = experts.find((e) => e.id === 'child')!;
const teen = experts.find((e) => e.id === 'teen')!;

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
check('B1 保持共情语气(含感受/勇气/爱等)', /感受|勇气|心疼|不是滋味|爱/.test(b1), b1);
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
  'C2 用户给出例外线索→提前进入例外探索',
  /好一点|没那么糟|成功时刻|线索很宝贵|钥匙|还不错/.test(c2),
  c2,
);
const c3 = callChild(['孩子有点闹', '就是脾气大', '有时候也不闹', '他打人最频繁是在幼儿园']);
// 第4条用户消息：下限为 goal，虽含"打人"主题但不得倒退到 focus
check('C3 阶段不倒退(第4条仍为目标设定)', /小目标|这周|一小步|一小步|亲子时光|改善/.test(c3), c3);
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

// ---------- 汇总 ----------
console.log(`\n========== 自测结果: ${passed} 通过, ${failed} 失败 ==========\n`);
if (failed > 0) process.exit(1);
