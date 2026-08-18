/* ============================================================
 * 个性化教材模块：上传学校教材/资料，AI 优先按你的资料个性化回答
 * 支持 PDF / TXT / Markdown / Word(.docx)
 * 纯前端解析 + IndexedDB 存储 + 本地检索（资料不出本机）
 * ============================================================ */

const CustomMaterials = (function () {

  const DB_NAME = "aita_custom_v1";
  const STORE = "materials";
  const MAX_FILE = 40 * 1024 * 1024;   // 单文件上限 40MB
  const FRAG_MIN = 60;                 // 片段最少字数
  const FRAG_MAX = 420;                // 片段最多字数
  const STOP_CHARS = "的得了是在和与或这那中上下对于为以把被就都而及等吗呢啊吧之其个了过从到向往有没无们";
  const STOP_WORDS = new Set(["什么","怎么","如何","为什么","请问","请","帮","一下","这个","那个","哪些","区别","定义","概念","求","算","计算","讲解","解释","多少","是否","怎么算","如何求","是什么","什么是","讲讲","介绍","方法","步骤"]);

  let db = null;
  let cache = null;   // 会话内缓存（materials 数组）

  /* ---------------- IndexedDB ---------------- */
  function openDB() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("当前浏览器不支持 IndexedDB，请更换现代浏览器"));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = () => reject(req.error || new Error("打开本地数据库失败"));
    });
  }
  function idbReq(r) {
    return new Promise((resolve, reject) => {
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error || new Error("数据库操作失败"));
    });
  }
  async function dbGetAll() {
    const d = await openDB();
    return idbReq(d.transaction(STORE, "readonly").objectStore(STORE).getAll());
  }
  async function dbPut(m) {
    const d = await openDB();
    return idbReq(d.transaction(STORE, "readwrite").objectStore(STORE).put(m));
  }
  async function dbDel(id) {
    const d = await openDB();
    return idbReq(d.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
  }
  async function dbClear() {
    const d = await openDB();
    return idbReq(d.transaction(STORE, "readwrite").objectStore(STORE).clear());
  }

  async function ensureCache() {
    if (cache) return cache;
    try { cache = await dbGetAll(); } catch (e) { cache = []; }
    return cache;
  }

  /* ---------------- 工具 ---------------- */
  function extOf(name) {
    const m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }
  function fmtSize(n) {
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n >= 1024) return (n / 1024).toFixed(0) + " KB";
    return n + " B";
  }

  /* ---------------- 文本切分 ---------------- */
  /* 支持 PDF 页标记：【第N页】；返回 [{ text, page }] */
  function splitText(text) {
    const frags = [];
    const lines = String(text).split(/\n+/).map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    let buf = "";
    let curPage = 0;
    let startPage = 0;
    const pageRe = /^【第(\d+)页】$/;
    for (const line of lines) {
      const pm = pageRe.exec(line);
      if (pm) { curPage = parseInt(pm[1], 10); continue; }
      if (!buf) startPage = curPage;
      if (buf && (buf.length + line.length) > FRAG_MAX) {
        frags.push({ text: buf, page: startPage || 0 });
        buf = "";
        startPage = curPage;
      }
      buf += (buf ? "\n" : "") + line;
    }
    if (buf) frags.push({ text: buf, page: startPage || 0 });
    return frags.filter(f => f.text.length >= FRAG_MIN);
  }

  /* ---------------- CDN 库加载（多源回退） ---------------- */
  function loadScript(urls, check) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = () => {
        if (i >= urls.length) return reject(new Error("解析库网络加载失败，请检查网络后重试"));
        const s = document.createElement("script");
        s.src = urls[i++];
        s.onload = () => { try { check() ? resolve() : tryNext(); } catch (e) { tryNext(); } };
        s.onerror = () => { s.remove(); tryNext(); };
        document.head.appendChild(s);
      };
      tryNext();
    });
  }

  const PDF_CDNS = [
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/",
    "https://unpkg.com/pdfjs-dist@3.11.174/build/",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/"
  ];
  function loadPDFJS() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return loadScript(PDF_CDNS.map(b => b + "pdf.min.js"), () => !!window.pdfjsLib).then(() => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CDNS[0] + "pdf.worker.min.js";
      return window.pdfjsLib;
    });
  }

  const MAMMOTH_CDNS = [
    "https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js",
    "https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
  ];
  function loadMammoth() {
    if (window.mammoth) return Promise.resolve(window.mammoth);
    return loadScript(MAMMOTH_CDNS, () => !!window.mammoth);
  }

  /* ---------------- 文件解析 ---------------- */
  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error("读取文件失败"));
      r.readAsText(file);
    });
  }

  async function parsePDF(file, onProgress) {
    const lib = await loadPDFJS();
    const buf = await file.arrayBuffer();
    const doc = await lib.getDocument({ data: buf }).promise;
    const parts = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      let text = "";
      let lastY = null;
      for (const it of tc.items) {
        if (!it.str) continue;
        if (lastY !== null && Math.abs(it.transform[5] - lastY) > 2) text += "\n";
        text += it.str;
        lastY = it.transform[5];
      }
      parts.push("【第" + p + "页】\n" + text.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim());
      if (onProgress) onProgress(p, doc.numPages);
    }
    return { text: parts.join("\n\n"), pages: doc.numPages };
  }

  async function parseDOCX(file) {
    const mm = await loadMammoth();
    const buf = await file.arrayBuffer();
    const res = await mm.extractRawText({ arrayBuffer: buf });
    return { text: res.value || "" };
  }

  /* 解析文件 → 文本；text 为 null 表示未知类型 */
  async function parseFile(file, onProgress) {
    const ext = extOf(file.name);
    if (ext === "pdf") return parsePDF(file, onProgress);
    if (ext === "txt" || ext === "md" || ext === "markdown" || ext === "text") return { text: await readAsText(file), pages: 0 };
    if (ext === "docx") return parseDOCX(file);
    return null;
  }

  /* ---------------- 构建教材对象 ---------------- */
  async function buildMaterial(file, courseId, courseName, onProgress) {
    const parsed = await parseFile(file, onProgress);
    if (!parsed) {
      throw new Error("不支持的文件类型：" + (extOf(file.name) || "未知") + "（支持 PDF / TXT / Markdown / DOCX）");
    }
    let text = (parsed.text || "").replace(/\u0000/g, "").trim();
    if (text.length < 40) {
      throw new Error("未能从文件中提取到足够文字（扫描版图片 PDF 请先转成文字版，或直接上传 TXT / Markdown）");
    }
    const frags = splitText(text).map((f, i) => ({
      i,
      text: f.text,
      src: "我的教材《" + (file.name || "资料").replace(/\.[^.]+$/, "") + "》" + (f.page ? " · 第" + f.page + "页" : "") + " · 片段" + (i + 1)
    }));
    if (!frags.length) throw new Error("提取到的文字过少，无法建立知识片段");
    return {
      id: "m" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      courseId, courseName,
      name: (file.name || "资料").replace(/\.[^.]+$/, ""),
      fileName: file.name,
      size: file.size,
      pages: parsed.pages || 0,
      chars: text.length,
      createdAt: Date.now(),
      text,
      frags
    };
  }

  /* ---------------- 检索（通用中文分词 + 打分） ---------------- */
  function tokenizeQuery(q) {
    const tokens = [];
    const lower = String(q).toLowerCase();
    for (const m of lower.matchAll(/[a-z0-9]+/g)) if (m[0].length >= 2) tokens.push(m[0]);
    const zh = lower.replace(/[^一-龥]/g, "");
    for (let len = 4; len >= 2; len--) {
      for (let i = 0; i + len <= zh.length; i++) {
        const w = zh.slice(i, i + len);
        if (STOP_WORDS.has(w)) continue;
        let hasStop = false;
        for (const c of w) if (STOP_CHARS.includes(c)) { hasStop = true; break; }
        if (!hasStop) tokens.push(w);
      }
    }
    return [...new Set(tokens)];
  }

  function search(query, courseId, topK) {
    const tokens = tokenizeQuery(query).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
    if (!tokens.length || !cache) return [];
    const mats = cache.filter(m => !courseId || m.courseId === courseId);
    const scored = [];
    mats.forEach(m => {
      m.frags.forEach(f => {
        const lower = f.text.toLowerCase();
        let score = 0;
        tokens.forEach(t => {
          const count = lower.split(t).length - 1;
          if (count) score += count * (t.length >= 3 ? 3 : 2);
        });
        if (score > 0) scored.push({ frag: { text: f.text, src: f.src, materialId: m.id, materialName: m.name }, score });
      });
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK || 4);
  }

  /* ---------------- 对外 API ---------------- */
  async function init() { await ensureCache(); }

  async function add(file, courseId, courseName, onProgress) {
    if (!file) throw new Error("未选择文件");
    if (file.size > MAX_FILE) throw new Error("文件过大（上限 40MB）");
    const m = await buildMaterial(file, courseId, courseName, onProgress);
    await dbPut(m);
    cache = await dbGetAll();
    return m;
  }
  async function remove(id) {
    await dbDel(id);
    cache = await dbGetAll();
  }
  async function clearAll() {
    await dbClear();
    cache = [];
  }
  async function list() { await ensureCache(); return cache || []; }
  function all() { return cache || []; }
  function count() { return (cache || []).length; }
  function forCourse(courseId) { return (cache || []).filter(m => m.courseId === courseId); }
  function hasFor(courseId) { return forCourse(courseId).length > 0; }
  function namesFor(courseId) { return forCourse(courseId).map(m => m.name); }

  return { init, add, remove, clearAll, list, all, count, forCourse, hasFor, namesFor, search, tokenizeQuery, fmtSize };
})();
