import { playgroundStore } from "@/store";
import { Workflow } from "../workflow";
import { IRunData } from "../types";

export function getWorkflowsStore() {
  const workflow = new Workflow();

  const data = playgroundStore.currentDemo.jsonData.peek()
  const parsedData = JSON.parse(data); 

  const workflowRunData: IRunData = {
    "InputNode": [
      {
        executionTime: 1000,
        executionIndex: 0,
        data: {
          main: [
            [
              {
                json: {
                  ...parsedData
                },
              },
            ],
          ],
        },
        startTime: 0,
        source: [{
         previousNode: "InputNode"
        }]
      },
    ],
  };

  const workflowExecution = {
    id: "",
    data: {
      resultData: {
        runData: {
          InputNode: [
            {
              startTime: 0,
              executionTime: 1,
              data: {
                // main: [
                //   [
                //     {
                //       json: {
                //         message: 'Hello World',
                //         message2: 'This is a test message',
                //         value: 42,
                //       },
                //     },
                //   ],
                // ],
              },
              executionIndex: 0,
              source: []
            },
          ],
        },
      },
    },
    workflowData: {}
  }


  return {
    workflow,
    workflowRunData,
    workflowExecution,
    shouldReplaceInputDataWithPinData: false,
    getNodeByName: (name: string) => {
      const nodes = Object.values(workflow.nodes);
      return nodes.find((node) => node.name === name);
    },
    getWorkflowRunData: () => {
      return null;
    },
  };
}
