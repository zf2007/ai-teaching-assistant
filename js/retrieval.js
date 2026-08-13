/* ============================================================
 * RAG 检索模块（本地演示实现 · 多课程支持 · v2）
 * 模拟真实 RAG 流程中的"检索（Retrieval）"环节：
 *   1. 按当前课程构建去噪中文词典并最大匹配分词
 *   2. 词项加权评分（知识点关键词权重远高于正文）
 *   3. 知识点排序与命片段一致，保证回答与引用对应
 * ============================================================ */

const RETRIEVAL = (function () {

  const dictCache = {};

  /* 虚词/助词：用于过滤词典抽取噪声 */
  const STOP_CHARS = "的得了是在和与或这那中上下对于为以把被就都而及等吗呢啊吧之其个了过从到向往有没无们";
  const STOP_WORDS = new Set(["什么","怎么","如何","为什么","请问","请","帮","一下","这个","那个","哪些","哪些","区别","定义","概念","求","算","计算","讲解","解释","多少","为什么","是否","哪些"]);

  /* ---------- 1. 从文本抽取干净候选词（过滤含虚词的窗口） ---------- */
  function cleanCandidates(text) {
    const parts = String(text).split(/[^\u4e00-\u9fffA-Za-z0-9·×÷Ωμωπλ√²³⁻⁺]/);
    const out = [];
    for (const part of parts) {
      if (!part) continue;
      if (/^[\u4e00-\u9fff]+$/.test(part)) {
        for (let len = Math.min(4, part.length); len >= 2; len--) {
          for (let i = 0; i + len <= part.length; i++) {
            const w = part.substr(i, len);
            let hasStop = false;
            for (const c of w) { if (STOP_CHARS.includes(c)) { hasStop = true; break; } }
            if (hasStop) continue;
            // 过滤以操作词开头的候选（避免"求极限""计算方"等噪声）
            if (/^[求算解计问帮查找请]./.test(w)) continue;
            out.push(w);
          }
        }
      } else if (/^[A-Za-z0-9Ωμωπλ]+$/.test(part)) {
        out.push(part);
      }
    }
    return out;
  }

  /* ---------- 2. 按课程构建词典 ---------- */
  function buildDict(course) {
    const set = new Set();
    course.topics.forEach(t => {
      t.keywords.forEach(k => set.add(k));
      cleanCandidates(t.name + " " + t.summary).forEach(w => { if (w.length >= 2) set.add(w); });
      t.facts.forEach(f => cleanCandidates(f.text).forEach(w => { if (w.length >= 2) set.add(w); }));
      if (t.formula) cleanCandidates(t.formula).forEach(w => { if (w.length >= 2) set.add(w); });
    });
    return [...set].sort((a, b) => b.length - a.length);
  }

  function getDict(courseId) {
    if (!dictCache[courseId]) {
      const course = Knowledge.getCourse(courseId);
      dictCache[courseId] = buildDict(course);
    }
    return dictCache[courseId];
  }

  /* ---------- 3. 分词：词典最大匹配（含英文/数字） ---------- */
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
    // 去重保序
    return [...new Set(tokens)];
  }

  /* ---------- 4. 片段评分 ---------- */
  function scoreFragments(tokens, fragments, topK) {
    const meaningful = tokens.filter(t => t.length >= 2 && !STOP_WORDS.has(t));
    const results = fragments.map(frag => {
      const textLower = (frag.text + " " + frag.keywords.join(" ")).toLowerCase();
      let score = 0;
      meaningful.forEach(t => {
        // 知识点关键词精确命中（核心信号，权重大）
        if (frag.keywords.some(k => k.toLowerCase() === t)) score += 10;
        // 片段文本包含
        const count = (textLower.split(t).length - 1);
        score += count * 2;
      });
      return { frag, score };
    });
    results.sort((a, b) => b.score - a.score);
    return results.filter(r => r.score > 0).slice(0, topK || 4);
  }

  /* ---------- 5. 知识点排序：与命片段一致 ---------- */
  function rankTopics(tokens, courseId, hits) {
    const course = Knowledge.getCourse(courseId);
    // 优先用片段聚合：命中片段所属知识点的总得分
    const map = {};
    hits.forEach(h => {
      map[h.frag.topicId] = (map[h.frag.topicId] || 0) + h.score;
    });
    const byHit = course.topics
      .map(t => ({ topic: t, score: map[t.id] || 0 }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (byHit.length) return byHit.slice(0, 3);

    // 无片段命中时退回 token 匹配
    const meaningful = tokens.filter(t => t.length >= 2 && !STOP_WORDS.has(t));
    const byToken = course.topics.map(t => {
      let score = 0;
      const allText = (t.name + " " + t.keywords.join(" ") + " " + t.summary).toLowerCase();
      meaningful.forEach(tok => {
        if (t.keywords.some(k => k.toLowerCase() === tok)) score += 8;
        if (allText.includes(tok)) score += 2;
      });
      return { topic: t, score };
    });
    byToken.sort((a, b) => b.score - a.score);
    return byToken.filter(x => x.score > 0).slice(0, 3);
  }

  /* ---------- 6. 问题类型分类 ---------- */
  function classifyQuery(q) {
    const s = String(q);
    const hasCalc = /求|计算|算出|等于|多少|值|解|运算|怎么算|如何求|求解/.test(s);
    const hasConcept = /什么是|是什么|解释|含义|定义|概念|区别|为什么|原理|作用|关系|意义|条件|特点|性质|介绍|讲讲|讲解/.test(s);
    if (hasConcept && !hasCalc) return "概念";
    if (hasCalc && !hasConcept) return "计算";
    if (/作业|习题|题目|帮忙|不会做|卡住|第.*题|求助/.test(s)) return "作业求助";
    return "综合";
  }

  /* ---------- 7. 对外主入口 ---------- */
  function retrieve(query, options) {
    const courseId = (options && options.course) || Knowledge.getCurrentId();
    const course = Knowledge.getCourse(courseId);
    const t0 = performance.now();
    const tokens = tokenize(query, courseId);
    const frags = Knowledge.fragments(course);
    const hits = scoreFragments(tokens, frags, (options && options.topK) || 4);
    const topics = rankTopics(tokens, courseId, hits);
    const type = classifyQuery(query);
    const elapsed = Math.max(8, Math.round(performance.now() - t0));
    return {
      query, tokens, type, hits, topics,
      elapsedMs: elapsed,
      totalFragments: frags.length,
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
