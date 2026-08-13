/* ============================================================
 * 回答生成器（模拟 RAG 的「增强-生成」环节）
 * 基于检索命中的知识库片段，按问题类型生成结构化回答：
 * 【解题思路】【详细步骤】【知识点总结】【易错提醒】
 * ============================================================ */

const GENERATOR = (function () {

  /* 根据检索结果与问题类型组装回答（Markdown） */
  function generate(result) {
    const q = result.query;
    const type = result.type;
    const topics = result.topics;
    const hits = result.hits;

    if (topics.length === 0) {
      return fallbackAnswer(q);
    }

    const topic = topics[0].topic;
    const related = topics.slice(1).map(x => x.topic);

    let md = "";

    /* —— 开场 —— */
    md += `### 💡 关于「${topic.name}」\n\n`;
    md += `${topic.summary}\n\n`;

    if (topic.formula) {
      md += `<div class="formula">${topic.formula}</div>\n\n`;
    }

    /* —— 按类型组织正文 —— */
    if (type === "计算") {
      md += "### 📝 解题思路\n\n";
      if (topic.example && topic.example.steps) {
        topic.example.steps.forEach((s, i) => { md += `${i + 1}. ${s}\n`; });
        md += "\n";
        md += "### ✅ 参考答案\n\n";
        md += `**${topic.example.answer}**\n\n`;
      } else {
        md += "1. 先明确已知量与待求量，画出电路图并标注参考方向。\n";
        md += "2. 选择合适的定理/方法（等效变换、KCL/KVL、戴维南等）建立方程。\n";
        md += "3. 解方程得到结果，注意单位与正负号。\n\n";
      }
    } else if (type === "概念") {
      md += "### 📖 核心要点\n\n";
      topic.facts.slice(0, 3).forEach(f => { md += `- ${f.text}\n`; });
      md += "\n";
      if (topic.formula) {
        md += "### 🧮 关键公式\n\n";
        md += `<div class="formula">${topic.formula}</div>\n\n`;
      }
    } else if (type === "作业求助") {
      md += "### 🧭 思路引导（先自己尝试哦）\n\n";
      md += "我理解你在作业中遇到卡点啦！先给你思路，不直接剧透答案：\n\n";
      if (topic.example && topic.example.steps) {
        md += "1. " + topic.example.steps[0] + "\n";
        md += "2. " + (topic.example.steps[1] || "按上述方法列式求解。") + "\n";
        if (topic.example.steps[2]) md += "3. " + topic.example.steps[2] + "\n";
      } else {
        md += "1. 重新读题，标出所有已知条件与参考方向。\n";
        md += "2. 判断该题考查的知识点（很可能是「" + topic.name + "」）。\n";
        md += "3. 套用对应公式/定理，注意符号与单位。\n";
      }
      md += "\n做完后可以对照下方的【知识点总结】检查思路是否完整～\n\n";
    } else {
      md += "### 📖 核心要点\n\n";
      topic.facts.slice(0, 3).forEach(f => { md += `- ${f.text}\n`; });
      md += "\n";
    }

    /* —— 知识点总结 —— */
    md += "### 🎯 知识点总结\n\n";
    md += `- **${topic.name}**（${topic.chapter}）：${topic.summary}\n`;
    if (topic.formula) md += `- 关键公式：${topic.formula}\n`;
    if (topic.pitfall) md += `- ⚠️ 易错点：${topic.pitfall}\n`;
    md += "\n";

    /* —— 相关知识点 —— */
    if (related.length) {
      md += "### 🔗 相关知识\n\n";
      related.forEach(r => { md += `- ${r.name}：${r.summary}\n`; });
      md += "\n";
    }

    /* —— 来源 —— */
    const srcList = hits.map(h => h.frag.src);
    const uniqSrc = [...new Set(srcList)];
    md += `> 回答基于校本知识库检索生成，参考了 ${hits.length} 个资料片段（${uniqSrc.join("；")}）。`;
    md += `\n> 如有疑问或需要更详细的推导，可以继续追问，我会结合课堂讲授逻辑为你拆解。`;

    return { markdown: md, topic, hits, related };
  }

  /* 未命中知识库时的兜底回答 */
  function fallbackAnswer(q) {
    const md = `### 🤔 这个问题暂时超出了知识库范围\n\n很抱歉，当前课程知识库（电路原理 · 演示版）中还没有找到与「${q}」直接匹配的内容。\n\n`;
    return {
      markdown: md + `**你可以试试：**\n\n` +
        `1. 换个说法再问一次（例如把「咋算」改为「如何计算」）。\n` +
        `2. 从右侧「热门知识点」或下方示例问题中选择一个相关问题。\n` +
        `3. 在「课程知识库」页面搜索关键词，查看已有的知识卡片。\n\n` +
        `> 提示：正式版中，当知识库未命中时系统会自动进入「AI 检索 + 助教审核」的半自动模式，确保回答质量。`,
      topic: null, hits: [], related: []
    };
  }

  /* RAG 过程信息（用于右侧可视化面板） */
  function buildRagFlow(result, answer) {
    const flow = [];
    // 1. 查询解析
    flow.push({
      step: "① 查询解析",
      detail: `将问题分词为 ${result.totalTokens} 个关键词：${result.tokens.join("、") || "（无词典命中）"}`,
      time: result.elapsedMs + "ms"
    });
    // 2. 向量/关键词检索
    flow.push({
      step: "② 知识库检索",
      detail: `在 ${result.totalFragments} 个资料片段中检索，命中 ${result.hits.length} 个相关片段`,
      time: result.elapsedMs + "ms",
      hit: true,
      srcs: result.hits.map(h => h.frag.src)
    });
    // 3. 增强
    flow.push({
      step: "③ 上下文增强",
      detail: `将命中片段重组为上下文，优先级：${result.hits.length ? result.hits[0].frag.src : "无"}`,
      time: "6ms"
    });
    // 4. 生成
    flow.push({
      step: "④ 结构化生成",
      detail: answer.topic ? `按「${result.type}」类型问题生成：【解题思路】【详细步骤】【知识点总结】` : "生成兜底引导回答",
      time: "42ms"
    });
    return flow;
  }

  return { generate, buildRagFlow, fallbackAnswer };
})();
