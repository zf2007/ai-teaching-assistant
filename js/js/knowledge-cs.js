/* ============================================================
 * 课程：Python 语言程序设计
 * 依据《Python语言程序设计基础（第2版）》（嵩天、礼欣、黄天羽）
 * 教材目录与内容整理：基本数据类型、控制结构、函数、组合数据类型、
 * 字符串、文件、程序设计方法论、计算生态
 * ============================================================ */

const PYTHON_COURSE = {
  id: "python",
  name: "Python 程序设计",
  short: "Python",
  icon: "🐍",
  color: "#3b82f6",
  note: "依据《Python语言程序设计基础（第2版）》（嵩天等）教材整理的 Python 程序设计知识库，覆盖基本数据类型、控制结构、函数与代码复用、组合数据类型、字符串、文件与数据格式化、程序设计方法论。",
  topics: [
    {
      id: "py01", name: "Python 语言概述与开发环境", chapter: "第1章 程序设计基本方法",
      keywords: ["Python","IDLE","交互式","文件式","解释执行","脚本","缩进","注释","print","程序设计"],
      summary: "Python 是一种解释型、面向对象的通用编程语言，通过 IDLE 可交互式或文件式执行程序；用缩进表示代码块层次。",
      formula: "运行方式：交互式（>>> 逐行执行）与文件式（.py 脚本整体运行）",
      facts: [
        { text: "Python 是解释型语言：源代码经解释器逐行翻译执行，无需编译；特点是语法简洁、跨平台、生态丰富。", src: "教材 第1章 程序设计基本方法" },
        { text: "IDLE 是 Python 自带的集成开发环境，支持交互式运行（逐行输入输出）与文件式运行（执行 .py 脚本）。", src: "教材 第1章" },
        { text: "Python 用缩进（通常 4 个空格）表示代码块的层次结构，相同缩进的语句属于同一代码块。", src: "教材 第1章" },
        { text: "注释用 # 表示单行注释，三引号（''' 或 \"\"\"）表示多行注释/文档字符串；print() 用于输出。", src: "教材 第1章" },
        { text: "IPO 模式：程序由输入（Input）、处理（Process）、输出（Output）三部分组成，是程序设计的通用框架。", src: "教材 第1章" }
      ],
      example: {
        q: "用文件式方式编写一个输出 Hello, World 的程序，代码是什么？",
        steps: ["在 .py 文件中写一行代码：print(\"Hello, World\")。", "保存后用 IDLE 或命令行运行该文件。", "程序输出：Hello, World。"],
        answer: "print(\"Hello, World\")"
      },
      pitfall: "Python 3 中 print 是函数（print(...)），不是语句（Python 2 的 print ...）；缩进必须一致，混用空格与 Tab 会报 IndentationError。"
    },
    {
      id: "py02", name: "基本数据类型", chapter: "第3章 基本数据类型",
      keywords: ["数据类型","整数","浮点数","字符串","列表","元组","字典","集合","type","类型转换","bool"],
      summary: "Python 内置的基本数据类型包括数字类型（整数、浮点数、复数）、字符串、布尔型，以及列表、元组、字典、集合等组合类型。",
      formula: "常用类型转换：int(x)、float(x)、str(x)、list(x)、tuple(x)、dict()、set()",
      facts: [
        { text: "整数类型 int 可表示任意大小的整数（无位数限制）；浮点数 float 用 IEEE754 表示，有精度限制；复数 complex 由实部虚部组成。", src: "教材 第3章 基本数据类型" },
        { text: "字符串 str 是不可变字符序列，可用单引号、双引号或三引号表示；布尔类型 bool 只有 True 与 False。", src: "教材 第3章" },
        { text: "type() 函数返回变量的数据类型；type(3) 为 <class 'int'>，type(3.0) 为 <class 'float'>。", src: "教材 第3章" },
        { text: "类型转换：int(\"123\") 转整数、float(\"3.14\") 转浮点数、str(123) 转字符串；字符串转数字失败会抛 ValueError。", src: "教材 第3章" },
        { text: "组合数据类型：列表 list 有序可变、元组 tuple 有序不可变、字典 dict 键值对、集合 set 无序不重复。", src: "教材 第3章" }
      ],
      example: {
        q: "执行 int(\"12.5\") 会得到什么结果？",
        steps: ["int() 把字符串按整数解析。", "\"12.5\" 不是合法整数格式。", "抛出 ValueError: invalid literal for int() with base 10: '12.5'。"],
        answer: "抛 ValueError（应先 float() 再 int()）"
      },
      pitfall: "int() 不能直接转换带小数点的字符串；浮点数转整数是截断（向零取整），不是四舍五入，如 int(3.99) = 3。"
    },
    {
      id: "py03", name: "运算符与表达式", chapter: "第3章 基本数据类型",
      keywords: ["运算符","表达式","算术运算","关系运算","逻辑运算","赋值","整除","取余","幂","优先级"],
      summary: "Python 运算符包括算术、关系、逻辑、赋值、位运算等，表达式的求值顺序遵循运算符优先级。",
      formula: "算术：+ - * / // % **；关系：== != > < >= <=；逻辑：and or not",
      facts: [
        { text: "算术运算符：+ 加、- 减、* 乘、/ 除（结果为浮点数）、// 整除（向下取整）、% 取余、** 幂。", src: "教材 第3章" },
        { text: "关系运算符比较大小返回布尔值；字符串比较按字符的 Unicode 编码逐个比较。", src: "教材 第3章" },
        { text: "逻辑运算符：and（与，一假即假）、or（或，一真即真）、not（非）；短路求值：and/or 左侧已定则不再求右侧。", src: "教材 第3章" },
        { text: "运算符优先级从高到低：幂 ** → 正负号 → 乘除整除取余 → 加减 → 比较 → not → and → or。", src: "教材 第3章" },
        { text: "Python 支持链式比较：0 < x < 10 等价于 0 < x and x < 10。", src: "教材 第3章" }
      ],
      example: {
        q: "表达式 7 // 2 与 7 / 2 的结果分别是什么？",
        steps: ["// 是整除（向下取整）：7 // 2 = 3。", "/ 是普通除法：7 / 2 = 3.5。"],
        answer: "7//2 = 3，7/2 = 3.5"
      },
      pitfall: "负数整除向下取整：-7 // 2 = -4（不是 -3）；取余结果符号与除数一致，-7 % 2 = 1。"
    },
    {
      id: "py04", name: "程序的控制结构", chapter: "第4章 程序的控制结构",
      keywords: ["分支","if","elif","else","循环","for","while","break","continue","range","嵌套"],
      summary: "程序控制结构分顺序、分支与循环三大类。分支用 if-elif-else，循环用 for（遍历 range/序列）与 while，break/continue 控制循环。",
      formula: "for i in range(n): …；while 条件: …；if 条件: … elif …: … else: …",
      facts: [
        { text: "单分支 if、二分支 if-else、多分支 if-elif-else；条件表达式（三目）为 x if 条件 else y。", src: "教材 第4章 程序的控制结构" },
        { text: "for 循环用于遍历可迭代对象（range、字符串、列表等）：for i in range(5) 依次取 0,1,2,3,4。", src: "教材 第4章" },
        { text: "while 循环在条件为真时重复执行，注意更新循环变量避免死循环。", src: "教材 第4章" },
        { text: "break 立即结束整个循环；continue 跳过本次循环剩余语句进入下一次迭代；循环可嵌套。", src: "教材 第4章" },
        { text: "range(n) 生成 0~n-1 的整数序列；range(m, n) 生成 m~n-1；range(m, n, s) 指定步长 s。", src: "教材 第4章" }
      ],
      example: {
        q: "用 for 循环计算 1 到 100 的和，代码怎么写？",
        steps: ["s = 0；for i in range(1, 101): s += i。", "range(1, 101) 生成 1~100。", "循环结束后 s = 5050。"],
        answer: "s = 0; for i in range(1, 101): s += i"
      },
      pitfall: "range(1, 101) 是 1~100 而不是 1~101；range(100) 是 0~99。忘记缩进或循环变量不更新会导致逻辑错误。"
    },
    {
      id: "py05", name: "函数与代码复用", chapter: "第5章 函数和代码复用",
      keywords: ["函数","def","参数","默认参数","可变参数","返回值","return","lambda","递归","局部变量","全局变量"],
      summary: "函数用 def 定义，实现代码复用。支持默认参数、可变参数（*args、**kwargs）与返回值；递归是函数调用自身的编程方法。",
      formula: "def 函数名(参数列表): 函数体; return 返回值",
      facts: [
        { text: "函数定义：def 函数名(形参): 函数体，用 return 返回结果；无 return 时返回 None。", src: "教材 第5章 函数和代码复用" },
        { text: "默认参数：def f(a, b=10) 中 b 有默认值；调用时可不传 b。带默认值的参数必须放在无默认参数之后。", src: "教材 第5章" },
        { text: "可变参数：*args 收集任意多个位置参数为元组；**kwargs 收集任意多个关键字参数为字典。", src: "教材 第5章" },
        { text: "lambda 匿名函数：lambda x, y: x + y，常用于函数式编程（如 sorted 的 key 参数）。", src: "教材 第5章" },
        { text: "函数内部定义的变量是局部变量，函数外部的是全局变量；函数内修改全局变量需用 global 声明。", src: "教材 第5章" },
        { text: "递归：函数直接或间接调用自身，必须包含递归基例（结束条件），否则无限递归导致栈溢出。", src: "教材 第5章" }
      ],
      example: {
        q: "用递归实现 n!（n 的阶乘），写出函数。",
        steps: ["递归基例：n == 0 时返回 1。", "递归关系：n! = n * (n-1)!。", "def fact(n): return 1 if n == 0 else n * fact(n-1)。"],
        answer: "def fact(n): return 1 if n == 0 else n * fact(n-1)"
      },
      pitfall: "默认参数在定义时求值（可变默认参数如 [] 会共享状态，应使用 None 哨兵）；递归必须有基例且规模递减。"
    },
    {
      id: "py06", name: "组合数据类型", chapter: "第6章 组合数据类型",
      keywords: ["列表","元组","字典","集合","append","extend","切片","索引","键值对","set","排序","推导式"],
      summary: "组合数据类型包括列表、元组、字典与集合。列表有序可变、元组有序不可变、字典按键存取、集合元素唯一无序。",
      formula: "list：lst.append(x)、lst[i]、lst[a:b]；dict：d[key]、d.get(key)、d.keys()；set：s.add(x)",
      facts: [
        { text: "列表 list：有序、可变，可存放任意类型元素；用 [ ] 创建，支持索引 lst[0] 与切片 lst[1:3]。", src: "教材 第6章 组合数据类型" },
        { text: "元组 tuple：有序、不可变，用 ( ) 创建；可作字典的键，常用于函数多返回值。", src: "教材 第6章" },
        { text: "字典 dict：键值对集合，用 {key: value} 创建；按键访问 d[key]，不存在的键会报 KeyError，可用 d.get(key, 默认值) 避免。", src: "教材 第6章" },
        { text: "集合 set：元素唯一且无序，用 { } 或 set() 创建；支持并集 |、交集 &、差集 - 运算。", src: "教材 第6章" },
        { text: "列表常用方法：append() 追加、extend() 扩展、insert() 插入、remove() 删除、pop() 弹出、sort() 排序；len() 求长度。", src: "教材 第6章" },
        { text: "列表推导式：[表达式 for 变量 in 可迭代对象 if 条件]，如 [x*x for x in range(5)] 生成平方列表。", src: "教材 第6章" }
      ],
      example: {
        q: "将列表 [3, 1, 2] 原地升序排序并输出第二个元素。",
        steps: ["lst.sort() 原地升序排序，lst 变为 [1, 2, 3]。", "lst[1] 为 2（索引从 0 开始）。"],
        answer: "lst.sort(); print(lst[1]) → 2"
      },
      pitfall: "列表是可变的（直接修改原对象），元组是不可变的；注意 a = b 是引用赋值（同一对象），浅拷贝要用 a[:] 或 list(a)。"
    },
    {
      id: "py07", name: "字符串处理", chapter: "第6章 组合数据类型",
      keywords: ["字符串","索引","切片","split","join","replace","format","f-string","find","strip","lower","upper"],
      summary: "字符串是不可变字符序列，支持索引、切片与大量处理方法；格式化输出可用 %、format() 或 f-string。",
      formula: "s[a:b] 切片；s.split(sep) 分割；sep.join(列表) 连接；f\"{变量}\" 格式化",
      facts: [
        { text: "字符串索引 s[0] 取第一个字符、s[-1] 取最后一个；切片 s[开始:结束:步长]，如 s[1:4] 取第 2~4 个字符。", src: "教材 第6章" },
        { text: "常用方法：s.split(分隔符) 分割为列表、\"-\".join(列表) 连接、s.replace(旧, 新) 替换、s.strip() 去两端空白、s.find(子串) 查找位置。", src: "教材 第6章" },
        { text: "大小写与判断：s.lower() 转小写、s.upper() 转大写、s.isdigit() 是否数字、s.startswith(前缀) 判断开头。", src: "教材 第6章" },
        { text: "格式化输出：f\"{变量:.2f}\"（f-string，Python 3.6+）最常用；也支持 \"{} {}\".format(a, b) 与 % 占位符。", src: "教材 第6章" },
        { text: "字符串是不可变对象：所有方法都返回新字符串，不修改原字符串。", src: "教材 第6章" }
      ],
      example: {
        q: "把字符串 \"a,b,c\" 按逗号分割成列表，再用 \"-\" 连接回字符串。",
        steps: ["lst = \"a,b,c\".split(\",\") → ['a', 'b', 'c']。", "s = \"-\".join(lst) → \"a-b-c\"。"],
        answer: "\"a-b-c\""
      },
      pitfall: "字符串不可变——s.upper() 不会改变 s 本身，必须用新变量接收返回值；切片区间是左闭右开。"
    },
    {
      id: "py08", name: "文件与数据格式化", chapter: "第7章 文件和数据格式化",
      keywords: ["文件","open","read","write","with","CSV","JSON","编码","utf-8","关闭"],
      summary: "文件读写用 open() 打开并指定模式，处理完成后关闭文件；with 语句自动管理资源。CSV 与 JSON 是常用的数据格式化方式。",
      formula: "with open(\"f.txt\", \"r\", encoding=\"utf-8\") as f: 内容 = f.read()",
      facts: [
        { text: "打开文件：f = open(文件名, 模式)，模式 r 读、w 写（覆盖）、a 追加、b 二进制；建议用 with 自动关闭。", src: "教材 第7章 文件和数据格式化" },
        { text: "文件读写方法：f.read() 读全部、f.readline() 读一行、f.readlines() 读全部行、f.write(内容) 写、f.close() 关闭。", src: "教材 第7章" },
        { text: "with open(...) as f: 语句块结束时自动关闭文件，即使发生异常也会关闭，是最推荐的写法。", src: "教材 第7章" },
        { text: "文本文件要指定编码：encoding=\"utf-8\"，否则中文可能乱码或报错。", src: "教材 第7章" },
        { text: "CSV 是逗号分隔的表格文本格式；JSON 是键值对嵌套的轻量数据交换格式，Python 用 json 库的 dump/load 读写。", src: "教材 第7章" }
      ],
      example: {
        q: "用 with 语句读取文件 data.txt 的全部内容并打印。",
        steps: ["with open(\"data.txt\", \"r\", encoding=\"utf-8\") as f: 内容 = f.read()。", "print(内容)。", "with 块结束后文件自动关闭。"],
        answer: "with open(\"data.txt\", encoding=\"utf-8\") as f: print(f.read())"
      },
      pitfall: "忘记关闭文件会导致资源泄漏或数据未写入；写模式 w 会清空原文件内容，追加用 a；读不存在的文件抛 FileNotFoundError。"
    },
    {
      id: "py09", name: "异常处理与程序设计方法论", chapter: "第8章 程序设计方法论",
      keywords: ["异常","try","except","finally","raise","自顶向下","模块化","函数化","结构化","健壮性"],
      summary: "异常处理用 try-except 捕获错误，避免程序崩溃；程序设计遵循自顶向下分解、模块化与函数化的方法论。",
      formula: "try: 可能出错的代码 except 异常类型 as e: 处理代码 finally: 总是执行",
      facts: [
        { text: "异常处理结构：try-except（捕获异常）、try-except-else（无异常时执行 else）、try-finally（无论是否异常都执行 finally）。", src: "教材 第8章 程序设计方法论" },
        { text: "常见异常：ValueError 值错误、TypeError 类型错误、NameError 未定义名称、IndexError 索引越界、ZeroDivisionError 除零、FileNotFoundError 文件不存在。", src: "教材 第8章" },
        { text: "raise 语句主动抛出异常；except 可指定捕获的异常类型，多个类型用元组 (TypeError, ValueError)。", src: "教材 第8章" },
        { text: "自顶向下设计：把复杂问题逐步分解为更小的问题；模块化设计：按功能划分为独立模块，提高可维护性。", src: "教材 第8章" },
        { text: "函数化：把重复逻辑封装成函数，降低耦合；结构化：程序由顺序、分支、循环三种基本结构组成。", src: "教材 第8章" }
      ],
      example: {
        q: "编写代码：输入两个数并做除法，捕获除零异常。",
        steps: ["try: a = int(input()); b = int(input()); print(a / b)。", "except ZeroDivisionError: print(\"除数不能为零\")。"],
        answer: "try/except ZeroDivisionError 包裹除法"
      },
      pitfall: "except 语句要捕获具体的异常类型，避免裸 except 吞掉所有错误；finally 中的代码无论是否异常都会执行。"
    },
    {
      id: "py10", name: "标准库与计算生态", chapter: "第9章 Python 计算生态概览",
      keywords: ["标准库","random","time","math","turtle","jieba","第三方库","import","pip","生态"],
      summary: "Python 拥有丰富的标准库与第三方库生态。random 生成随机数、time 处理时间、math 数学运算、turtle 绘图、jieba 中文分词等。",
      formula: "import 模块名；from 模块 import 函数；pip install 包名",
      facts: [
        { text: "导入方式：import math（用 math.sqrt(x) 调用）、from math import sqrt（直接调用 sqrt(x)）、import math as m（别名）。", src: "教材 第9章 Python 计算生态概览" },
        { text: "random 库：random.random() 返回 [0,1) 随机浮点数、random.randint(a, b) 返回 [a,b] 随机整数、random.choice(序列) 随机选取。", src: "教材 第9章" },
        { text: "time 库：time.time() 返回时间戳、time.sleep(秒) 暂停、time.strftime(格式) 格式化时间。", src: "教材 第9章" },
        { text: "math 库：math.sqrt 开方、math.pi 圆周率、math.ceil/math.floor 向上/向下取整、math.pow 幂。", src: "教材 第9章" },
        { text: "turtle 库是入门绘图库；jieba 是中文分词第三方库；第三方库用 pip install 安装。", src: "教材 第9章" }
      ],
      example: {
        q: "生成一个 1 到 6 之间的随机整数（模拟掷骰子）。",
        steps: ["import random。", "random.randint(1, 6)。"],
        answer: "random.randint(1, 6)"
      },
      pitfall: "random.random() 是 [0,1) 浮点数，randint(a,b) 是闭区间整数；import 后要用 模块名.函数名 调用（from import 除外）。"
    }
  ],

  questions: [
    { id: "pyq01", topic: "py01", level: "基础", tag: "运行方式",
      q: "Python 属于（ ）编程语言。",
      options: ["编译型", "解释型", "机器语言", "汇编语言"],
      answer: 1,
      explain: "Python 是解释型语言，源代码经解释器逐行翻译执行，无需先编译成机器码。" },
    { id: "pyq02", topic: "py02", level: "基础", tag: "数据类型",
      q: "type(3.14) 的返回结果是（ ）。",
      options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'complex'>"],
      answer: 1,
      explain: "3.14 是浮点数，type(3.14) 返回 <class 'float'>。" },
    { id: "pyq03", topic: "py03", level: "基础", tag: "运算符",
      q: "表达式 17 // 5 的结果是（ ）。",
      options: ["3.4", "3", "4", "2"],
      answer: 1,
      explain: "// 是整除（向下取整），17 // 5 = 3；17 / 5 = 3.4。" },
    { id: "pyq04", topic: "py04", level: "进阶", tag: "循环",
      q: "range(1, 6) 生成的整数序列是（ ）。",
      options: ["1,2,3,4,5,6", "1,2,3,4,5", "0,1,2,3,4,5", "0,1,2,3,4"],
      answer: 1,
      explain: "range(m, n) 生成 m 到 n-1，range(1, 6) 为 1,2,3,4,5（左闭右开）。" },
    { id: "pyq05", topic: "py05", level: "进阶", tag: "函数",
      q: "执行 def f(a, b=10): return a+b，调用 f(5) 返回（ ）。",
      options: ["5", "15", "10", "报错"],
      answer: 1,
      explain: "b 有默认值 10，f(5) 等价于 f(5, 10)，返回 5+10=15。" },
    { id: "pyq06", topic: "py06", level: "进阶", tag: "列表",
      q: "lst = [3, 1, 2]，执行 lst.sort() 后 lst 为（ ）。",
      options: ["[3, 1, 2]", "[1, 2, 3]", "[2, 1, 3]", "None"],
      answer: 1,
      explain: "list.sort() 原地升序排序，lst 变为 [1, 2, 3]；sorted(lst) 才返回新列表。" },
    { id: "pyq07", topic: "py07", level: "进阶", tag: "字符串",
      q: "\"a,b,c\".split(\",\") 的结果是（ ）。",
      options: ["\"abc\"", "['a', 'b', 'c']", "(\"a\", \"b\", \"c\")", "['a,b,c']"],
      answer: 1,
      explain: "split 按分隔符把字符串分割为列表，[\"a\", \"b\", \"c\"]。" },
    { id: "pyq08", topic: "py08", level: "基础", tag: "文件",
      q: "以下哪种写法能确保文件使用后自动关闭（ ）。",
      options: ["f = open(\"a.txt\")", "with open(\"a.txt\") as f:", "open(\"a.txt\").read()", "f = file(\"a.txt\")"],
      answer: 1,
      explain: "with 语句在代码块结束时自动关闭文件，即使发生异常也会关闭。" },
    { id: "pyq09", topic: "py09", level: "进阶", tag: "异常",
      q: "执行 1 / 0 会抛出（ ）异常。",
      options: ["ValueError", "TypeError", "ZeroDivisionError", "IndexError"],
      answer: 2,
      explain: "除数为 0 抛出 ZeroDivisionError（除零错误）。" },
    { id: "pyq10", topic: "py10", level: "基础", tag: "标准库",
      q: "生成 1~6 随机整数的正确语句是（ ）。",
      options: ["random.random(1, 6)", "random.randint(1, 6)", "random.choice(6)", "random.sample(6)"],
      answer: 1,
      explain: "random.randint(a, b) 返回闭区间 [a, b] 的随机整数；random.random() 返回 [0,1) 浮点数。" }
  ]
};
/* ============================================================
 * 课程：Java 程序设计
 * 依据《Java从入门到精通（第5版）》（明日科技）与
 * 《Java 编程思想》（Bruce Eckel）整理
 * ============================================================ */

