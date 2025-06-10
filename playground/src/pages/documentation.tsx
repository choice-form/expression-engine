import { useThemeContext } from "@/context"
import { List, SearchInput, tcx } from "@choiceform/design-system"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Link } from "react-router-dom"
import { Prism, SyntaxHighlighterProps } from "react-syntax-highlighter"
import { oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

const SyntaxHighlighter = Prism as unknown as React.FC<SyntaxHighlighterProps>
interface DocSection {
  id: string
  title: string
  file: string
  description: string
  icon: string
  category: "basic" | "advanced" | "reference" | "examples"
}

const docSections: DocSection[] = [
  // 基础入门
  {
    id: "getting-started",
    title: "入门指南",
    file: "getting-started.md",
    description: "5分钟上手表达式基础",
    icon: "🚀",
    category: "basic",
  },
  {
    id: "syntax-basics",
    title: "基础语法",
    file: "syntax-basics.md",
    description: "表达式语法入门",
    icon: "📝",
    category: "basic",
  },
  {
    id: "common-examples",
    title: "常用示例",
    file: "common-examples.md",
    description: "最实用的表达式示例",
    icon: "💡",
    category: "examples",
  },

  // 深入学习
  {
    id: "variables-guide",
    title: "变量使用指南",
    file: "variables-guide.md",
    description: "掌握所有内置变量",
    icon: "🗂",
    category: "reference",
  },
  {
    id: "functions-reference",
    title: "函数库参考",
    file: "functions-reference.md",
    description: "完整的内置函数说明",
    icon: "⚙️",
    category: "reference",
  },

  // 高级功能
  {
    id: "validation-guide",
    title: "验证系统",
    file: "validation-guide.md",
    description: "五层验证体系与安全防护",
    icon: "🛡️",
    category: "advanced",
  },
  {
    id: "ast-guide",
    title: "AST输出功能",
    file: "ast-guide.md",
    description: "语法树输出与静态分析",
    icon: "🌳",
    category: "advanced",
  },

  // 问题解决
  {
    id: "faq",
    title: "常见问题FAQ",
    file: "FAQ.md",
    description: "快速解决常见问题",
    icon: "❓",
    category: "reference",
  },
]

const categories = {
  basic: { title: "基础入门", color: "text-green-600 bg-green-100" },
  examples: { title: "实战示例", color: "text-blue-600 bg-blue-100" },
  reference: { title: "参考手册", color: "text-purple-600 bg-purple-100" },
  advanced: { title: "高级功能", color: "text-orange-600 bg-orange-100" },
}

const Documentation = () => {
  const [selectedDoc, setSelectedDoc] = useState<string>("getting-started")
  const [markdownContent, setMarkdownContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { theme } = useThemeContext()
  const syntaxTheme = theme === "dark" ? vscDarkPlus : oneLight

  // 加载 markdown 内容
  const loadMarkdown = async (filename: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/docs/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`)
      }
      const content = await response.text()
      setMarkdownContent(content)
    } catch (err) {
      setError(`加载文档失败: ${err instanceof Error ? err.message : "未知错误"}`)
      setMarkdownContent("")
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    const doc = docSections.find((doc) => doc.id === selectedDoc)
    if (doc) {
      loadMarkdown(doc.file)
    }
  }, [selectedDoc])

  // 过滤文档
  const filteredDocs = docSections.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 按类别分组
  const groupedDocs = Object.entries(categories).map(([key, category]) => ({
    ...category,
    key,
    docs: filteredDocs.filter((doc) => doc.category === key),
  }))

  const renderCodeBlock = ({ className, children }: { className?: string; children: string }) => {
    // Extract the language from className or set a default
    let language = className ? className.replace("language-", "") : "text"

    // Handle Vue code blocks - map 'vue' language to 'jsx' or 'markup' which Prism supports better
    if (language === "vue") {
      language = "jsx"
    }

    return (
      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        customStyle={{
          borderRadius: "0.375rem",
          margin: "1rem 0",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-mono)",
        }}
      >
        {children}
      </SyntaxHighlighter>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* 左侧导航栏 */}
      <div className="w-80 py-8">
        <div className="sticky top-24">
          <h1 className="mb-2 text-2xl font-medium">📚 Help Center</h1>
          <p className="text-secondary-foreground mb-4">@choiceform/expression-engine</p>

          <SearchInput
            size="large"
            placeholder="Search docs..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            className="mb-4"
          />

          {/* 文档导航 - 使用 List 组件 */}
          <List
            selection
            size="large"
            className="p-0"
          >
            <List.Content>
              {groupedDocs.map((category) => (
                <div key={category.key}>
                  <List.SubTrigger
                    defaultOpen
                    id={category.key}
                    prefixElement={<span className="text-lg">📁</span>}
                  >
                    <List.Value>{category.title}</List.Value>
                  </List.SubTrigger>
                  <List.Content parentId={category.key}>
                    {category.docs.map((doc) => (
                      <List.Item
                        key={doc.id}
                        parentId={category.key}
                        prefixElement={<span className="text-lg">{doc.icon}</span>}
                        onClick={() => setSelectedDoc(doc.id)}
                        selected={selectedDoc === doc.id}
                        className={tcx(
                          "w-80 text-lg",
                          selectedDoc === doc.id ? "bg-secondary-background" : "",
                        )}
                      >
                        <List.Value>{doc.title}</List.Value>
                      </List.Item>
                    ))}
                  </List.Content>
                </div>
              ))}
            </List.Content>
          </List>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1">
        <div className="h-full">
          <div className="mx-auto max-w-4xl p-8">
            {/* Markdown 内容 */}
            {markdownContent && !loading && (
              <div className="prose dark:prose-invert min-w-0 max-w-none overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "")
                      return match ? (
                        renderCodeBlock({
                          className,
                          children: String(children),
                        })
                      ) : (
                        <code
                          className="bg-secondary-active-background rounded px-1 py-0.5"
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => <div>{children}</div>,
                    // 增强表格样式
                    table: (props) => (
                      <div className="overflow-x-auto">
                        <table
                          className="w-full border-collapse"
                          {...props}
                        />
                      </div>
                    ),
                    th: (props) => (
                      <th
                        className="border-default-boundary bg-secondary-active-background border p-2 text-left"
                        {...props}
                      />
                    ),
                    td: (props) => (
                      <td
                        className="border-default-boundary border p-2"
                        {...props}
                      />
                    ),
                    // 处理相对链接
                    a: ({ href, ...props }) => {
                      if (href && href.startsWith("./")) {
                        // 将相对链接转换为应用内链接
                        const targetPackage = href.replace("./", "")
                        return (
                          <Link
                            to={`/packages/${targetPackage}`}
                            {...props}
                          />
                        )
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      )
                    },
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )}

            {/* 空状态 */}
            {!markdownContent && !loading && !error && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <div className="mb-4 text-6xl">📖</div>
                <h2 className="mb-2 text-xl text-gray-900">选择文档开始阅读</h2>
                <p className="text-gray-600">从左侧导航栏选择你想要阅读的文档</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation
