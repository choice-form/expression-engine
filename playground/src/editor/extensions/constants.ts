export const ALLOWED_HTML_ATTRIBUTES = [
  "href",
  "name",
  "target",
  "title",
  "class",
  "id",
  "style",
];

export const ALLOWED_HTML_TAGS = [
  "p",
  "strong",
  "b",
  "code",
  "a",
  "br",
  "i",
  "ul",
  "li",
  "em",
  "small",
  "details",
  "summary",
  "mark",
];

export const VALID_EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const CREDENTIAL_EDIT_MODAL_KEY = "editCredential";

//#region Node Type

export const HTTP_REQUEST_NODE_TYPE = "nodes-base.httpRequest";
export const SPLIT_IN_BATCHES_NODE_TYPE = "nodes-base.splitInBatches";
export const FUNCTION_NODE_TYPE = "nodes-base.function";
export const FUNCTION_ITEM_NODE_TYPE = "nodes-base.functionItem";
export const CODE_NODE_TYPE = "nodes-base.code";
export const AI_TRANSFORM_NODE_TYPE = "nodes-base.aiTransform";
export const EXECUTE_WORKFLOW_NODE_TYPE = 'nodes-base.executeWorkflow';

//#endregion

export const NO_OP_NODE_TYPE = "n8n-nodes-base.noOp";

export const UNKNOWN_ERROR_MESSAGE =
  "There was an unknown issue while executing the node";
export const UNKNOWN_ERROR_DESCRIPTION =
  'Double-check the node configuration and the service it connects to. Check the error details below and refer to the <a href="https://docs.n8n.io" target="_blank">n8n documentation</a> to troubleshoot the issue.';
export const UNKNOWN_ERROR_MESSAGE_CRED = "UNKNOWN ERROR";

export const PLACEHOLDER_FILLED_AT_EXECUTION_TIME =
  "[filled at execution time]";

export const SCRIPTING_NODE_TYPES = [
  FUNCTION_NODE_TYPE,
  FUNCTION_ITEM_NODE_TYPE,
  CODE_NODE_TYPE,
  AI_TRANSFORM_NODE_TYPE,
];

export const EXPRESSION_EDITOR_PARSER_TIMEOUT = 15_000; // ms