const JAVA_COURSE = {
  id: "java",
  name: "Java 程序设计",
  short: "Java",
  icon: "☕",
  color: "#ef8b3c",
  note: "依据《Java从入门到精通（第5版）》与《Java编程思想》整理的 Java 程序设计知识库，覆盖语言基础、流程控制、数组、字符串、类与对象、封装、继承多态、接口抽象类、异常处理与集合框架。",
  topics: [
    {
      id: "j01", name: "Java 语言概述与环境搭建", chapter: "第1章 初识Java",
      keywords: ["Java","JDK","JVM","跨平台","main方法","面向对象","class","环境变量","编译","字节码"],
      summary: "Java 是跨平台、面向对象的编程语言，源代码经 javac 编译为字节码，由 JVM 解释执行，实现一次编写处处运行。",
      formula: "public class 类名 { public static void main(String[] args) { … } }",
      facts: [
        { text: "Java 程序执行流程：编写 .java 源文件 → javac 编译为 .class 字节码 → JVM（Java 虚拟机）加载执行，实现跨平台。", src: "Java从入门到精通 第1章" },
        { text: "Java 语言特性：跨平台、面向对象、健壮（强类型、自动垃圾回收）、安全、多线程支持。", src: "Java从入门到精通 第1章" },
        { text: "JDK（Java 开发工具包）包含 JRE（运行环境）与开发工具；安装后需配置 JAVA_HOME 与 PATH 环境变量。", src: "Java从入门到精通 第1章" },
        { text: "Java 程序入口是 main 方法：public static void main(String[] args)，JVM 从这里开始执行。", src: "Java从入门到精通 第1章" },
        { text: "文件名必须与 public 类名一致，类名首字母大写（驼峰命名），这是 Java 的基本编码规范。", src: "Java从入门到精通 第1章" }
      ],
      example: {
        q: "编写并说明一个最简单的 Java 程序结构。",
        steps: ["定义 public class Hello。", "在类中写 main 方法：public static void main(String[] args)。", "在 main 中输出：System.out.println(\"Hello\");。"],
        answer: "public class Hello { public static void main(String[] args) { System.out.println(\"Hello\"); } }"
      },
      pitfall: "main 方法必须声明为 public static void，参数 String[] args 不能省略；类名与文件名要一致且区分大小写。"
    },
    {
      id: "j02", name: "基本数据类型与变量", chapter: "第3章 Java语言基础",
      keywords: ["基本类型","int","double","char","boolean","变量","常量","final","类型转换","自动转换","强制转换"],
      summary: "Java 有 8 种基本数据类型：byte、short、int、long、float、double、char、boolean。变量要先声明后使用，常量用 final 声明。",
      formula: "整型：byte(8) short(16) int(32) long(64)；浮点：float(32) double(64)；字符：char(16)；布尔：boolean",
      facts: [
        { text: "8 种基本数据类型：byte、short、int、long（整型）、float、double（浮点）、char（字符）、boolean（布尔）。", src: "Java从入门到精通 第3章" },
        { text: "变量声明：类型 变量名 = 值；如 int age = 18；变量必须先赋值再使用，否则编译错误。", src: "Java从入门到精通 第3章" },
        { text: "常量用 final 修饰：final double PI = 3.14；常量名习惯全大写，赋值后不可再修改。", src: "Java从入门到精通 第3章" },
        { text: "自动类型转换：小范围向大范围自动转换（int → long → float → double）；强制转换用 (类型) 显式转换，可能丢失精度。", src: "Java从入门到精通 第3章" },
        { text: "整数默认类型是 int，小数默认类型是 double；long 型字面量加 L、float 型加 F 后缀。", src: "Java从入门到精通 第3章" }
      ],
      example: {
        q: "下列代码输出什么？int a = 7; double b = a / 2.0; System.out.println(b);",
        steps: ["a / 2.0 中 2.0 是 double，a 自动提升为 double 运算。", "7 / 2.0 = 3.5。", "输出 3.5。"],
        answer: "3.5"
      },
      pitfall: "int 相除结果还是 int（7/2=3），要得到小数必须让其中一个操作数为浮点数；强制转换会截断小数。"
    },
    {
      id: "j03", name: "运算符与表达式", chapter: "第3章 Java语言基础",
      keywords: ["运算符","算术","关系","逻辑","赋值","自增","自减","三目","优先级","短路"],
      summary: "Java 运算符包括算术、关系、逻辑、赋值、三目等；注意自增自减的前后置区别与逻辑运算符的短路特性。",
      formula: "算术 + - * / %；自增 ++；关系 == != > <；逻辑 && || !；三目 条件 ? 值1 : 值2",
      facts: [
        { text: "算术运算符：+ - * / %；/ 为除法，整数相除取整；% 取余，结果符号与被除数一致。", src: "Java从入门到精通 第3章" },
        { text: "自增自减：i++ 先使用后加 1，++i 先加 1 后使用；i-- 与 --i 同理。", src: "Java从入门到精通 第3章" },
        { text: "关系运算符返回布尔值：== 相等、!= 不等、> < >= <=；字符串内容比较要用 equals()，不能直接用 ==。", src: "Java从入门到精通 第3章" },
        { text: "逻辑运算符：&& 与（短路：左侧 false 不再算右侧）、|| 或（短路：左侧 true 不再算右侧）、! 非。", src: "Java从入门到精通 第3章" },
        { text: "三目运算符：条件 ? 表达式1 : 表达式2，条件为真取表达式1，否则取表达式2。", src: "Java从入门到精通 第3章" }
      ],
      example: {
        q: "int x = 5; int y = x++ + ++x; 求 x 与 y 的值。",
        steps: ["x++ 先取 5，x 变为 6。", "++x 先加为 7 再取 7。", "y = 5 + 7 = 12，x = 7。"],
        answer: "x = 7，y = 12"
      },
      pitfall: "字符串比较用 equals() 而非 ==；短路运算符 && || 可能不执行右侧表达式（副作用要注意）。"
    },
    {
      id: "j04", name: "流程控制", chapter: "第4章 流程控制",
      keywords: ["if","else","switch","for","while","do-while","break","continue","分支","循环","switch-case"],
      summary: "Java 流程控制包括 if-else 与 switch 分支结构、for/while/do-while 循环结构，以及 break 和 continue 循环控制语句。",
      formula: "if-else if-else；switch(变量){ case 值: … break; default: … }；for(初始化; 条件; 更新)",
      facts: [
        { text: "分支结构：if、if-else、if-else if-else 多分支；switch 按值匹配 case 分支，每个分支后加 break 避免穿透。", src: "Java从入门到精通 第4章" },
        { text: "for 循环：for(初始化; 条件; 步进) { … }，适合循环次数确定的场景。", src: "Java从入门到精通 第4章" },
        { text: "while 循环：先判断条件再执行，条件为 false 时一次都不执行；do-while 至少执行一次再判断。", src: "Java从入门到精通 第4章" },
        { text: "break 终止当前循环；continue 跳过本次循环剩余语句进入下一次迭代；嵌套循环中可用标签跳出外层。", src: "Java从入门到精通 第4章" }
      ],
      example: {
        q: "用 for 循环计算 1~100 的累加和。",
        steps: ["int sum = 0。", "for (int i = 1; i <= 100; i++) sum += i。", "sum = 5050。"],
        answer: "for(int i=1;i<=100;i++) sum+=i; → 5050"
      },
      pitfall: "switch 的 case 漏写 break 会发生穿透；for 循环条件边界 i<=100 与 i<101 等价，注意别写成 i<100 漏掉 100。"
    },
    {
      id: "j05", name: "数组", chapter: "第6章 数组",
      keywords: ["数组","一维数组","二维数组","下标","越界","length","foreach","Arrays","排序"],
      summary: "数组是存放同类型元素的容器，下标从 0 开始。声明、创建、初始化后可遍历访问，增强 for 简化遍历。",
      formula: "声明：int[] a = new int[5]; 或 int[] a = {1,2,3}; 长度：a.length（注意无括号）",
      facts: [
        { text: "数组声明与创建：int[] arr = new int[5] 创建长度 5 的整型数组，默认元素值为 0。", src: "Java从入门到精通 第6章" },
        { text: "数组下标从 0 开始到 length-1；访问越界（如 arr[5]）会抛出 ArrayIndexOutOfBoundsException。", src: "Java从入门到精通 第6章" },
        { text: "数组长度用属性 length（不是方法）：arr.length；遍历可用普通 for 或增强 for（for (int x : arr)）。", src: "Java从入门到精通 第6章" },
        { text: "二维数组：int[][] m = new int[3][4] 表示 3 行 4 列；可看作数组的数组。", src: "Java从入门到精通 第6章" },
        { text: "Arrays 工具类：Arrays.sort(arr) 排序、Arrays.toString(arr) 转字符串、Arrays.copyOf 复制数组。", src: "Java从入门到精通 第6章" }
      ],
      example: {
        q: "创建长度为 3 的整型数组 {5, 2, 8} 并升序排序后输出第 2 个元素。",
        steps: ["int[] a = {5, 2, 8}; Arrays.sort(a); 数组变为 {2, 5, 8}。", "a[1] = 5（下标从 0 开始）。"],
        answer: "Arrays.sort(a); a[1] = 5"
      },
      pitfall: "数组长度是属性 length 不是方法 length()；创建数组后未赋值的元素是默认值（int 为 0、对象为 null）。"
    },
    {
      id: "j06", name: "字符串", chapter: "第5章 字符串",
      keywords: ["String","StringBuilder","不可变","equals","length","substring","indexOf","concat","格式化","正则"],
      summary: "String 是不可变字符序列，提供大量处理方法；StringBuilder/StringBuffer 用于可变字符串的高效拼接。",
      formula: "s.length()、s.equals(其他)、s.substring(a,b)、s.indexOf(子串)、s.split(正则)",
      facts: [
        { text: "String 是不可变对象，任何修改都返回新字符串；创建方式：String s = \"abc\" 或 new String(\"abc\")。", src: "Java从入门到精通 第5章" },
        { text: "字符串内容比较用 s1.equals(s2)；== 比较的是引用地址，不比较内容。", src: "Java从入门到精通 第5章" },
        { text: "常用方法：length() 长度、charAt(i) 取字符、substring(a, b) 截取、indexOf(子串) 查找、split(分隔符) 分割、toLowerCase()/toUpperCase() 大小写。", src: "Java从入门到精通 第5章" },
        { text: "字符串拼接用 + 或 concat()；大量拼接时用 StringBuilder（append()）效率更高，因为 String 拼接会产生多个中间对象。", src: "Java从入门到精通 第5章" },
        { text: "String.format() 或 String.format(\"%.2f\", x) 进行格式化输出；正则表达式可用 Pattern/Matcher 或 String 的 matches()。", src: "Java从入门到精通 第5章" }
      ],
      example: {
        q: "判断字符串 s1=\"abc\" 与 s2=new String(\"abc\") 是否相等（用 == 和 equals）。",
        steps: ["s1 == s2 比较引用：new 创建了新对象，引用不同，结果为 false。", "s1.equals(s2) 比较内容：都为 \"abc\"，结果为 true。"],
        answer: "== 为 false，equals() 为 true"
      },
      pitfall: "字符串比较必须用 equals()；substring(a, b) 是左闭右开区间，substring(0, 3) 取前 3 个字符。"
    },
    {
      id: "j07", name: "类与对象", chapter: "第7章 类和对象",
      keywords: ["类","对象","构造方法","this","static","成员变量","成员方法","new","封装","实例化"],
      summary: "类是对象的模板，对象是类的实例。类包含成员变量与方法，构造方法在 new 时初始化对象，this 指代当前对象。",
      formula: "class 类名 { 成员变量; 构造方法; 成员方法 }；对象：类名 变量 = new 类名();",
      facts: [
        { text: "类由成员变量（属性）与成员方法（行为）组成；用 new 关键字实例化对象：Student s = new Student();。", src: "Java从入门到精通 第7章" },
        { text: "构造方法与类同名、无返回值，在 new 时自动调用，用于初始化对象；未定义时系统提供默认无参构造。", src: "Java从入门到精通 第7章" },
        { text: "this 代表当前对象，可用于区分成员变量与局部变量（this.name = name）、在构造方法中调用其他构造方法 this(...)。", src: "Java从入门到精通 第7章" },
        { text: "static 修饰的成员属于类（所有对象共享），用 类名.成员 访问；static 方法中不能直接访问非 static 成员。", src: "Java从入门到精通 第7章" },
        { text: "对象通过引用访问成员：s.name、s.study()；局部变量在方法内定义，作用域限于方法。", src: "Java从入门到精通 第7章" }
      ],
      example: {
        q: "定义一个学生类 Student，含 name 属性与构造方法，并创建对象。",
        steps: ["class Student { String name; Student(String n) { name = n; } }。", "Student s = new Student(\"张三\");。", "s.name 为 \"张三\"。"],
        answer: "class + 构造方法初始化 + new 创建对象"
      },
      pitfall: "构造方法名必须与类名完全一致且无返回值类型（连 void 都不能写）；this.name = name 用于消除命名歧义。"
    },
    {
      id: "j08", name: "封装与访问控制", chapter: "第7章 类和对象 / 第10章 接口、继承与多态",
      keywords: ["封装","private","public","protected","getter","setter","访问控制","信息隐藏"],
      summary: "封装把对象的属性设为私有（private），通过公开的 getter/setter 方法访问，隐藏内部实现、保护数据安全。",
      formula: "private 类型 属性；public 类型 get属性()；public void set属性(参数)",
      facts: [
        { text: "访问修饰符：public 任何地方可访问、protected 包内与子类可访问、默认（包访问）、private 仅本类内可访问。", src: "Java从入门到精通 第10章" },
        { text: "封装的典型做法：属性用 private 修饰，通过 public 的 getter（取值）与 setter（赋值）方法访问。", src: "Java从入门到精通 第10章" },
        { text: "封装的优点：隐藏内部实现细节、保护数据（可在 setter 中做合法性校验）、提高可维护性。", src: "Java编程思想 第5章 隐藏实施过程" },
        { text: "getter/setter 命名规范：属性 age 对应 getAge() 与 setAge(int age)；boolean 属性 isXxx()。", src: "Java从入门到精通 第10章" }
      ],
      example: {
        q: "为 Student 类的私有属性 age 编写 getter 与 setter（要求年龄 0~150 合法）。",
        steps: ["private int age。", "public int getAge() { return age; }。", "public void setAge(int a) { if (a >= 0 && a <= 150) age = a; }。"],
        answer: "private 属性 + getAge()/setAge() 带校验"
      },
      pitfall: "private 成员只能在本类内访问，其他类必须通过公开方法访问；封装的核心是数据校验与信息隐藏。"
    },
    {
      id: "j09", name: "继承与多态", chapter: "第10章 接口、继承与多态",
      keywords: ["继承","extends","重写","重载","多态","super","向上转型","instanceof","Object","方法覆盖"],
      summary: "继承用 extends 让子类复用父类成员并扩展；方法重写（Override）实现多态，方法重载（Overload）是同名不同参。",
      formula: "class 子类 extends 父类；重写：@Override 同签名；多态：父类引用指向子类对象",
      facts: [
        { text: "继承：子类 extends 父类，继承父类的非私有成员并可添加新成员；Java 单继承（一个类只能有一个直接父类）。", src: "Java从入门到精通 第10章" },
        { text: "super 指代父类对象：super() 调用父类构造方法、super.成员 访问父类成员；子类构造方法默认先调用父类无参构造。", src: "Java从入门到精通 第10章" },
        { text: "方法重写（Override）：子类中定义与父类相同签名的方法覆盖父类实现，可用 @Override 注解；重写要求访问权限不能更严格。", src: "Java从入门到精通 第10章" },
        { text: "方法重载（Overload）：同类中多个方法同名但参数列表不同（个数或类型），与返回值无关。", src: "Java从入门到精通 第10章" },
        { text: "多态：父类引用指向子类对象，调用方法时动态绑定到实际对象类型（Animal a = new Dog(); a.sound() 调用 Dog 的重写方法）。", src: "Java从入门到精通 第10章" },
        { text: "Object 类是所有类的根父类；向上转型自动、向下转型需强制并用 instanceof 判断类型。", src: "Java从入门到精通 第10章" }
      ],
      example: {
        q: "Animal 类有 sound() 方法，Dog 继承并重写 sound()。下列代码调用哪个方法？Animal a = new Dog(); a.sound();",
        steps: ["a 是 Animal 类型的引用，但指向 Dog 对象。", "多态动态绑定，调用 Dog 重写后的 sound()。"],
        answer: "调用 Dog 的 sound()（多态动态绑定）"
      },
      pitfall: "重写是父子类之间相同签名的方法覆盖，重载是同类同名不同参数；static 方法不参与多态重写；构造方法不能被重写。"
    },
    {
      id: "j10", name: "接口与抽象类", chapter: "第10章 接口、继承与多态",
      keywords: ["接口","interface","implements","抽象类","abstract","抽象方法","默认方法","多实现"],
      summary: "抽象类用 abstract 声明，可含抽象方法与具体方法；接口（interface）定义规范，类用 implements 实现，可多实现弥补单继承。",
      formula: "interface 接口名 { 方法签名 }；class 类名 implements 接口名；abstract class 抽象类名",
      facts: [
        { text: "抽象类用 abstract class 声明，可包含抽象方法（abstract 修饰、无方法体）与具体方法；抽象类不能实例化。", src: "Java从入门到精通 第10章" },
        { text: "接口用 interface 定义，方法默认是 public abstract；Java 8+ 支持 default 默认方法与 static 静态方法。", src: "Java从入门到精通 第10章" },
        { text: "类用 implements 实现接口，必须实现接口中所有抽象方法；一个类可实现多个接口（多实现）。", src: "Java从入门到精通 第10章" },
        { text: "接口与抽象类的选择：接口定义能力规范（可以做什么），抽象类提取共性（是什么）；类实现接口、继承抽象类可以同时进行。", src: "Java从入门到精通 第10章" }
      ],
      example: {
        q: "定义一个接口 Playable（含 play() 方法），并让 Music 类实现它。",
        steps: ["interface Playable { void play(); }。", "class Music implements Playable { public void play() { … } }。", "实现方法必须用 public 修饰。"],
        answer: "interface + implements + 实现全部抽象方法"
      },
      pitfall: "实现接口的方法必须声明为 public（接口方法默认 public abstract）；抽象类有构造方法但只能被子类调用，不能 new。"
    },
    {
      id: "j11", name: "异常处理", chapter: "第12章 异常处理",
      keywords: ["异常","try","catch","finally","throws","throw","Exception","RuntimeException","自定义异常"],
      summary: "Java 异常处理用 try-catch-finally 捕获和处理运行时错误；throws 声明异常、throw 抛出异常，保证程序健壮性。",
      formula: "try { 可能出错的代码 } catch (异常类型 e) { 处理 } finally { 无论是否异常都执行 }",
      facts: [
        { text: "异常体系：Throwable 是根，分为 Error（严重错误，通常不处理）与 Exception（可处理）；Exception 分受检异常与运行时异常。", src: "Java从入门到精通 第12章" },
        { text: "try-catch：把可能出错的代码放入 try，catch 捕获并处理异常；多个 catch 按异常类型匹配，父类异常要放在子类后面。", src: "Java从入门到精通 第12章" },
        { text: "finally 块无论是否发生异常都会执行，常用于释放资源（关闭文件、连接）。", src: "Java从入门到精通 第12章" },
        { text: "throws 在方法签名声明可能抛出的异常；throw 在方法内主动抛出异常对象（如 throw new IllegalArgumentException(\"参数非法\")）。", src: "Java从入门到精通 第12章" },
        { text: "常见异常：NullPointerException 空指针、ArrayIndexOutOfBoundsException 数组越界、ArithmeticException 除零、NumberFormatException 数字格式错误。", src: "Java从入门到精通 第12章" }
      ],
      example: {
        q: "用 try-catch 捕获除零异常并输出提示。",
        steps: ["try { int r = 10 / 0; }。", "catch (ArithmeticException e) { System.out.println(\"除数不能为0\"); }。"],
        answer: "try-catch 捕获 ArithmeticException"
      },
      pitfall: "finally 中的 return 会覆盖 try/catch 中的 return；受检异常必须处理（try-catch 或 throws），运行时异常可不强制处理。"
    },
    {
      id: "j12", name: "集合框架与泛型", chapter: "第16章 集合类",
      keywords: ["集合","List","Set","Map","ArrayList","HashSet","HashMap","泛型","迭代器","foreach","增删改查"],
      summary: "集合框架以接口 List、Set、Map 为核心：List 有序可重复、Set 无序不重复、Map 键值对；泛型限定元素类型，避免类型转换错误。",
      formula: "List<String> list = new ArrayList<>(); Map<String, Integer> map = new HashMap<>();",
      facts: [
        { text: "List 接口：有序可重复，常用实现 ArrayList（基于数组，查询快）与 LinkedList（基于链表，增删快）。", src: "Java从入门到精通 第16章" },
        { text: "Set 接口：元素不重复，常用实现 HashSet（基于哈希表）与 TreeSet（自动排序）。", src: "Java从入门到精通 第16章" },
        { text: "Map 接口：键值对存储，key 唯一；常用实现 HashMap（无序）与 TreeMap（按键排序）；常用方法 put/get/containsKey/keySet。", src: "Java从入门到精通 第16章" },
        { text: "泛型在编译期限定集合元素类型：List<String> 只能存 String，读取时无需强制类型转换。", src: "Java从入门到精通 第16章" },
        { text: "遍历集合可用增强 for 或迭代器 Iterator；删除元素时注意并发修改异常（ConcurrentModificationException）。", src: "Java从入门到精通 第16章" }
      ],
      example: {
        q: "创建一个存放字符串的 ArrayList，添加 \"Java\" 和 \"Python\"，并输出长度。",
        steps: ["List<String> list = new ArrayList<>();。", "list.add(\"Java\"); list.add(\"Python\");。", "list.size() 返回 2。"],
        answer: "list.size() = 2"
      },
      pitfall: "HashMap 允许 key 和 value 为 null，Hashtable 不允许；泛型只能用于引用类型（List<int> 错误，要用 List<Integer> 包装类）。"
    }
  ],

  questions: [
    { id: "jq01", topic: "j01", level: "基础", tag: "Java概述",
      q: "Java 程序经 javac 编译后生成的文件扩展名是（ ）。",
      options: [".java", ".class", ".exe", ".jar"],
      answer: 1,
      explain: "javac 把 .java 源文件编译为 .class 字节码文件，由 JVM 解释执行。" },
    { id: "jq02", topic: "j02", level: "基础", tag: "数据类型",
      q: "下列属于 Java 基本数据类型的是（ ）。",
      options: ["String", "Integer", "boolean", "ArrayList"],
      answer: 2,
      explain: "8 种基本类型：byte、short、int、long、float、double、char、boolean；String、Integer、ArrayList 都是引用类型。" },
    { id: "jq03", topic: "j03", level: "进阶", tag: "运算符",
      q: "int x = 5; int y = x++ + ++x; 执行后 y 的值为（ ）。",
      options: ["10", "11", "12", "13"],
      answer: 2,
      explain: "x++ 取 5（x 变 6），++x 先加为 7 再取 7，y = 5 + 7 = 12。" },
    { id: "jq04", topic: "j04", level: "基础", tag: "流程控制",
      q: "下列循环结构中，至少执行一次循环体的是（ ）。",
      options: ["for", "while", "do-while", "foreach"],
      answer: 2,
      explain: "do-while 先执行一次循环体再判断条件，因此至少执行一次；while/for 可能一次都不执行。" },
    { id: "jq05", topic: "j05", level: "基础", tag: "数组",
      q: "int[] a = new int[5]; 数组 a 的长度是（ ）。",
      options: ["5", "6", "a.length()", "4"],
      answer: 0,
      explain: "数组长度用属性 length（不带括号），new int[5] 长度为 5，下标 0~4。" },
    { id: "jq06", topic: "j06", level: "进阶", tag: "字符串",
      q: "String s1 = \"abc\"; String s2 = new String(\"abc\"); 则 s1 == s2 的结果是（ ）。",
      options: ["true", "false", "编译错误", "不确定"],
      answer: 1,
      explain: "new 创建新对象，s1 与 s2 引用不同对象，== 比较引用为 false；内容比较应使用 equals()。" },
    { id: "jq07", topic: "j07", level: "进阶", tag: "类与对象",
      q: "关于构造方法，下列说法正确的是（ ）。",
      options: ["与类名不同也可以", "有返回值类型", "在 new 时自动调用", "可以被重写"],
      answer: 2,
      explain: "构造方法与类同名、无返回值，new 时自动调用用于初始化；构造方法不能被重写。" },
    { id: "jq08", topic: "j09", level: "进阶", tag: "多态",
      q: "Animal a = new Dog();（Dog 继承 Animal 并重写 sound()）调用 a.sound() 执行的是（ ）。",
      options: ["Animal 的 sound", "Dog 的 sound", "编译错误", "运行时异常"],
      answer: 1,
      explain: "多态动态绑定：父类引用指向子类对象，调用被重写的方法时执行实际对象（Dog）的方法。" },
    { id: "jq09", topic: "j11", level: "基础", tag: "异常",
      q: "10 / 0 会抛出（ ）。",
      options: ["NullPointerException", "ArithmeticException", "ArrayIndexOutOfBoundsException", "NumberFormatException"],
      answer: 1,
      explain: "整数除零抛 ArithmeticException（算术异常）。" },
    { id: "jq10", topic: "j12", level: "进阶", tag: "集合",
      q: "下列集合中，元素不重复的是（ ）。",
      options: ["ArrayList", "LinkedList", "HashSet", "HashMap 的 value"],
      answer: 2,
      explain: "Set 接口（HashSet）保证元素唯一不重复；List 有序可重复；Map 中 key 唯一但 value 可重复。" }
  ]
};

