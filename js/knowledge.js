/* ============================================================
 * 多课程知识库聚合主文件
 * 课程：大学化学 / 有机化学 / 高分子化学 / 电路原理
 * 提供课程切换与动态索引（片段、统计、章节、热门标签）
 * ============================================================ */

/* 各学科示例问题（切换学科时聊天区的问题推荐随之变化） */
const COURSE_EXAMPLES = {
  calculus: ["什么是导数？", "怎么求极限？", "洛必达法则怎么用？", "定积分怎么计算？"],
  linealge: ["什么是特征值？", "怎么求矩阵的逆？", "行列式怎么计算？", "什么是二次型？"],
  probstat: ["什么是正态分布？", "条件概率怎么算？", "什么是中心极限定理？", "最大似然估计是什么？"],
  physics: ["什么是简谐振动？", "怎么用高斯定理求场强？", "什么是牛顿第二定律？", "光电效应是什么？"],
  analog: ["什么是虚短和虚断？", "负反馈有什么作用？", "怎么分析共射放大电路？", "什么是稳压二极管？"],
  signals: ["什么是采样定理？", "卷积怎么计算？", "什么是傅里叶变换？", "什么是系统函数？"],
  circuit: ["什么是基尔霍夫电压定律？", "戴维南定理怎么求电流？", "RC 电路零输入响应怎么分析？", "串联谐振的条件是什么？"],
  python: ["列表和元组有什么区别？", "怎么定义一个函数？", "文件怎么读写？", "什么是列表推导式？"],
  java: ["什么是继承和多态？", "接口和抽象类有什么区别？", "异常处理怎么用？", "什么是集合框架？"],
  chem: ["什么是缓冲溶液？", "怎么计算 pH？", "什么是吉布斯自由能？", "氧化还原反应怎么配平？"],
  orgchem: ["什么是芳香性？", "SN1 和 SN2 有什么区别？", "什么是同分异构？", "什么是顺反异构？"],
  polymer: ["缩聚和加聚有什么区别？", "什么是聚合度？", "高分子材料有哪些应用？", "热塑性塑料和热固性塑料有什么区别？"],
  drawing: ["什么是剖视图？", "全剖半剖局部剖有什么区别？", "螺纹怎么标注？", "截交线怎么求？"],
  complex: ["什么是解析函数？", "柯西积分公式怎么用？", "怎么求留数？", "拉普拉斯变换怎么求逆变换？"],
  algorithm: ["什么是动态规划？", "快速排序的时间复杂度是多少？", "Dijkstra 算法怎么用？", "什么是 NP 完全问题？"]
};

/* 容错加载：某门课的知识库文件缺失时自动跳过，避免整个应用白屏 */
const COURSE_DEFS = [
  { n: "ALGO_COURSE", c: typeof ALGO_COURSE !== "undefined" ? ALGO_COURSE : null },
  { n: "COMPLEX_COURSE", c: typeof COMPLEX_COURSE !== "undefined" ? COMPLEX_COURSE : null },
  { n: "CALCULUS_COURSE", c: typeof CALCULUS_COURSE !== "undefined" ? CALCULUS_COURSE : null },
  { n: "LINEAR_ALGEBRA_COURSE", c: typeof LINEAR_ALGEBRA_COURSE !== "undefined" ? LINEAR_ALGEBRA_COURSE : null },
  { n: "PROBABILITY_COURSE", c: typeof PROBABILITY_COURSE !== "undefined" ? PROBABILITY_COURSE : null },
  { n: "PHYSICS_COURSE", c: typeof PHYSICS_COURSE !== "undefined" ? PHYSICS_COURSE : null },
  { n: "ANALOG_COURSE", c: typeof ANALOG_COURSE !== "undefined" ? ANALOG_COURSE : null },
  { n: "SIGNALS_COURSE", c: typeof SIGNALS_COURSE !== "undefined" ? SIGNALS_COURSE : null },
  { n: "CIRCUIT_COURSE", c: typeof CIRCUIT_COURSE !== "undefined" ? CIRCUIT_COURSE : null },
  { n: "PYTHON_COURSE", c: typeof PYTHON_COURSE !== "undefined" ? PYTHON_COURSE : null },
  { n: "JAVA_COURSE", c: typeof JAVA_COURSE !== "undefined" ? JAVA_COURSE : null },
  { n: "CHEM_COURSE", c: typeof CHEM_COURSE !== "undefined" ? CHEM_COURSE : null },
  { n: "ORG_COURSE", c: typeof ORG_COURSE !== "undefined" ? ORG_COURSE : null },
  { n: "POLYMER_COURSE", c: typeof POLYMER_COURSE !== "undefined" ? POLYMER_COURSE : null },
  { n: "DRAWING_COURSE", c: typeof DRAWING_COURSE !== "undefined" ? DRAWING_COURSE : null }
];
const COURSES = COURSE_DEFS.map(d => d.c).filter(Boolean);

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
