/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WorkflowOperationError, NodeOperationError, ExpressionError, WorkflowActivationError,  ExecutionCancelledError } from "../workflow/errors";
import type { ExecutionStatus } from "./execution-status";

export type OnError =
  | "continueErrorOutput"
  | "continueRegularOutput"
  | "stopWorkflow";

export interface INode {
  id: string;
  name: string;
  typeVersion: number;
  type: string;
  position: [number, number];
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  onError?: OnError;
  continueOnFail?: boolean;
  parameters: INodeParameters;
  credentials?: INodeCredentials;
  webhookId?: string;
  extendsCredential?: string;
  rewireOutputLogTo?: NodeConnectionType;

  // forces the node to execute a particular custom operation
  // based on resource and operation
  // instead of calling default execute function
  // used by evaluations test-runner
  forceCustomOperation?: {
    resource: string;
    operation: string;
  };
}

export type XYPosition = [number, number];

export interface INodeUi extends INode {
  position: XYPosition;
  color?: string;
  notes?: string;
  issues?: any;
  name: string;
  pinData?: IDataObject;
}

export interface INodes {
  [key: string]: INode;
}

//#region Node Parameters

export interface INodeParameters {
  [key: string]: NodeParameterValueType;
}

export type NodeParameterValueType =
  // TODO: Later also has to be possible to add multiple ones with the name name. So array has to be possible
  | NodeParameterValue
  | INodeParameters
  | INodeParameterResourceLocator
  | ResourceMapperValue
  | FilterValue
  | AssignmentCollectionValue
  | NodeParameterValue[]
  | INodeParameters[]
  | INodeParameterResourceLocator[]
  | ResourceMapperValue[];

export type NodeParameterValue = string | number | boolean | undefined | null;

export type ResourceLocatorModes = "id" | "url" | "list" | string;

export interface INodeParameterResourceLocator {
  __rl: true;
  mode: ResourceLocatorModes;
  value: NodeParameterValue;
  cachedResultName?: string;
  cachedResultUrl?: string;
  __regex?: string;
}

//#endregion

//#region Assignment

export type AssignmentCollectionValue = {
  assignments: AssignmentValue[];
};

export type AssignmentValue = {
  id: string;
  name: string;
  value: NodeParameterValue;
  type?: string;
};

//#endregion

//#region Filter

export type FilterValue = {
  options: FilterOptionsValue;
  conditions: FilterConditionValue[];
  combinator: FilterTypeCombinator;
};

export type FilterOptionsValue = {
  caseSensitive: boolean;
  leftValue: string;
  typeValidation: "strict" | "loose";
  version: 1 | 2;
};

export type FilterConditionValue = {
  id: string;
  leftValue: NodeParameterValue | NodeParameterValue[];
  operator: FilterOperatorValue;
  rightValue: NodeParameterValue | NodeParameterValue[];
};

export type FilterTypeCombinator = "and" | "or";

export interface FilterOperatorValue {
  type: FilterOperatorType;
  operation: string;
  rightType?: FilterOperatorType;
  singleValue?: boolean; // default = false
}

export type FilterOperatorType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "dateTime"
  | "any";

//#endregion

export interface INodeCredentialsDetails {
  id: string | null;
  name: string;
}

export interface INodeCredentials {
  [key: string]: INodeCredentialsDetails;
}

export type GenericValue =
  | string
  | object
  | number
  | boolean
  | undefined
  | null;