/* ===== 深化补充：Python ===== */
PYTHON_COURSE.topics.push(
  {
    id: "py11", name: "面向对象编程", chapter: "面向对象程序设计",
    keywords: ["类","对象","__init__","self","继承","多态","封装","方法","属性","实例"],
    summary: "Python 面向对象用 class 定义类：__init__ 构造方法、self 指代实例；支持继承、方法重写与多态，是大型程序的基础。",
    formula: "class 类名: def __init__(self, 参数): self.属性 = 参数；子类 class 子类(父类)",
    facts: [
      { text: "类定义：class 类名；创建对象 obj = 类名(参数)；__init__ 是构造方法（初始化实例），self 表示实例本身。", src: "Python 教材/程序设计" },
      { text: "属性：self.属性名 定义实例属性；方法：def 方法名(self, ...)，调用 obj.方法()。", src: "Python 程序设计" },
      { text: "继承：class 子类(父类)，子类继承父类方法与属性并可重写（多态）；super().__init__() 调用父类构造。", src: "Python 程序设计" },
      { text: "封装：属性前加下划线 _x（约定私有）、__x（名称改写）；property 实现属性访问控制。", src: "Python 程序设计" }
    ],
    example: {
      q: "定义一个 Student 类，含 name 属性和 say 方法。",
      steps: ["class Student: def __init__(self, n): self.name = n; def say(self): print(self.name)。", "s = Student(\"张三\"); s.say() 输出 张三。"],
      answer: "class + __init__ + self 属性"
    },
    pitfall: "所有实例方法第一个参数是 self；__init__ 不是构造函数而是初始化；子类重写方法后父类方法被覆盖（除非 super()）。"
  },
  {
    id: "py12", name: "模块与常用标准库", chapter: "模块与常用库",
    keywords: ["模块","import","from","sys","os","datetime","json","re","正则","异常"],
    summary: "模块化把代码组织成可复用单元；常用标准库：sys/os 系统接口、datetime 时间、json 数据、re 正则表达式。",
    formula: "import 模块；from 模块 import 函数；json.dumps/loads 序列化；re.match/re.search/re.findall",
    facts: [
      { text: "模块是 .py 文件，用 import 导入；__name__ == \"__main__\" 判断是否直接运行（可导入不执行测试代码）。", src: "Python 程序设计" },
      { text: "sys 模块：sys.argv 命令行参数、sys.exit 退出；os 模块：os.getcwd、os.path 路径操作、os.environ 环境变量。", src: "Python 程序设计" },
      { text: "datetime：datetime.now()、date/time/timedelta 时间运算与格式化（strftime）。", src: "Python 程序设计" },
      { text: "re 正则：re.match（开头匹配）、re.search（任意位置）、re.findall（找全部）、re.sub（替换）；json 用 json.loads/dumps 读写 JSON。", src: "Python 程序设计" }
    ],
    example: {
      q: "把字典 d 序列化为 JSON 字符串。",
      steps: ["import json。", "s = json.dumps(d)。"],
      answer: "json.dumps(d)"
    },
    pitfall: "import 与 from import 的作用域区别；正则贪婪匹配注意加 ? 非贪婪；json.dumps 中文默认转义，需 ensure_ascii=False。"
  }
);

