/* ============================================================
 * AI 智能助教 · 主应用逻辑（多课程版）
 * 模块：课程切换 / AI 答疑 / 每日一题 / 错题本 / 课程知识库 /
 *       学习报告 / 设置
 * ============================================================ */

const App = (function () {

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const LS_KEY = "aita_store_v2";
  let store = null;

  const today = () => new Date().toISOString().slice(0, 10);
  const DAILY_TRIAL_LIMIT = 5;   // 免费版每日免费试用次数

  function loadStore() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      store = raw ? JSON.parse(raw) : null;
    } catch (e) { store = null; }
    if (!store) {
      store = {
        currentCourse: COURSES[0].id,
        chatCount: 0,
        chatByDay: {},
        chatByCourse: {},
        daily: { correct: 0, total: 0, byDay: {}, history: [] },
        wrongbook: [],
        lastTopicStats: {},
        trial: { date: "", used: 0 },
        isPro: false,
        api: { key: "", base: "", model: "" }
      };
      saveStore();
    }
    if (!store.currentCourse || !Knowledge.getCourse(store.currentCourse)) {
      store.currentCourse = COURSES[0].id;
      saveStore();
    }
    Knowledge.setCurrent(store.currentCourse);
    return store;
  }
  function saveStore() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (e) {}
  }

  const curCourse = () => Knowledge.getCourse(store.currentCourse);

  /* ---------------- 免费试用 / 会员 ---------------- */
  function getTrialInfo() {
    if (!store.trial || store.trial.date !== today()) {
      store.trial = { date: today(), used: 0 };
      saveStore();
    }
    return store.trial;
  }
  function remainingTrials() {
    if (store.isPro) return Infinity;
    const t = getTrialInfo();
    return Math.max(0, DAILY_TRIAL_LIMIT - t.used);
  }
  function updateTrialUI() {
    const box = $("#trial-box");
    if (!box) return;
    const text = $("#trial-text");
    const fill = $("#trial-fill");
    if (store.isPro) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const remain = remainingTrials();
    text.textContent = `今日免费试用：${remain}/${DAILY_TRIAL_LIMIT} 次`;
    fill.style.width = Math.round(remain / DAILY_TRIAL_LIMIT * 100) + "%";
  }
  function openUpgradeModal(reason) {
    $("#upgrade-modal").hidden = false;
  }
  function closeUpgradeModal() {
    $("#upgrade-modal").hidden = true;
  }

  /* ---------------- 课程切换 ---------------- */
  function renderCoursePicker() {
    const sel = $("#course-select");
    sel.innerHTML = COURSES.map(c =>
      `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
    sel.value = store.currentCourse;
    updateCourseUI();
  }
  function updateCourseUI() {
    const c = curCourse();
    $("#course-icon").textContent = c.icon;
    $("#course-select").value = c.id;
    document.documentElement.style.setProperty("--course-color", c.color || "#4f6ef7");
    const dot = document.querySelector(".course-picker .course-dot");
    if (dot) dot.style.background = c.color || "#22b07d";
  }
  function switchCourse(id) {
    if (id === store.currentCourse) return;
    store.currentCourse = id;
    Knowledge.setCurrent(id);
    saveStore();
    updateCourseUI();
    resetChat();
    renderAll();
  }

  /* 切换学科：重置聊天区，示例问题与 AI 自我介绍随学科变化 */
  function resetChat() {
    $("#chat-messages").innerHTML = "";
    chatBusy = false;
    updateSuggestions();
    welcomeMessage();
  }

  /* 按当前学科生成示例问题 */
  function updateSuggestions() {
    const box = $("#suggestions");
    if (!box) return;
    const c = curCourse();
    const examples = COURSE_EXAMPLES[c.id] || [
      "什么是" + (c.topics[0] ? c.topics[0].name : "这门课") + "？",
      "帮我讲讲这门课的重点",
      "这门课有哪些易错点？",
      "怎么复习这门课？"
    ];
    box.innerHTML = examples.map(q => `<button class="chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("");
  }
  function renderAll() {
    navigate(pageNow);
    renderWrongbook();
    renderDaily();
    renderKnowledge();
    renderReport();
  }

  /* ---------------- 页面导航 ---------------- */
  let pageNow = "chat";
  function navigate(page) {
    pageNow = page;
    $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    $$(".mnav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    $$(".page").forEach(p => p.classList.remove("active"));
    const el = $("#page-" + page);
    if (el) el.classList.add("active");
    const titles = { chat: "AI 答疑", daily: "每日一题", wrongbook: "错题本", knowledge: "课程知识库", report: "学习报告", settings: "设置" };
    $("#topbar-title").textContent = titles[page] || "AI 答疑";
    if (page === "chat") { welcomeMessage(); $("#chat-input").focus(); }
    if (page === "knowledge") renderKnowledge();
    if (page === "report") renderReport();
    if (page === "wrongbook") renderWrongbook();
    if (page === "daily") renderDaily();
  }

  /* ================= AI 答疑 ================= */
  let chatBusy = false;
  const welcomeByCourse = {
    python: "我是 Python 程序设计 AI 助教，知识库来自《Python语言程序设计基础》教材，覆盖基本数据类型、控制结构、函数与代码复用、组合数据类型、字符串、文件与数据格式化、异常处理。",
    java: "我是 Java 程序设计 AI 助教，知识库来自《Java从入门到精通》与《Java编程思想》，覆盖语言基础、流程控制、数组、字符串、类与对象、封装、继承多态、接口抽象类、异常处理与集合框架。",
    chem: "我是基于校本《大学化学》课件构建的 AI 助教，覆盖气体液体、溶液、热力学、化学平衡、酸碱电离、氧化还原、原子与分子结构等章节。",
    orgchem: "我是有机化学 AI 助教，知识库来自校本有机化学课件，覆盖同分异构、杂化与空间结构、芳香性、亲核取代、加成消除反应与有机物酸碱性。",
    polymer: "我是高分子化学 AI 助教，知识库来自校本高分子化学课件，覆盖高分子基本概念、缩聚与加聚反应、结构与性能、新型高分子材料。",
    drawing: "我是工程制图 AI 助教，知识库来自校本《机械制图（电类）》课件，覆盖投影法与三视图、点线面的投影、平面立体与曲面立体、截交线与相贯线、组合体、剖视图、零件图与螺纹。",
    algorithm: "我是算法 AI 助教，知识库来自《算法导论（原书第3版）》（CLRS），覆盖算法基础与插入排序、渐近记号、分治策略、堆排序、快速排序、线性时间排序、散列表、二叉搜索树、红黑树、动态规划、贪心算法、图的基本算法、最小生成树与最短路径、NP 完全性。",
    complex: "我是复变函数与积分变换 AI 助教，知识库来自《复变函数与积分变换（第5版）》（李红），覆盖复数与复变函数、解析函数、复变函数的积分、幂级数与洛朗级数、留数及其应用、共形映射、傅里叶变换与拉普拉斯变换。",
    calculus: "我是高等数学 AI 助教，知识库来自《高等数学（同济第七版）》，覆盖函数与极限、导数与微分、微分中值定理与导数的应用、不定积分、定积分及其应用、微分方程。",
    linealge: "我是线性代数 AI 助教，知识库来自《线性代数（同济第六版）》，覆盖行列式、矩阵及其运算、初等变换与线性方程组、向量组的线性相关性、特征值与特征向量、相似矩阵与二次型。",
    probstat: "我是概率论与数理统计 AI 助教，知识库来自《概率论与数理统计（盛骤第四版）》，覆盖随机事件与概率、随机变量及其分布、多维随机变量、数字特征、大数定律与中心极限定理、参数估计与假设检验。",
    physics: "我是大学物理 AI 助教，知识库来自《大学物理学》（上海交通大学物理教研室编），覆盖力学（运动学、牛顿定律、功与能、动量角动量、刚体）、振动与波、热学、电磁学、波动光学与量子物理。",
    analog: "我是模拟电子技术 AI 助教，知识库来自《模拟电子技术基础》（童诗白、华成英），覆盖半导体器件、基本放大电路、多级放大、集成运放、负反馈、信号运算、功率放大与直流电源。",
    signals: "我是信号与系统 AI 助教，知识库来自《信号与系统（第2版）》（奥本海姆），覆盖信号与系统、LTI 系统与卷积、傅里叶级数与变换、采样定理、拉普拉斯变换、Z 变换与系统函数。",
    circuit: "我是基于校本《电路原理》课程资料构建的 AI 助教，覆盖电路基本定律、等效变换、一阶动态电路、正弦稳态与谐振等章节。"
  };

  function welcomeMessage() {
    if ($("#chat-messages").children.length) return;
    const c = curCourse();
    const md = `### 👋 你好，我是「${c.name}」AI 智能助教！

${welcomeByCourse[c.id] || "基于校本课程知识库构建。"}

**试试这样问我：**
- 概念类：*「什么是 X？」*
- 计算类：*「怎么求 X？」*
- 作业求助：*「这道题我不会做」*

每条回答都会给出【解题思路】【详细步骤】【知识点总结】，并在右侧展示 RAG 检索过程与引用来源。`;
    appendMsg("ai", renderMarkdown(md), `<span>🤖 ${c.icon} ${c.name} AI 助教</span><span>·</span><span>基于校本知识库</span>`);
  }

  function appendMsg(role, html, meta) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + role;
    const avatar = role === "ai" ? "🤖" : "🙋";
    wrap.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div class="msg-col">
        <div class="msg-bubble">${html}</div>
        ${meta ? `<div class="msg-meta">${meta}</div>` : ""}
      </div>`;
    $("#chat-messages").appendChild(wrap);
    $("#chat-messages").scrollTop = $("#chat-messages").scrollHeight;
    return wrap;
  }

  function renderSources(hits) {
    if (!hits || !hits.length) return "";
    const uniq = [...new Set(hits.map(h => h.frag.src))];
    return `<div class="msg-sources">${uniq.map(s =>
      `<span class="src-chip" data-src="${escapeHtml(s)}">📄 ${escapeHtml(s)}</span>`).join("")}</div>`;
  }

  function updateRagFlow(flow) {
    const box = $("#rag-flow");
    if (!box) return;
    if (flow === null) {
      box.innerHTML = `<div class="rag-empty">向 AI 提问后，这里会展示「检索 → 增强 → 生成」的完整过程与引用来源。</div>`;
      return;
    }
    box.innerHTML = flow.map(f => `
      <div class="rag-step ${f.hit ? "hit" : ""}">
        <div class="step-title">${f.step} <span class="step-time">${f.time}</span></div>
        <div class="step-detail">${f.detail}</div>
        ${f.srcs && f.srcs.length ? `<div class="step-src">📄 ${f.srcs.slice(0, 2).join("；")}</div>` : ""}
      </div>`).join("");
  }

  function askAI(question, opts) {
    question = (question || "").trim();
    if (!question || chatBusy) return;

    // 免费版试用次数检查
    if (!store.isPro) {
      const t = getTrialInfo();
      if (t.used >= DAILY_TRIAL_LIMIT) {
        appendMsg("ai", renderMarkdown("### ⏳ 今日免费试用次数已用完\n\n免费版每天可免费问答 **" + DAILY_TRIAL_LIMIT + " 次**，今天的次数已用完～\n\n升级 **AI 助教 Pro（¥9.9/月）** 即可无限次提问，还可解锁高级错题本与个性化学习计划。"), `<span>⏳ 试用次数用尽</span>`);
        openUpgradeModal("trial-exhausted");
        return;
      }
      t.used++;
      saveStore();
      updateTrialUI();
    }

    chatBusy = true;

    store.chatCount++;
    store.chatByDay[today()] = (store.chatByDay[today()] || 0) + 1;
    const cid = store.currentCourse;
    store.chatByCourse[cid] = (store.chatByCourse[cid] || 0) + 1;
    saveStore();

    appendMsg("user", escapeHtml(question));

    const typingWrap = document.createElement("div");
    typingWrap.className = "msg ai";
    typingWrap.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    $("#chat-messages").appendChild(typingWrap);
    $("#chat-messages").scrollTop = $("#chat-messages").scrollHeight;

    const result = RETRIEVAL.retrieve(question, { topK: 4, course: cid });

    if (result.topics.length) {
      const t = result.topics[0].topic;
      const key = cid + "::" + t.name;
      store.lastTopicStats[key] = (store.lastTopicStats[key] || 0) + 1;
      saveStore();
    }

    const finish = (markdown, hits, topicName) => {
      setTimeout(() => {
        typingWrap.remove();
        const html = renderMarkdown(markdown) + renderSources(hits);
        const c = curCourse();
        const meta = `<span>🤖 ${c.icon} ${c.name} AI 助教</span><span>·</span><span>${result.elapsedMs + 42}ms</span>`;
        appendMsg("ai", html, meta);
        updateRagFlow(GENERATOR.buildRagFlow(result, { topic: topicName ? { name: topicName } : null, type: result.type }));
        chatBusy = false;
      }, opts && opts.noDelay ? 0 : 380 + Math.random() * 400);
    };

    const cfg = store.api;
    if (cfg && cfg.key) {
      callLLM(cfg, question, result).then(llmMd => {
        if (llmMd) finish(llmMd, result.hits, result.topics[0] && result.topics[0].topic.name);
        else finishLocal();
      }).catch(() => finishLocal());
    } else {
      finishLocal();
    }

    function finishLocal() {
      const answer = GENERATOR.generate(result);
      finish(answer.markdown, answer.hits, answer.topic && answer.topic.name);
    }
  }

  async function callLLM(cfg, question, result) {
    const base = (cfg.base || "https://api.deepseek.com/v1").replace(/\/+$/, "");
    const model = cfg.model || "deepseek-chat";
    const context = result.hits.map(h => `[资料：${h.frag.src}]\n${h.frag.text}`).join("\n\n");
    const system = `你是「${result.courseName}」AI 智能助教，基于 RAG 技术为大学生提供课程答疑。
你的回答必须严格基于下面提供的校本课程知识库资料，与课堂讲授逻辑保持一致。
回答须结构化，包含：【解题思路】【详细步骤】【知识点总结】三个部分，使用 Markdown 格式。
如果资料不足以回答问题，请明确说明并给出引导，不要编造。

===== 校本课程知识库资料 =====
${context || "（未检索到相关资料）"}`;
    const res = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.key },
      body: JSON.stringify({ model, messages: [
        { role: "system", content: system },
        { role: "user", content: question }
      ], temperature: 0.3, max_tokens: 1200 })
    });
    if (!res.ok) throw new Error("API error " + res.status);
    const data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message.content;
  }

  /* ================= 每日一题 ================= */
  function dailyIndex(courseId) {
    const qs = Knowledge.getCourse(courseId).questions;
    let h = 0;
    const d = today();
    for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) % 9973;
    return h % qs.length;
  }

  function renderDaily() {
    const c = curCourse();
    const qs = c.questions;
    if (!qs.length) { $("#daily-body").innerHTML = "<div class='side-card'>该课程暂无题库。</div>"; return; }
    const idx = dailyIndex(c.id);
    const q = qs[idx];
    $("#daily-sub").textContent = `${c.icon} ${c.name} · ${today()} · ${q.level} · ${q.tag}`;
    $("#daily-tip").textContent = "易错题往往考查「符号方向」「单位换算」「适用条件」三个环节。答题后记得看解析，把错误归因到具体知识点。";

    const hist = store.daily.history.find(h => h.date === today() && h.course === c.id);
    const body = $("#daily-body");
    if (hist && hist.done) {
      body.innerHTML = `<div class="daily-q">${escapeHtml(q.q)}</div>
        <div class="daily-opts">${q.options.map((o, i) =>
          `<div class="daily-opt ${i === q.answer ? "correct" : (i === hist.pick ? "wrong" : "")} disabled">${String.fromCharCode(65 + i)}. ${escapeHtml(o)}</div>`).join("")}</div>
        <div class="daily-answer">
          <h4>${hist.pick === q.answer ? "✅ 回答正确 🎉" : "❌ 回答错误"}</h4>
          <h4>📖 解析</h4><p>${escapeHtml(q.explain)}</p>
          <h4>🎯 知识点</h4><p>${escapeHtml(topicName(q.topic, c.id))}</p>
          <p style="margin-top:10px"><button class="btn ghost" id="daily-redo">再答一次</button></p>
        </div>`;
      bindDailyRedo(c.id);
    } else {
      body.innerHTML = `<div class="daily-q">${escapeHtml(q.q)}</div>
        <div class="daily-opts">${q.options.map((o, i) =>
          `<div class="daily-opt" data-i="${i}">${String.fromCharCode(65 + i)}. ${escapeHtml(o)}</div>`).join("")}</div>`;
      $$("#daily-body .daily-opt").forEach(opt => {
        opt.addEventListener("click", () => submitDaily(c.id, q, parseInt(opt.dataset.i, 10)));
      });
    }
    renderDailyStats();
  }

  function topicName(tid, courseId) {
    const t = Knowledge.getCourse(courseId).topics.find(x => x.id === tid);
    return t ? t.name : "未知";
  }

  function submitDaily(courseId, q, pick) {
    const correct = pick === q.answer;
    store.daily.total++;
    if (correct) store.daily.correct++;
    store.daily.byDay[today()] = store.daily.byDay[today()] || { correct: 0, total: 0 };
    store.daily.byDay[today()].total++;
    if (correct) store.daily.byDay[today()].correct++;
    store.daily.history = store.daily.history.filter(h => !(h.date === today() && h.course === courseId));
    store.daily.history.push({ date: today(), course: courseId, qid: q.id, pick, done: true });
    saveStore();

    const opts = $$("#daily-body .daily-opt");
    opts.forEach((o, i) => {
      o.classList.add("disabled");
      if (i === q.answer) o.classList.add("correct");
      if (i === pick && !correct) o.classList.add("wrong");
    });
    const box = document.createElement("div");
    box.className = "daily-answer";
    box.innerHTML = `<h4>${correct ? "✅ 回答正确！" : "❌ 回答错误"}</h4>
      <h4>📖 解析</h4><p>${escapeHtml(q.explain)}</p>
      <h4>🎯 关联知识点</h4><p>${escapeHtml(topicName(q.topic, courseId))} —— 可在「课程知识库」中查看详细内容</p>`;
    $("#daily-body").appendChild(box);
    renderDailyStats();
  }

  function bindDailyRedo(courseId) {
    const btn = $("#daily-redo");
    if (btn) btn.addEventListener("click", () => {
      store.daily.history = store.daily.history.filter(h => !(h.date === today() && h.course === courseId));
      saveStore();
      renderDaily();
    });
  }

  function renderDailyStats() {
    const total = store.daily.total;
    const correct = store.daily.correct;
    const rate = total ? Math.round(correct / total * 100) : 0;
    const box = $("#daily-stats");
    if (!box) return;
    box.innerHTML = `
      <div class="stat-row"><span class="k">累计答题</span><span class="v">${total} 题</span></div>
      <div class="stat-row"><span class="k">答对</span><span class="v">${correct} 题</span></div>
      <div class="stat-row"><span class="k">正确率</span><span class="v">${rate}%</span></div>
      <div class="stat-row"><span class="k">连续学习</span><span class="v">${streakDays()} 天</span></div>`;
  }

  function streakDays() {
    const days = Object.keys(store.daily.byDay).sort();
    if (!days.length) return 0;
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      const rec = store.daily.byDay[key] || store.chatByDay[key];
      if (rec) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  /* ================= 错题本 ================= */
  function renderWrongbook() {
    const list = store.wrongbook;
    const badge = $("#wrongbook-badge");
    badge.hidden = !list.length;
    badge.textContent = list.length;
    $("#wb-empty").hidden = list.length > 0;
    const grid = $("#wb-grid");
    if (!list.length) { grid.innerHTML = ""; return; }
    grid.innerHTML = list.slice().sort((a, b) => b.ts - a.ts).map((w, i) => {
      const c = Knowledge.getCourse(w.course);
      return `
      <div class="wb-card" data-idx="${i}">
        ${w.img ? `<img class="wb-card-img" src="${w.img}" alt="错题图片">` : ""}
        <div class="wb-card-q">${escapeHtml(w.question || "(未填写题目内容)")}</div>
        <div class="wb-card-meta">
          <span class="tag" style="background:${c.color}22;color:${c.color}">${c.icon} ${escapeHtml(c.name)}</span>
          <span class="tag tag-orange">${escapeHtml(topicName(w.topic, w.course))}</span>
          <span class="tag ${w.mastered ? "tag-green" : "tag-red"}">${w.mastered ? "已掌握" : "未掌握"}</span>
        </div>
        <div class="wb-card-time">${new Date(w.ts).toLocaleString("zh-CN")}</div>
      </div>`;
    }).join("");
    $$(".wb-card").forEach(card => {
      card.addEventListener("click", () => showWrongbookDetail(parseInt(card.dataset.idx, 10)));
    });
  }
  function showWrongbookDetail(idx) {
    const w = store.wrongbook[idx];
    if (!w) return;
    const c = Knowledge.getCourse(w.course);
    const recs = similarQuestions(w.course, w.topic, w.question || "");
    $("#wb-detail-body").innerHTML = `
      <div class="detail-block"><div class="db-label">📝 题目</div><div class="db-value">${escapeHtml(w.question || "（无文本，见图片）")}</div></div>
      ${w.img ? `<div class="detail-block"><div class="db-label">🖼️ 题目图片</div><div class="db-value"><img src="${w.img}" alt=""></div></div>` : ""}
      <div class="detail-block"><div class="db-label">💭 我的错误原因</div><div class="db-value">${escapeHtml(w.reason || "未填写")}</div></div>
      <div class="detail-block"><div class="db-label">📚 所属课程</div><div class="db-value">${c.icon} ${escapeHtml(c.name)}</div></div>
      <div class="detail-block"><div class="db-label">🎯 关联知识点</div><div class="db-value">${escapeHtml(topicName(w.topic, w.course))}（${escapeHtml(chapterOf(w.course, w.topic))}）</div></div>
      <div class="detail-block">
        <div class="db-label">🔁 AI 相似题推荐</div>
        <div class="rec-list">${recs.length ? recs.map(r => `<div class="rec-item">📌 ${escapeHtml(r.q)}</div>`).join("") : "<div class='rec-item'>暂无相似题，建议复习对应知识点。</div>"}</div>
      </div>
      <div class="detail-block">
        <div class="db-label">✍️ 掌握状态</div>
        <div class="db-value">
          <button class="btn ${w.mastered ? "ghost" : "primary"}" id="wb-toggle-mastered">${w.mastered ? "标记为未掌握" : "标记为已掌握 ✓"}</button>
          <button class="btn danger-ghost" id="wb-delete">删除该错题</button>
        </div>
      </div>`;
    $("#wb-detail-modal").hidden = false;
    $("#wb-toggle-mastered").addEventListener("click", () => {
      store.wrongbook[idx].mastered = !store.wrongbook[idx].mastered;
      saveStore(); renderWrongbook(); showWrongbookDetail(idx);
    });
    $("#wb-delete").addEventListener("click", () => {
      store.wrongbook.splice(idx, 1);
      saveStore(); renderWrongbook(); closeModal("wb-detail-modal");
    });
  }

  function chapterOf(courseId, tid) {
    const t = Knowledge.getCourse(courseId).topics.find(x => x.id === tid);
    return t ? t.chapter : "";
  }

  function similarQuestions(courseId, tid, text) {
    const scored = Knowledge.getCourse(courseId).questions.map(q => {
      let score = 0;
      if (q.topic === tid) score += 3;
      const words = ["求", "计算", "什么", "哪个", "判断", "关于", "下列", "酸", "碱", "反应", "结构", "分子", "定律", "方程", "常数", "电势"];
      words.forEach(w => { if (text.includes(w) && q.q.includes(w)) score++; });
      return { q, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(x => x.q);
  }

  function openWbModal() {
    $("#wb-question").value = "";
    $("#wb-reason").value = "";
    $("#wb-preview").hidden = true;
    $("#wb-upload-hint").hidden = false;
    $("#wb-file").value = "";
    window.__wbImg = "";
    const c = curCourse();
    const sel = $("#wb-topic");
    sel.innerHTML = c.topics.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
    $("#wb-modal").hidden = false;
    $("#wb-question").focus();
  }

  function closeModal(id) {
    $("#" + id).hidden = true;
  }

  /* ================= 课程知识库 ================= */
  function renderKnowledge() {
    const c = curCourse();
    const st = Knowledge.stats(c.id);
    $("#kb-stats").innerHTML = `
      <div class="kb-stat"><div class="num">${st.docs}</div><div class="label">课程章节</div></div>
      <div class="kb-stat"><div class="num">${st.fragments}</div><div class="label">知识片段</div></div>
      <div class="kb-stat"><div class="num">${st.topics}</div><div class="label">核心知识点</div></div>
      <div class="kb-stat"><div class="num">${st.questions}</div><div class="label">题库题目</div></div>`;
    renderKBGrid("");
  }

  function renderKBGrid(filter) {
    const c = curCourse();
    const grid = $("#kb-grid");
    const kw = (filter || "").trim();
    let topics = c.topics;
    if (kw) {
      const r = RETRIEVAL.searchKB(kw, 20, c.id);
      const ids = new Set(r.hits.map(h => h.frag.topicId));
      topics = c.topics.filter(t => ids.has(t.id) || t.name.includes(kw) || t.keywords.some(k => k.includes(kw)));
    }
    if (!topics.length) {
      grid.innerHTML = `<div class="side-card" style="grid-column:1/-1;text-align:center;color:var(--text-3)">没有找到与「${escapeHtml(kw)}」相关的知识点，试试其他关键词～</div>`;
      return;
    }
    grid.innerHTML = topics.map(t => {
      const firstFact = t.facts[0] ? t.facts[0].text : "";
      return `
      <div class="kb-card" data-id="${t.id}">
        <div class="kb-card-head">
          <div>
            <div class="kb-card-title">${escapeHtml(t.name)}</div>
            <div class="kb-card-ch">${escapeHtml(t.chapter)} · ${t.keywords.slice(0, 4).map(escapeHtml).join(" / ")}</div>
          </div>
          <button class="expand-btn">展开 ▾</button>
        </div>
        <div class="kb-card-body">
          <p style="font-size:13px;color:var(--text-2)">${escapeHtml(t.summary)}</p>
          ${t.formula ? `<div class="formula">${escapeHtml(t.formula)}</div>` : ""}
          <div class="kb-frag">${escapeHtml(firstFact)}<div class="frag-src">${escapeHtml(t.facts[0].src)}</div></div>
          ${t.example ? `<p style="font-size:12.5px;color:var(--text-2);margin:8px 0"><b>例题：</b>${escapeHtml(t.example.q)} → <b>${escapeHtml(t.example.answer)}</b></p>` : ""}
          ${t.pitfall ? `<p style="font-size:12.5px;color:#c67b00;background:rgba(245,166,35,.1);padding:8px 10px;border-radius:8px;margin-top:8px">⚠️ ${escapeHtml(t.pitfall)}</p>` : ""}
        </div>
      </div>`;
    }).join("");
    $$(".kb-card").forEach(card => {
      const head = card.querySelector(".kb-card-head");
      const btn = card.querySelector(".expand-btn");
      head.addEventListener("click", () => {
        card.classList.toggle("open");
        btn.textContent = card.classList.contains("open") ? "收起 ▴" : "展开 ▾";
      });
    });
  }

  /* ================= 学习报告 ================= */
  function renderReport() {
    const c = curCourse();
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = (d.getMonth() + 1) + "/" + d.getDate();
      const val = (store.chatByDay[key] || 0) + (store.daily.byDay[key] ? store.daily.byDay[key].total : 0);
      week.push({ label, val });
    }
    const max = Math.max(1, ...week.map(w => w.val));
    $("#weekly-chart").innerHTML = week.map(w => `
      <div class="bar-col">
        <div class="bar-val">${w.val || ""}</div>
        <div class="bar" style="height:${Math.round(w.val / max * 100)}%"></div>
        <div class="bar-label">${w.label}</div>
      </div>`).join("");

    const topicCount = {};
    c.topics.forEach(t => { topicCount[t.id] = 0; });
    Object.keys(store.lastTopicStats || {}).forEach(key => {
      const [cid, name] = key.split("::");
      if (cid !== c.id) return;
      const t = c.topics.find(x => x.name === name);
      if (t) topicCount[t.id] += store.lastTopicStats[key];
    });
    store.daily.history.filter(h => h.course === c.id).forEach(h => {
      const q = c.questions.find(x => x.id === h.qid);
      if (q) topicCount[q.topic] += h.pick === q.answer ? 2 : 1;
    });
    const sorted = c.topics.map(t => ({ t, v: topicCount[t.id] })).sort((a, b) => b.v - a.v).slice(0, 6);
    const mMax = Math.max(1, ...sorted.map(x => x.v));
    $("#mastery-list").innerHTML = sorted.map(x => `
      <div class="mastery-row">
        <div class="m-name"><span>${escapeHtml(x.t.name)}</span><span>${x.v ? Math.min(100, Math.round(x.v / mMax * 100)) + "%" : "未开始"}</span></div>
        <div class="mastery-bar"><div class="mastery-fill" style="width:${x.v ? Math.round(x.v / mMax * 100) : 3}%"></div></div>
      </div>`).join("") || "<div style='color:var(--text-3)'>暂无学习数据</div>";

    const totalQ = store.chatCount;
    const wrongCount = store.wrongbook.length;
    const acc = store.daily.total ? Math.round(store.daily.correct / store.daily.total * 100) : 0;
    $("#report-grid").innerHTML = `
      <div class="report-card"><div class="rc-label">💬 累计提问</div><div class="rc-value">${totalQ}</div><div class="rc-sub">AI 答疑对话次数</div></div>
      <div class="report-card"><div class="rc-label">📚 ${c.icon} ${escapeHtml(c.name)}提问</div><div class="rc-value">${store.chatByCourse[c.id] || 0}</div><div class="rc-sub">本课程答疑次数</div></div>
      <div class="report-card"><div class="rc-label">📅 今日活跃</div><div class="rc-value">${(store.chatByDay[today()] || 0) + (store.daily.byDay[today()] ? store.daily.byDay[today()].total : 0)}</div><div class="rc-sub">今日提问 + 答题</div></div>
      <div class="report-card"><div class="rc-label">🎯 每日一题正确率</div><div class="rc-value">${acc}%</div><div class="rc-sub">${store.daily.correct}/${store.daily.total} 题</div></div>
      <div class="report-card"><div class="rc-label">📓 错题数量</div><div class="rc-value">${wrongCount}</div><div class="rc-sub">已收录错题</div></div>
      <div class="report-card"><div class="rc-label">🔥 连续学习</div><div class="rc-value">${streakDays()}</div><div class="rc-sub">天</div></div>`;

    let insight = "🎯 <strong>学习洞察：</strong>";
    if (totalQ === 0 && store.daily.total === 0) {
      insight += "你还没有学习记录，去「AI 答疑」问一道题，或完成「每日一题」开始积累数据吧！";
    } else {
      insight += `本周累计学习 ${week.reduce((s, w) => s + w.val, 0)} 次`;
      if (acc >= 80) insight += `，每日一题正确率 ${acc}% 表现优秀 💪。`;
      else if (acc >= 50) insight += `，正确率 ${acc}% 还有提升空间，重点关注错题知识点并复习。`;
      else insight += `，正确率 ${acc}% 偏低，建议从基础知识点开始巩固。`;
      if (wrongCount > 0) insight += `错题本中有 ${wrongCount} 道错题，记得定期复习并利用相似题推荐巩固。`;
    }
    $("#report-insight").innerHTML = insight;
  }

  /* ================= 设置 ================= */
  function applyTheme(dark) {
    document.body.classList.toggle("dark", dark);
    $("#theme-btn").textContent = dark ? "☀️" : "🌙";
    $("#dark-switch").checked = dark;
  }

  function renderSettings() {
    $("#dark-switch").checked = document.body.classList.contains("dark");
    $("#rag-switch").checked = localStorage.getItem("aita_rag_vis") !== "0";
    $("#api-key").value = store.api.key || "";
    $("#api-base").value = store.api.base || "";
    $("#api-model").value = store.api.model || "";
    const md = $("#member-desc");
    const mb = $("#member-toggle");
    if (md && mb) {
      if (store.isPro) {
        md.textContent = "AI 助教 Pro · 无限次提问（¥9.9/月）";
        mb.textContent = "切回免费版";
        mb.classList.remove("primary");
        mb.classList.add("ghost");
      } else {
        const r = remainingTrials();
        md.textContent = "免费版 · 今日剩余免费试用 " + r + "/" + DAILY_TRIAL_LIMIT + " 次";
        mb.textContent = "升级 Pro";
        mb.classList.remove("ghost");
        mb.classList.add("primary");
      }
    }
  }

  /* ================= 事件绑定 ================= */
  function bindEvents() {
    $$(".nav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));
    $$(".mnav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.page)));

    $("#course-select").addEventListener("change", e => switchCourse(e.target.value));

    $("#theme-btn").addEventListener("click", () => {
      applyTheme(!document.body.classList.contains("dark"));
      localStorage.setItem("aita_dark", document.body.classList.contains("dark") ? "1" : "0");
    });
    $("#dark-switch").addEventListener("change", e => {
      applyTheme(e.target.checked);
      localStorage.setItem("aita_dark", e.target.checked ? "1" : "0");
    });
    $("#rag-switch").addEventListener("change", e => {
      localStorage.setItem("aita_rag_vis", e.target.checked ? "1" : "0");
    });

    $("#send-btn").addEventListener("click", () => sendFromInput());
    $("#chat-input").addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFromInput(); }
    });
    $("#chat-input").addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 140) + "px";
    });
    $("#suggestions").addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (chip) { $("#chat-input").value = chip.dataset.q; sendFromInput(); }
    });
    renderHotTags();
    $("#hot-tags").addEventListener("click", e => {
      const tag = e.target.closest(".hot-tag");
      if (tag) { $("#chat-input").value = "请解释：" + tag.textContent; sendFromInput(); }
    });
    $("#chat-messages").addEventListener("click", e => {
      const chip = e.target.closest(".src-chip");
      if (chip) {
        navigate("knowledge");
        $("#kb-search").value = chip.dataset.src;
        renderKBGrid(chip.dataset.src);
      }
    });

    $("#daily-next").addEventListener("click", () => {
      const c = curCourse();
      const qs = c.questions;
      if (!qs.length) return;
      const idx = dailyIndex(c.id);
      const next = qs[(idx + 1 + Math.floor(Math.random() * (qs.length - 1))) % qs.length];
      const body = $("#daily-body");
      body.innerHTML = `<div class="daily-q">${escapeHtml(next.q)}</div>
        <div class="daily-opts">${next.options.map((o, i) =>
          `<div class="daily-opt" data-i="${i}">${String.fromCharCode(65 + i)}. ${escapeHtml(o)}</div>`).join("")}</div>`;
      $("#daily-sub").textContent = `${today()} · 换题练习 · ${next.level} · ${next.tag}`;
      $$("#daily-body .daily-opt").forEach(opt => {
        opt.addEventListener("click", () => submitDaily(c.id, next, parseInt(opt.dataset.i, 10)));
      });
    });

    $("#wb-add-btn").addEventListener("click", openWbModal);
    $("#wb-empty-add").addEventListener("click", openWbModal);
    $("#wb-modal-close").addEventListener("click", () => closeModal("wb-modal"));
    $("#wb-modal-cancel").addEventListener("click", () => closeModal("wb-modal"));
    $("#wb-detail-close").addEventListener("click", () => closeModal("wb-detail-modal"));
    $$(".modal-mask").forEach(m => m.addEventListener("click", e => { if (e.target === m) m.hidden = true; }));
    $("#wb-upload").addEventListener("click", () => $("#wb-file").click());
    $("#wb-file").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        window.__wbImg = ev.target.result;
        const img = $("#wb-preview");
        img.src = ev.target.result;
        img.hidden = false;
        $("#wb-upload-hint").hidden = true;
      };
      reader.readAsDataURL(file);
    });
    $("#wb-modal-save").addEventListener("click", () => {
      const question = $("#wb-question").value.trim();
      const reason = $("#wb-reason").value.trim();
      const topic = $("#wb-topic").value;
      const courseId = store.currentCourse;
      if (!question && !window.__wbImg) { $("#wb-question").focus(); return; }
      store.wrongbook.push({
        ts: Date.now(), question, reason, topic, img: window.__wbImg || "",
        course: courseId, mastered: false
      });
      saveStore();
      closeModal("wb-modal");
      renderWrongbook();
      const t = Knowledge.getCourse(courseId).topics.find(x => x.id === topic);
      if (t) {
        const hint = document.createElement("div");
        hint.className = "side-card";
        hint.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:200;max-width:320px;animation:fadeUp .3s";
        hint.innerHTML = `<div class="side-card-title">📌 已收录错题</div>
          <div style="font-size:12.5px;color:var(--text-2)">已根据知识点「${escapeHtml(t.name)}」为你匹配相似题，可在错题详情中查看。<br><br>
          <button class="btn primary" style="width:100%" onclick="document.querySelector('[data-page=\\'daily\\']').click()">去练相似题</button></div>`;
        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 6000);
      }
    });

    let kbTimer = null;
    $("#kb-search").addEventListener("input", e => {
      clearTimeout(kbTimer);
      kbTimer = setTimeout(() => renderKBGrid(e.target.value), 200);
    });

    $("#api-save").addEventListener("click", () => {
      store.api.key = $("#api-key").value.trim();
      store.api.base = $("#api-base").value.trim();
      store.api.model = $("#api-model").value.trim();
      saveStore();
      const st = $("#api-status");
      st.textContent = store.api.key ? "✅ 已保存。AI 答疑将使用真实大模型 + RAG 检索生成回答。" : "ℹ️ 已保存（未配置 Key，使用本地演示引擎）。";
      st.style.color = store.api.key ? "var(--green)" : "var(--text-3)";
    });
    $("#clear-data").addEventListener("click", () => {
      if (confirm("确定清空所有本地学习数据（错题本、答题记录、聊天统计、API 配置）吗？")) {
        localStorage.removeItem(LS_KEY);
        loadStore();
        renderCoursePicker();
        renderAll();
        renderSettings();
        alert("已清空本地数据。");
      }
    });
    $("#export-data").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ ...store, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ai-teaching-assistant-data-" + today() + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $("#pro-btn").addEventListener("click", () => openUpgradeModal("click"));
    $("#upgrade-close").addEventListener("click", closeUpgradeModal);
    $("#upgrade-confirm").addEventListener("click", () => {
      store.isPro = true;
      saveStore();
      closeUpgradeModal();
      updateTrialUI();
      renderSettings();
      alert("🎉 已模拟开通 AI 助教 Pro！\n\n现在你可以无限次提问了，并解锁高级错题本与个性化学习计划。\n（¥9.9/月 · 演示版）");
    });
    $("#member-toggle").addEventListener("click", () => {
      if (store.isPro) {
        store.isPro = false;
        getTrialInfo();
        saveStore();
        updateTrialUI();
        renderSettings();
        alert("已切回免费版（每日免费试用 " + DAILY_TRIAL_LIMIT + " 次）。");
      } else {
        openUpgradeModal("settings");
      }
    });
  }

  function renderHotTags() {
    const box = $("#hot-tags");
    if (!box) return;
    const c = curCourse();
    const tags = Knowledge.hotTags(c.id);
    box.innerHTML = tags.map(t => `<span class="hot-tag">${escapeHtml(t)}</span>`).join("");
  }

  function sendFromInput() {
    const input = $("#chat-input");
    const q = input.value;
    input.value = "";
    input.style.height = "auto";
    askAI(q);
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    loadStore();
    const savedDark = localStorage.getItem("aita_dark") === "1";
    applyTheme(savedDark);
    bindEvents();
    renderCoursePicker();
    updateSuggestions();
    navigate("chat");
    renderDailyStats();
    updateTrialUI();
  }

  document.addEventListener("DOMContentLoaded", init);
  return { init };
})();