export interface IDataObject {
  [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}

export interface IBinaryKeyData {
  [key: string]: IBinaryData;
}

export type BinaryFileType =
  | "text"
  | "json"
  | "image"
  | "audio"
  | "video"
  | "pdf"
  | "html";

export interface IBinaryData {
  [key: string]: string | number | undefined;
  data: string;
  mimeType: string;
  fileType?: BinaryFileType;
  fileName?: string;
  directory?: string;
  fileExtension?: string;
  fileSize?: string; // TODO: change this to number and store the actual value
  id?: string;
}

export interface INodeConnection {
  sourceIndex: number;
  destinationIndex: number;
}

export interface IPairedItemData {
  item: number;
  input?: number; // If undefined "0" gets used
  sourceOverwrite?: ISourceData;
}

export interface ISourceData {
  previousNode: string;
  previousNodeOutput?: number; // If undefined "0" gets used
  previousNodeRun?: number; // If undefined "0" gets used
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export type JsonObject = { [key: string]: JsonValue };

export type Functionality = "regular" | "configuration-node" | "pairedItem";

export type NativeDoc = {
  typeName: string;
  properties?: Record<string, { doc?: DocMetadata }>;
  functions: Record<string, { doc?: DocMetadata }>;
};

export type DocMetadataArgument = {
  name: string;
  type?: string;
  optional?: boolean;
  variadic?: boolean;
  description?: string;
  default?: string;
  // Function arguments have nested arguments
  args?: DocMetadataArgument[];
};

export type DocMetadataExample = {
  example: string;
  evaluated?: string;
  description?: string;
};

export type DocMetadata = {
  name: string;
  returnType: string;
  description?: string;
  section?: string;
  hidden?: boolean;
  aliases?: string[];
  args?: DocMetadataArgument[];
  examples?: DocMetadataExample[];
  docURL?: string;
};

export type FormFieldsParameter = Array<{
  fieldLabel: string;
  elementName?: string;
  fieldType?: string;
  requiredField?: boolean;
  fieldOptions?: { values: Array<{ option: string }> };
  multiselect?: boolean;
  multipleFiles?: boolean;
  acceptFileTypes?: string;
  formatDate?: string;
  html?: string;
  placeholder?: string;
  fieldName?: string;
  fieldValue?: string;
}>;

export type FieldTypeMap = {
  boolean: boolean;
  number: number;
  string: string;
  "string-alphanumeric": string;
  dateTime: string;
  time: string;
  array: unknown[];
  object: object;
  options: unknown;
  url: string;
  jwt: string;
  "form-fields": FormFieldsParameter;
};

export type FieldType = keyof FieldTypeMap;

export type ResourceMapperValue = {
  mappingMode: string;
  value: { [key: string]: string | number | boolean | null } | null;
  matchingColumns: string[];
  schema: ResourceMapperField[];
  attemptToConvertTypes: boolean;
  convertFieldsToString: boolean;
};

export interface ResourceMapperField {
  id: string;
  displayName: string;
  defaultMatch: boolean;
  canBeUsedToMatch?: boolean;
  required: boolean;
  display: boolean;
  type?: FieldType;
  removed?: boolean;
  options?: INodePropertyOptions[];
  readOnly?: boolean;
}

export interface INodePropertyOptions {
  name: string;
  value: string | number | boolean;
  action?: string;
  description?: string;
  routing?: any;
  outputConnectionType?: NodeConnectionType;
  inputSchema?: unknown;
}

export const NodeConnectionTypes = {
  AiAgent: "ai_agent",
  AiChain: "ai_chain",
  AiDocument: "ai_document",
  AiEmbedding: "ai_embedding",
  AiLanguageModel: "ai_languageModel",
  AiMemory: "ai_memory",
  AiOutputParser: "ai_outputParser",
  AiRetriever: "ai_retriever",
  AiReranker: "ai_reranker",
  AiTextSplitter: "ai_textSplitter",
  AiTool: "ai_tool",
  AiVectorStore: "ai_vectorStore",
  
  Main: "main",
} as const;

export type NodeConnectionType =
  (typeof NodeConnectionTypes)[keyof typeof NodeConnectionTypes];

export type ValidationResult<T extends FieldType = FieldType> =
  | { valid: false; errorMessage: string }
  | {
      valid: true;
      newValue?: FieldTypeMap[T];
    };

export interface IStatusCodeMessages {
  [key: string]: string;
}

export interface TargetItem {
  nodeName: string;
  itemIndex: number;
  runIndex: number;
  outputIndex: number;
}

export interface IExecuteData {
  data: any;
  metadata?: any;
  node: INode;
  source: any | null;
}

export interface INodeExecutionData {
	[key: string]:
		| IDataObject
		| IBinaryKeyData
		| IPairedItemData
		| IPairedItemData[]
		| NodeOperationError
		| number
		| undefined;
	json: IDataObject;
	binary?: IBinaryKeyData;
	error?:  NodeOperationError;
	pairedItem?: IPairedItemData | IPairedItemData[] | number;
	metadata?: {
		subExecution: RelatedExecution;
	};