PYTHON_COURSE.questions.push(
  { id: "pyq11", topic: "py11", level: "进阶", tag: "面向对象",
    q: "Python 类中定义实例方法，第一个参数必须是（ ）。",
    options: ["self", "cls", "this", "instance"],
    answer: 0,
    explain: "实例方法的第一个参数约定为 self，指代调用该方法的实例。" },
  { id: "pyq12", topic: "py11", level: "进阶", tag: "继承",
    q: "子类继承父类时用（ ）调用父类的 __init__。",
    options: ["super().__init__()", "parent.__init__()", "self.__init__()", "直接调用类名()"],
    answer: 0,
    explain: "super().__init__(参数) 是调用父类构造方法的标准写法。" },
  { id: "pyq13", topic: "py12", level: "基础", tag: "JSON",
    q: "把字典转成 JSON 字符串的函数是（ ）。",
    options: ["json.loads()", "json.dumps()", "json.load()", "json.dump()"],
    answer: 1,
    explain: "json.dumps 把对象序列化为字符串；loads 反序列化。" }
);

/* ===== 深化补充：Java ===== */
JAVA_COURSE.topics.push(
  {
    id: "j13", name: "包装类与常用类库", chapter: "第8/9章 包装类与常用类",
    keywords: ["包装类","Integer","自动装箱","自动拆箱","Math","日期","Random","比较器","Comparable"],
    summary: "基本类型有对应包装类（Integer 等），支持自动装箱/拆箱；常用类 Math、Random、日期类，以及 Comparable/Comparator 排序。",
    formula: "自动装箱 Integer i = 5；拆箱 int x = i；Math.max/abs/pow；Collections.sort(list)",
    facts: [
      { text: "包装类：Integer、Double、Character、Boolean 等对应 8 种基本类型；自动装箱（基本→包装）与自动拆箱（包装→基本）。", src: "Java从入门到精通 第8章" },
      { text: "Integer 缓存：−128~127 范围内的 Integer 使用缓存，== 比较可能 true（超出范围 false），内容比较用 equals。", src: "Java从入门到精通 第8章" },
      { text: "Math 类：Math.max/min/abs/random/pow/sqrt/floor/ceil；Random 类生成随机数（nextInt、nextDouble）。", src: "Java从入门到精通 第9章" },
      { text: "排序：实现 Comparable 接口（compareTo）或使用 Comparator 比较器（Comparator.comparing(...)），配合 Collections.sort / Arrays.sort。", src: "Java从入门到精通" }
    ],
    example: {
      q: "Integer a = 100; Integer b = 100; a == b 的结果是？",
      steps: ["100 在 −128~127 缓存范围内。", "a 与 b 指向同一缓存对象。", "a == b 为 true（内容比较应优先 equals）。"],
      answer: "true（缓存范围内）"
    },
    pitfall: "包装类 == 比较的是引用（缓存范围内例外），内容比较用 equals；自动拆箱可能出现 NullPointerException（包装为 null 时）。"
  },
  {
    id: "j14", name: "多线程基础", chapter: "多线程",
    keywords: ["线程","Thread","Runnable","run","start","synchronized","线程安全","生命周期","锁"],
    summary: "多线程用继承 Thread 或实现 Runnable 创建；共享资源需 synchronized 同步保证线程安全；了解线程生命周期与常见问题（死锁）。",
    formula: "new Thread(() -> {...}).start()；synchronized(对象){ 临界区 }",
    facts: [
      { text: "创建线程：继承 Thread 重写 run()，或实现 Runnable/使用 lambda（推荐），调用 start() 启动（不是 run()）。", src: "Java 多线程" },
      { text: "线程生命周期：新建 → 就绪 → 运行 → 阻塞/等待 → 终止；sleep 让出 CPU、join 等待线程结束。", src: "Java 多线程" },
      { text: "线程安全：多个线程同时访问共享可变数据需同步；synchronized 方法或代码块保证互斥；volatile 保证可见性。", src: "Java 多线程" },
      { text: "常见问题：死锁（多个线程互相等待对方持有的锁）；用线程池（ExecutorService）管理线程更高效。", src: "Java 多线程" }
    ],
    example: {
      q: "启动线程应该调用哪个方法？",
      steps: ["创建 Thread 对象（含 run 逻辑）。", "调用 start() 启动线程（会执行 run()）。", "直接调 run() 只是普通方法调用，不新建线程。"],
      answer: "start()"
    },
    pitfall: "start() 才创建新线程，run() 直接调用是同步执行；共享资源不同步产生数据竞争；多线程调试注意竞态条件。"
  }
);

