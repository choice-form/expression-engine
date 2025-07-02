import {  useCallback, useState } from "react"
import { Button, Segmented } from "@choiceform/design-system"
import JsonEditor from "./json-editor"
import { DEMO_EXAMPLES, type DemoExample } from "../constants/demos"
import { playgroundStore } from "@/store"
import { observer } from "@legendapp/state/react"
import { useEventCallback } from "usehooks-ts"
import { Segment } from "@/editor/workflow/expression/types"
import {ExpressionEditor,  ExpressionOutput } from "@/editor/components"


const ExpressionPlayground = observer(function ExpressionPlayground() {
  const currentDemo = playgroundStore.currentDemo.get()
  const outputFormat = playgroundStore.outputFormat.get()
  const expression = playgroundStore.expression.get()

  const [segments, setSegments] = useState<Segment[]>([]);

  const handleSwitchDemo = useCallback((demo: DemoExample) => {
    playgroundStore.currentDemo.set(demo)
    playgroundStore.jsonData.set(demo.jsonData)
    playgroundStore.expression.set(demo.expression) 
  }, [])

  const handleJsonDataChange = useEventCallback((value: string) => {
    playgroundStore.jsonData.set(value)
  })

  const handleOutputFormatChange = useCallback((value: string) => {
    playgroundStore.outputFormat.set(value as "string" | "ast")
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="border-default-boundary flex flex-col gap-4 rounded-lg border p-4">
        <h4 className="text-default-foreground text-lg font-medium">
          🎯 Expression Engine Explorer
        </h4>
        <p className="text-secondary-foreground">
          Click to experience the expression engine, support AST output
        </p>
        <div className="flex flex-wrap gap-4">
          {DEMO_EXAMPLES.map((demo, index) => (
            <Button
              key={index}
              onClick={() => handleSwitchDemo(demo)}
              active={currentDemo.title === demo.title}
              variant={currentDemo.title === demo.title ? "primary" : "secondary"}
            >
              {demo.title}
            </Button>
          ))}
        </div>

        {currentDemo && (
          <div className="mt-2 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              <strong>当前演示：</strong>
              {currentDemo.title} - {currentDemo.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* 表达式输入 */}
        <div className="flex flex-col gap-2">
          <h3 className="text-default-foreground text-lg font-medium leading-6">
            Expression Input
          </h3>

          <p className="text-secondary-foreground">
            输入 <code>{"{{ "}$</code> 触发自动补全，可以修改表达式测试
          </p>

          <ExpressionEditor value={expression} segments={segments} onSegmentsChange={setSegments} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 输出格式切换 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-default-foreground flex-1 text-lg font-medium leading-6">
                  🎯 Output
                </h3>

                <Segmented
                  value={outputFormat}
                  onChange={handleOutputFormatChange}
                >
                  <Segmented.Item
                    className="px-2"
                    value="string"
                  >
                    String
                  </Segmented.Item>
                  <Segmented.Item
                    className="px-2"
                    value="ast"
                  >
                    AST
                  </Segmented.Item>
                </Segmented>
              </div>
              <p className="text-secondary-foreground">
                输出结果，可通过 <code>$result</code> 访问
              </p>
            </div>

            <ExpressionOutput segments={segments} />
          </div>

          {/* JSON 数据输入 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-default-foreground text-lg font-medium leading-6">
                📊 JSON Data ($json)
              </h3>
              <p className="text-secondary-foreground">
                当前演示的数据，通过 <code>$json.字段名</code> 访问
              </p>
            </div>

            <JsonEditor
              value={currentDemo.jsonData}
              onChange={handleJsonDataChange}
              placeholder="输入 JSON 数据..." />
          </div>
        </div>
      </div>
    </div>
  )
})

export default ExpressionPlayground
