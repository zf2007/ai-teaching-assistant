/* ============================================================
 * 多课程知识库聚合主文件
 * 课程：大学化学 / 有机化学 / 高分子化学 / 电路原理
 * 提供课程切换与动态索引（片段、统计、章节、热门标签）
 * ============================================================ */

const COURSES = [CALCULUS_COURSE, LINEAR_ALGEBRA_COURSE, PROBABILITY_COURSE, PHYSICS_COURSE, ANALOG_COURSE, SIGNALS_COURSE, CIRCUIT_COURSE, PYTHON_COURSE, JAVA_COURSE, CHEM_COURSE, ORG_COURSE, POLYMER_COURSE, DRAWING_COURSE];

const Knowledge = (function () {

  /* 当前课程 id（由 app.js 同步） */
  let currentId = COURSES[0].id;

  function setCurrent(id) {
    if (COURSES.some(c => c.id === id)) currentId = id;
  }
  function getCurrentId() { return currentId; }

  function getCourse(id) {
    if (id && typeof id === "object" && id.id) {
      return COURSES.find(c => c.id === id.id) || COURSES[0];
    }
    return COURSES.find(c => c.id === (id || currentId)) || COURSES[0];
  }

  /* 平铺片段 */
  function fragments(course) {
    const c = getCourse(course);
    const frags = [];
    c.topics.forEach(t => {
      t.facts.forEach((f, i) => {
        frags.push({ id: t.id + "-f" + i, topicId: t.id, text: f.text, src: f.src, chapter: t.chapter, keywords: t.keywords });
      });
      if (t.formula) {
        frags.push({ id: t.id + "-formula", topicId: t.id, text: "关键公式：" + t.formula, src: t.chapter + " · 公式卡片", chapter: t.chapter, keywords: t.keywords });
      }
    });
    return frags;
  }

  function stats(course) {
    const c = getCourse(course);
    const frags = fragments(c);
    const chapters = new Set(c.topics.map(t => t.chapter));
    return { docs: chapters.size, fragments: frags.length, topics: c.topics.length, questions: c.questions.length };
  }

  /* 章节分组（知识库页展示用） */
  function chapters(course) {
    const c = getCourse(course);
    const map = {};
    c.topics.forEach(t => {
      if (!map[t.chapter]) map[t.chapter] = [];
      map[t.chapter].push(t.id);
    });
    return Object.keys(map).map(ch => ({ ch, topics: map[ch] }));
  }

  /* 热门标签 */
  function hotTags(course) {
    const c = getCourse(course);
    const tags = [];
    c.topics.forEach(t => {
      const kw = t.keywords.find(k => !tags.includes(k) && !/[a-zA-Z=+·×÷()\u3001\uff0c]/.test(k));
      if (kw) tags.push(kw);
    });
    return tags.slice(0, 10);
  }

  return { COURSES, setCurrent, getCurrentId, getCourse, fragments, stats, chapters, hotTags };
})();