JAVA_COURSE.questions.push(
  { id: "jq11", topic: "j13", level: "进阶", tag: "包装类",
    q: "Integer a=100, b=100（自动装箱），a == b 结果为（ ）。",
    options: ["true", "false", "编译错误", "运行时异常"],
    answer: 0,
    explain: "100 在 −128~127 缓存范围，a、b 指向同一对象，== 为 true。" },
  { id: "jq12", topic: "j14", level: "基础", tag: "线程",
    q: "启动一个新线程应该调用（ ）。",
    options: ["run()", "start()", "execute()", "begin()"],
    answer: 1,
    explain: "start() 创建并启动新线程（执行 run）；直接调 run() 是普通调用。" },
  { id: "jq13", topic: "j14", level: "进阶", tag: "线程安全",
    q: "保证多个线程互斥访问共享资源的机制是（ ）。",
    options: ["synchronized", "final", "static", "abstract"],
    answer: 0,
    explain: "synchronized 关键字实现同步互斥，保证线程安全。" }
);

/* ===== 自动搜索扩充：Python + Java ===== */
PYTHON_COURSE.topics.push(
  {
    id: "py13", name: "迭代器与生成器", chapter: "第6/9章 组合数据类型与计算生态",
    keywords: ["迭代器","生成器","yield","惰性求值","可迭代对象","迭代器协议","生成器表达式","next"],
    summary: "迭代器按需逐个产生元素，生成器用 yield 实现惰性求值，适合处理大数据流，避免一次性占用大量内存。",
    formula: "生成器函数含 yield：def gen(): for i in range(n): yield i*i；生成器表达式 (x*x for x in range(10))",
    facts: [
      { text: "可迭代对象实现了 __iter__ 方法，迭代器实现了 __iter__ 与 __next__；for 循环底层就是不断调用 next() 直到 StopIteration。", src: "Python 程序设计教材 组合数据类型" },
      { text: "列表、元组、字典、集合、字符串都是可迭代对象；iter() 获得迭代器，next() 取下一个元素。", src: "Python 程序设计教材 组合数据类型" },
      { text: "生成器函数：包含 yield 关键字，调用时返回生成器对象而不立即执行，每次 next() 执行到 yield 并暂停，实现惰性求值。", src: "Python 程序设计教材" },
      { text: "生成器表达式语法与列表推导式相似但用圆括号，一次只产生一个元素，节省内存；适合大数据、无限序列。", src: "Python 程序设计教材" }
    ],
    example: {
      q: "生成器对象与列表的主要区别是（ ）。",
      steps: ["生成器惰性求值，逐个产生元素。", "不一次性把全部元素放入内存。"],
      answer: "惰性求值、省内存"
    },
    pitfall: "生成器只能迭代一次，迭代完即耗尽；yield 与 return 不同，return 会结束生成器；生成器没有 len() 和下标访问。"
  },
  {
    id: "py14", name: "数据分析与第三方库生态", chapter: "第9章 Python 计算生态概览",
    keywords: ["numpy","pandas","matplotlib","数据分析","数据清洗","数据可视化","科学计算","Series","DataFrame"],
    summary: "Python 计算生态以 numpy（数值计算）、pandas（表格数据处理）、matplotlib（可视化）为核心，支撑数据分析全流程。",
    formula: "import numpy as np; import pandas as pd; import matplotlib.pyplot as plt；pd.read_csv() 读数据，df.groupby() 分组聚合",
    facts: [
      { text: "numpy 提供多维数组 ndarray 与向量化运算，比 Python 列表数值计算快得多；支持广播、矩阵运算与随机数。", src: "Python 教材 计算生态" },
      { text: "pandas 核心数据结构：Series（一维带标签数组）与 DataFrame（二维表格），支持缺失值处理、分组聚合、合并连接。", src: "Python 教材 计算生态" },
      { text: "matplotlib 绘制折线、柱状、散点、饼图等；pyplot 接口 plt.plot()、plt.show()，可自定义标题、标签、图例。", src: "Python 教材 计算生态" },
      { text: "数据分析流程：数据读取（CSV/Excel/数据库）→ 清洗（缺失值、重复、类型转换）→ 分析（统计、分组、透视）→ 可视化与报告。", src: "Python 教材 计算生态" }
    ],
    example: {
      q: "pandas 中二维带标签的表格数据结构是（ ）。",
      steps: ["Series 是一维。", "DataFrame 是二维表格数据结构。"],
      answer: "DataFrame"
    },
    pitfall: "numpy 数组运算要区分元素级运算与矩阵乘法（np.dot/@）；pandas 修改视图可能触发 SettingWithCopyWarning；matplotlib 中文显示需设置字体。"
  }
);