	/**
	 * @deprecated This key was added by accident and should not be used as it
	 * will be removed in future. For more information see PR #12469.
	 */
	index?: number;
}

export interface StartNodeData {
  name: string;
  sourceData: ISourceData | null;
}

// Contains all the data which is needed to execute a workflow and so also to
// start restart it again after it did fail.
// The RunData, ExecuteData and WaitForExecution contain often the same data.
export interface IRunExecutionData {
  startData?: {
    startNodes?: StartNodeData[];
    destinationNode?: string;
    originalDestinationNode?: string;
    runNodeFilter?: string[];
  };
  resultData: {
    error?: ExecutionError;
    runData: IRunData;
    pinData?: IPinData;
    lastNodeExecuted?: string;
    metadata?: Record<string, string>;
  };
  executionData?: {
    contextData: IExecuteContextData;
    nodeExecutionStack: IExecuteData[];
    metadata: {
      // node-name: metadata by runIndex
      [key: string]: ITaskMetadata[];
    };
    waitingExecution: IWaitingForExecution;
    waitingExecutionSource: IWaitingForExecutionSource | null;
  };
  parentExecution?: RelatedExecution;
  waitTill?: Date;
  pushRef?: string;

  /** Data needed for a worker to run a manual execution. */
  manualData?: Pick<
    IWorkflowExecutionDataProcess,
    | "partialExecutionVersion"
    | "dirtyNodeNames"
    | "triggerToStartFrom"
    | "userId"
  >;
}

export interface IWaitingForExecutionSource {
  // Node name
  [key: string]: {
    // Run index
    [key: number]: ITaskDataConnectionsSource;
  };
}

export interface ITaskDataConnectionsSource {
  // Key for each input type and because there can be multiple inputs of the same type it is an array
  // null is also allowed because if we still need data for a later while executing the workflow set temporary to null
  // the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
  [key: string]: Array<ISourceData | null>;
}

export interface RelatedExecution {
  executionId: string;
  workflowId: string;
}

export type IContextObject = {
  [key: string]: any;
};

export interface IExecuteContextData {
  // Keys are: "flow" | "node:<NODE_NAME>"
  [key: string]: IContextObject;
}

export interface ITaskSubRunMetadata {
  node: string;
  runIndex: number;
}

export interface ITaskMetadata {
  subRun?: ITaskSubRunMetadata[];
  parentExecution?: RelatedExecution;
  subExecution?: RelatedExecution;
  subExecutionsCount?: number;
}

export interface IWaitingForExecution {
  // Node name
  [key: string]: {
    // Run index
    [key: number]: ITaskDataConnections;
  };
}

// The data for all the different kind of connections (like main) and all the indexes
export interface ITaskDataConnections {
  // Key for each input type and because there can be multiple inputs of the same type it is an array
  // null is also allowed because if we still need data for a later while executing the workflow set temporary to null
  // the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
  [key: string]: Array<INodeExecutionData[] | null>;
}

export type IWorkflowDataProxyAdditionalKeys = IDataObject & {
  $execution?: {
    id: string;
    mode: "test" | "production";
    resumeUrl: string;
    resumeFormUrl: string;
    customData?: {
      set(key: string, value: string): void;
      setAll(obj: Record<string, string>): void;
      get(key: string): string;
      getAll(): Record<string, string>;
    };
  };
  $vars?: IDataObject;
  $secrets?: IDataObject;
  $pageCount?: number;

  /** @deprecated */
  $executionId?: string;
  /** @deprecated */
  $resumeWebhookUrl?: string;
};

export type WorkflowExecuteMode =
  | "cli"
  | "error"
  | "integrated"
  | "internal"
  | "manual"
  | "retry"
  | "trigger"
  | "webhook"
  | "evaluation";

export interface IWorkflowExecutionDataProcess {
  destinationNode?: string;
  restartExecutionId?: string;
  executionMode: WorkflowExecuteMode;
  /**
   * The data that is sent in the body of the webhook that started this
   * execution.
   */
  executionData?: IRunExecutionData;
  runData?: IRunData;
  pinData?: IPinData;
  retryOf?: string | null;
  pushRef?: string;
  startNodes?: StartNodeData[];
  workflowData: IWorkflowBase;
  userId?: string;
  projectId?: string;
  /**
   * Defines which version of the partial execution flow is used.
   * Possible values are:
   *  1 - use the old flow
   *  2 - use the new flow
   */
  partialExecutionVersion?: 1 | 2;
  dirtyNodeNames?: string[];
  triggerToStartFrom?: {
    name: string;
    data?: ITaskData;
  };
  agentRequest?: AiAgentRequest;
}

export type WorkflowId = IWorkflowBase["id"];

export interface IWorkflowBase {
  id: string;
  name: string;
  active: boolean;
  isArchived: boolean;
  createdAt: Date;
  startedAt?: Date;
  updatedAt: Date;
  nodes: INode[];
  connections: IConnections;
  settings?: IWorkflowSettings;
  staticData?: IDataObject;
  pinData?: IPinData;
  versionId?: string;
}

export namespace WorkflowSettings {
  export type CallerPolicy =
    | "any"
    | "none"
    | "workflowsFromAList"
    | "workflowsFromSameOwner";
  export type SaveDataExecution = "DEFAULT" | "all" | "none";
}

export interface IWorkflowSettings {
  timezone?: "DEFAULT" | string;
  errorWorkflow?: string;
  callerIds?: string;
  callerPolicy?: WorkflowSettings.CallerPolicy;
  saveDataErrorExecution?: WorkflowSettings.SaveDataExecution;
  saveDataSuccessExecution?: WorkflowSettings.SaveDataExecution;
  saveManualExecutions?: "DEFAULT" | boolean;
  saveExecutionProgress?: "DEFAULT" | boolean;
  executionTimeout?: number;
  executionOrder?: "v0" | "v1";
  timeSavedPerExecution?: number;
}

export interface IConnection {
  // The node the connection is to
  node: string;

