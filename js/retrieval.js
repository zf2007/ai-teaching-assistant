/* ============================================================
 * RAG 检索模块（本地演示实现 · 多课程支持）
 * 模拟真实 RAG 流程中的"检索（Retrieval）"环节：
 *   1. 按当前课程构建中文词典并最大匹配分词
 *   2. 词项加权评分（标题/关键词权重高于正文）
 *   3. 返回 Top-K 片段 + 相关知识点
 * ============================================================ */

const RETRIEVAL = (function () {

  const dictCache = {};

  /* ---------- 1. 按课程构建中文词典 ---------- */
  function buildDict(course) {
    const set = new Set();
    course.topics.forEach(t => {
      t.keywords.forEach(k => set.add(k));
      t.facts.forEach(f => {
        extractCandidates(f.text).forEach(w => { if (w.length >= 2) set.add(w); });
      });
      if (t.formula) extractCandidates(t.formula).forEach(w => { if (w.length >= 2) set.add(w); });
    });
    ["计算", "求", "分析", "公式", "定理", "定律", "求解", "过程", "步骤", "方法",
     "什么", "为什么", "怎么", "如何", "解释", "区别", "关系", "作用", "定义",
     "概念", "原理", "应用", "问题", "题目", "作业", "例题", "习题", "判断",
     "选择", "推导", "证明"].forEach(w => set.add(w));
    return [...set].sort((a, b) => b.length - a.length);
  }

  function getDict(courseId) {
    if (!dictCache[courseId]) {
      const course = Knowledge.getCourse(courseId);
      dictCache[courseId] = buildDict(course);
    }
    return dictCache[courseId];
  }

  function extractCandidates(text) {
    const parts = String(text).split(/[^\u4e00-\u9fffA-Za-z0-9·×÷Ωμωπλ√²³⁻⁺]/);
    const out = [];
    for (const part of parts) {
      if (!part) continue;
      if (/^[\u4e00-\u9fff]+$/.test(part)) {
        for (let len = 4; len >= 2; len--) {
          for (let i = 0; i + len <= part.length; i++) out.push(part.substr(i, len));
        }
      } else if (/^[A-Za-z0-9Ωμωπλ]+$/.test(part)) {
        out.push(part);
      }
    }
    return out;
  }

  /* ---------- 2. 分词：词典最大匹配 ---------- */
  function tokenize(query, courseId) {
    const dict = getDict(courseId);
    const q = String(query).toLowerCase();
    const tokens = [];
    let i = 0;
    while (i < q.length) {
      const m = /^[a-z0-9Ωμωπλ]+/.exec(q.slice(i));
      if (m) { tokens.push(m[0]); i += m[0].length; continue; }
      let matched = null;
      for (let len = Math.min(4, q.length - i); len >= 2; len--) {
        const w = q.substr(i, len);
        if (dict.includes(w)) { matched = w; break; }
      }
      if (matched) { tokens.push(matched); i += matched.length; }
      else i++;
    }
    return [...new Set(tokens)];
  }

  /* ---------- 3. 片段评分 ---------- */
  function scoreFragments(tokens, fragments, topK) {
    const stop = new Set(["求", "计算", "方法", "步骤", "过程", "原理", "问题", "题目", "作业", "例题", "习题", "分析"]);
    const meaningful = tokens.filter(t => t.length >= 2 && !stop.has(t));
    const results = fragments.map(frag => {
      const textLower = (frag.text + " " + frag.keywords.join(" ")).toLowerCase();
      let score = 0;
      meaningful.forEach(t => {
        if (frag.keywords.some(k => k.toLowerCase() === t)) score += 6;
        const count = (textLower.split(t).length - 1);
        score += count * 2;
      });
      return { frag, score };
    });
    results.sort((a, b) => b.score - a.score);
    return results.filter(r => r.score > 0).slice(0, topK || 4);
  }

  /* ---------- 4. 聚合到知识点 ---------- */
  function rankTopics(tokens, courseId) {
    const course = Knowledge.getCourse(courseId);
    const stop = new Set(["求", "计算", "方法", "步骤", "过程", "原理", "问题", "题目", "作业", "例题", "习题", "分析"]);
    const meaningful = tokens.filter(t => t.length >= 2 && !stop.has(t));
    const topicScores = course.topics.map(t => {
      let score = 0;
      const allText = (t.name + " " + t.keywords.join(" ") + " " + t.summary).toLowerCase();
      meaningful.forEach(tok => {
        if (t.keywords.some(k => k.toLowerCase() === tok)) score += 8;
        if (allText.includes(tok)) score += 2;
      });
      return { topic: t, score };
    });
    topicScores.sort((a, b) => b.score - a.score);
    return topicScores.filter(x => x.score > 0).slice(0, 3);
  }

  /* ---------- 5. 问题类型分类 ---------- */
  function classifyQuery(q) {
    const s = String(q);
    if (/怎么|如何|步骤|计算|多少|值|等于|求/.test(s) && !/什么是|解释|区别|为什么/.test(s)) return "计算";
    if (/什么是|解释|含义|定义|概念|区别|为什么|原理|作用|关系|意义/.test(s)) return "概念";
    if (/作业|习题|题目|帮忙|帮我看|不会做|卡住|第.*题/.test(s)) return "作业求助";
    return "综合";
  }

  /* ---------- 6. 对外主入口 ---------- */
  function retrieve(query, options) {
    const courseId = (options && options.course) || Knowledge.getCurrentId();
    const course = Knowledge.getCourse(courseId);
    const t0 = performance.now();
    const tokens = tokenize(query, courseId);
    const hits = scoreFragments(tokens, Knowledge.fragments(course), (options && options.topK) || 4);
    const topics = rankTopics(tokens, courseId);
    const type = classifyQuery(query);
    const elapsed = Math.max(8, Math.round(performance.now() - t0));
    return {
      query, tokens, type, hits, topics,
      elapsedMs: elapsed,
      totalFragments: Knowledge.fragments(course).length,
      totalTokens: tokens.length,
      courseId, courseName: course.name, courseIcon: course.icon
    };
  }

  /* 知识库搜索（知识库页用） */
  function searchKB(query, limit, courseId) {
    const cid = courseId || Knowledge.getCurrentId();
    const course = Knowledge.getCourse(cid);
    const tokens = tokenize(query, cid);
    const hits = scoreFragments(tokens, Knowledge.fragments(course), limit || 6);
    return { tokens, hits };
  }

  return { retrieve, searchKB, tokenize, classifyQuery };
})();
