import { DEMO_EXAMPLES, DemoExample } from "@/constants/demos";
import { observable } from "@legendapp/state"

interface PlaygroundStore {
  expression: string
  jsonData: string
  currentDemo: DemoExample

  outputFormat: "string" | "ast"
  cursorPosition?: number
}

export const playgroundStore = observable<PlaygroundStore>({
  currentDemo: DEMO_EXAMPLES[0],
  expression: DEMO_EXAMPLES[0].expression,
  jsonData: DEMO_EXAMPLES[0].jsonData,

  outputFormat: "string",
  cursorPosition: undefined,
})