  // The type of the input on destination node (for example "main")
  type: NodeConnectionType;

  // The output/input-index of destination node (if node has multiple inputs/outputs of the same type)
  index: number;
}

// First array index: The output/input-index (if node has multiple inputs/outputs of the same type)
// Second array index: The different connections (if one node is connected to multiple nodes)
// Any index can be null, for example in a switch node with multiple indexes some of which are not connected
export type NodeInputConnections = Array<IConnection[] | null>;

export interface INodeConnections {
  // Input name
  [key: string]: NodeInputConnections;
}

export interface IConnections {
  // Node name
  [key: string]: INodeConnections;
}

export interface IPinData {
  [nodeName: string]: INodeExecutionData[];
}

export interface AiAgentRequest {
  query: string | INodeParameters;
  tool: {
    name: string;
  };
}

export interface IRunData {
  // node-name: result-data
  [key: string]: ITaskData[];
}

export interface ITaskStartedData {
  startTime: number;
  /** This index tracks the order in which nodes are executed */
  executionIndex: number;
  source: Array<ISourceData | null>; // Is an array as nodes have multiple inputs
  hints?: NodeExecutionHint[];
}

/** The data that gets returned when a node execution ends */
export interface ITaskData extends ITaskStartedData {
  executionTime: number;
  executionStatus?: ExecutionStatus;
  data?: ITaskDataConnections;
  inputOverride?: ITaskDataConnections;
  error?: ExecutionError;
  metadata?: ITaskMetadata;
}

export type NodeExecutionHint = Omit<
  NodeHint,
  "whenToDisplay" | "displayCondition"
>;

export type NodeHint = {
  message: string;
  type?: "info" | "warning" | "danger";
  location?: "outputPane" | "inputPane" | "ndv";
  displayCondition?: string;
  whenToDisplay?: "always" | "beforeExecution" | "afterExecution";
};

export type ExecutionError =
  | ExpressionError
  | WorkflowActivationError
  | WorkflowOperationError
  | ExecutionCancelledError
  | NodeOperationError

export interface ProxyInput {
  all: () => INodeExecutionData[];
  context: any;
  first: () => INodeExecutionData | undefined;
  item: INodeExecutionData | undefined;
  last: () => INodeExecutionData | undefined;
  params?: INodeParameters;
}

export interface IWorkflowDataProxyData {
  [key: string]: any;
  $binary: INodeExecutionData["binary"];
  $data: any;
  $env: any;
  $evaluateExpression: (
    expression: string,
    itemIndex?: number
  ) => NodeParameterValueType;
  $item: (itemIndex: number, runIndex?: number) => IWorkflowDataProxyData;
  $items: (
    nodeName?: string,
    outputIndex?: number,
    runIndex?: number
  ) => INodeExecutionData[];
  $json: INodeExecutionData["json"];
  $node: any;
  $parameter: INodeParameters;
  $position: number;
  $workflow: any;
  $: any;
  $input: ProxyInput;
  $thisItem: any;
  $thisRunIndex: number;
  $thisItemIndex: number;
  $now: any;
  $today: any;
  $getPairedItem: (
    destinationNodeName: string,
    incomingSourceData: ISourceData | null,
    pairedItem: IPairedItemData
  ) => INodeExecutionData | null;
  constructor: any;
}

