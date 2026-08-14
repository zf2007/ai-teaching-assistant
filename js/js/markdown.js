/* ============================================================
 * 轻量 Markdown 渲染器（离线、无依赖）
 * 支持：标题(#/##/###)、粗体、行内代码、无序/有序列表、
 *       引用(>)、公式卡片(<div class="formula">)、段落
 * ============================================================ */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  let s = escapeHtml(text);
  // 行内代码
  s = s.replace(/`([^`]+)`/g, (m, c) => `<code>${c}</code>`);
  // 粗体
  s = s.replace(/\*\*([^*]+)\*\*/g, (m, c) => `<strong>${c}</strong>`);
  return s;
}

function renderMarkdown(md) {
  if (!md) return "";
  const lines = String(md).split("\n");
  const html = [];
  let listType = null;      // 'ul' | 'ol' | null
  let inQuote = false;

  const closeList = () => {
    if (listType) { html.push(`</${listType}>`); listType = null; }
  };
  const closeQuote = () => {
    if (inQuote) { html.push("</blockquote>"); inQuote = false; }
  };

  for (let raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();

    // 公式卡片（已含 HTML，原样保留）
    if (t.startsWith("<div class=\"formula\"")) {
      closeList(); closeQuote();
      html.push(line);
      continue;
    }

    // 标题
    const h = /^(#{1,4})\s+(.*)$/.exec(t);
    if (h) {
      closeList(); closeQuote();
      const level = Math.min(h[1].length + 2, 4);
      html.push(`<h${level}>${renderInline(h[2])}</h${level}>`);
      continue;
    }

    // 引用
    if (t.startsWith(">")) {
      closeList();
      if (!inQuote) { html.push("<blockquote>"); inQuote = true; }
      html.push(`<p>${renderInline(t.replace(/^>\s?/, ""))}</p>`);
      continue;
    } else {
      closeQuote();
    }

    // 无序列表
    const ul = /^[-*]\s+(.*)$/.exec(t);
    if (ul) {
      if (listType !== "ul") { closeList(); html.push("<ul>"); listType = "ul"; }
      html.push(`<li>${renderInline(ul[1])}</li>`);
      continue;
    }
    // 有序列表
    const ol = /^\d+\.\s+(.*)$/.exec(t);
    if (ol) {
      if (listType !== "ol") { closeList(); html.push("<ol>"); listType = "ol"; }
      html.push(`<li>${renderInline(ol[1])}</li>`);
      continue;
    }

    // 空行
    if (!t) { closeList(); continue; }

    // 普通段落
    closeList();
    html.push(`<p>${renderInline(t)}</p>`);
  }
  closeList(); closeQuote();
  return html.join("");
}