PYTHON_COURSE.questions.push(
  { id: "pyq14", topic: "py13", level: "基础", tag: "生成器",
    q: "生成器函数与普通函数的关键区别是（ ）。",
    options: ["含 yield 关键字", "必须返回列表", "不能有参数", "只能用于字符串"],
    answer: 0,
    explain: "含 yield 的函数是生成器函数，调用返回生成器对象，惰性求值。" },
  { id: "pyq15", topic: "py14", level: "基础", tag: "数据分析",
    q: "pandas 中二维表格数据结构是（ ）。",
    options: ["DataFrame", "Series", "ndarray", "list"],
    answer: 0,
    explain: "DataFrame 是二维带标签表格，Series 是一维。" }
);

JAVA_COURSE.topics.push(
  {
    id: "j15", name: "IO 流与文件操作", chapter: "第17章 IO 流",
    keywords: ["IO流","字节流","字符流","FileInputStream","FileOutputStream","BufferedReader","序列化","文件读写"],
    summary: "Java IO 按流向与处理单位分为字节流和字符流，用装饰器包装缓冲流提升效率，序列化实现对象持久化。",
    formula: "字节流 InputStream/OutputStream；字符流 Reader/Writer；包装：new BufferedReader(new FileReader(路径))",
    facts: [
      { text: "IO 流按方向分为输入流与输出流，按单位分为字节流（InputStream/OutputStream）与字符流（Reader/Writer）。", src: "Java 教材 IO 流" },
      { text: "文件读写：FileInputStream/FileOutputStream 处理字节；FileReader/FileWriter 处理字符；用 try-with-resources 自动关闭资源。", src: "Java 教材 IO 流" },
      { text: "缓冲流 BufferedInputStream/BufferedReader 减少底层读写次数提升性能；字符流常用 readLine() 按行读取。", src: "Java 教材 IO 流" },
      { text: "对象序列化：实现 Serializable 接口，用 ObjectOutputStream/ObjectInputStream 读写对象，transient 字段不序列化。", src: "Java 教材 IO 流" }
    ],
    example: {
      q: "按行读取文本文件应使用哪个类？",
      steps: ["字符流更适合文本。", "BufferedReader 提供 readLine() 按行读取。"],
      answer: "BufferedReader"
    },
    pitfall: "字节流读中文可能乱码，文本用字符流并指定编码；用完流必须关闭（try-with-resources）；序列化要声明 serialVersionUID。"
  },
  {
    id: "j16", name: "网络编程与 JDBC 基础", chapter: "网络编程/JDBC",
    keywords: ["Socket","ServerSocket","TCP","UDP","URL","JDBC","数据库连接","PreparedStatement","ResultSet"],
    summary: "Java 用 Socket/ServerSocket 实现 TCP 通信，用 JDBC 统一访问数据库：加载驱动、建立连接、执行 SQL、处理结果集。",
    formula: "客户端 new Socket(host, port)；服务端 new ServerSocket(port).accept()；JDBC：Connection → Statement/PreparedStatement → ResultSet",
    facts: [
      { text: "TCP 编程：服务端 ServerSocket 监听端口并 accept()，客户端 Socket 连接，通过输入输出流交换数据。", src: "Java 教材 网络编程" },
      { text: "UDP 编程用 DatagramSocket/DatagramPacket，无连接、面向报文；HTTP 客户端可用 URL/HttpURLConnection 或 HttpClient。", src: "Java 教材 网络编程" },
      { text: "JDBC 访问数据库四步：加载驱动（Class.forName）、DriverManager.getConnection 建立连接、Statement/PreparedStatement 执行 SQL、ResultSet 处理结果。", src: "Java 教材 JDBC" },
      { text: "PreparedStatement 预编译可防 SQL 注入且性能更好；事务用 Connection 的 setAutoCommit(false)、commit()、rollback()。", src: "Java 教材 JDBC" }
    ],
    example: {
      q: "JDBC 中防止 SQL 注入应使用（ ）。",
      steps: ["PreparedStatement 预编译参数化 SQL。", "参数用 ? 占位符绑定，避免拼接。"],
      answer: "PreparedStatement"
    },
    pitfall: "网络读写要处理 IOException 并考虑多线程（每连接一线程/线程池）；JDBC 驱动要先加载、用完关闭连接；连接池避免频繁建连。"
  }
);

JAVA_COURSE.questions.push(
  { id: "jq14", topic: "j15", level: "基础", tag: "IO流",
    q: "按行读取文本文件最合适的类是（ ）。",
    options: ["BufferedReader", "FileInputStream", "ObjectOutputStream", "DataInputStream"],
    answer: 0,
    explain: "BufferedReader.readLine() 按行读取文本。" },
  { id: "jq15", topic: "j16", level: "进阶", tag: "JDBC",
    q: "JDBC 中防 SQL 注入应使用（ ）。",
    options: ["PreparedStatement", "Statement", "String 拼接", "ResultSet"],
    answer: 0,
    explain: "PreparedStatement 参数化查询，预编译防止 SQL 注入。" }
);
