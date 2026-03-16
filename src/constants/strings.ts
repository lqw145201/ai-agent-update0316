// COPY — All user-facing strings for the Dremio AI Agent interface

// NAVIGATION
export const NAV_LABELS = {
  home: "Home",
  aiAgent: "AI Agent",
  catalog: "Catalog",
  sql: "SQL",
  semanticLayer: "Sematic Layer",
  admin: "Admin",
} as const;

export const NAV_BOTTOM = {
  initials: "TS",
} as const;

// TOP NAV
export const TOP_NAV = {
  lakehouseName: "First Lakehouse",
  searchPlaceholder: "Search data, scripts, recent jobs and more...",
} as const;

// CHAT LIST
export const CHAT_LIST = {
  newChat: "New chat",
  searchChats: "Search chats",
  recentChats: "Recent chats",
  collapse: "Collapse",
  rename: "Rename",
  delete: "Delete",
  renameTitle: "Rename chat",
  deleteTitle: "Delete chat",
  chatNameLabel: "Chat name",
  deleteConfirm: (name: string) => `Are you sure you want to delete `,
  deleteConfirmBold: (name: string) => name,
  deleteConfirmEnd: "?",
  save: "Save",
  cancel: "Cancel",
} as const;

export const CHAT_LIST_ITEMS = [
  { id: 0, title: "Revenue by region Q4" },
  { id: 1, title: "Revenue by region Q4" },
  { id: 2, title: "Market growth prediction..." },
  { id: 3, title: "Customer satisfaction sur..." },
  { id: 4, title: "Revenue by region Q4" },
  { id: 5, title: "Market prediction..." },
  { id: 6, title: "Customer satisfaction sur..." },
  { id: 7, title: "Revenue by region Q4" },
  { id: 8, title: "Market growth prediction..." },
  { id: 9, title: "Customer satisfaction sur..." },
] as const;

// CHAT PANEL
export const CHAT_PANEL = {
  headerTitle: "AI Agent",
  inputPlaceholder: 'Ask a question about your data, e.g. "What are the top 10 busiest stations?"',
  inputPlaceholderWithChips: "Ask about this data...",
  typingIndicator: "Thinking...",
} as const;

// BLOCK TYPES
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  sql: "SQL",
  table: "TABLE",
  chart: "CHART",
  explanation: "TEXT",
  dataset: "DATASET",
  view: "VIEW",
  wiki: "WIKI",
  lineage: "LINEAGE",
};

export const BLOCK_TYPE_LABELS_WORKSPACE: Record<string, string> = {
  sql: "SQL",
  table: "TABLE",
  chart: "VIS",
  explanation: "TEXT",
  dataset: "DATASET",
  view: "VIEW",
  wiki: "WIKI",
  lineage: "LINEAGE",
};

// WORKSPACE
export const WORKSPACE = {
  title: "Workspace",
  share: "Share",
  historyTitle: "Generated Outputs",
  historySubtitle: (count: number) => `${count} items · newest first`,
  emptyState: "Click a block to view it here",
  showWorkspace: "Show Workspace",
} as const;

// CATALOG
export const CATALOG = {
  title: "Catalog",
  saveAsViewTitle: "Save as View",
  namespacesLabel: (count: number) => `Namespaces (${count})`,
  connectionsLabel: (count: number) => `Connections (${count})`,
  poweredBy: "Powered by Polaris",
  viewNameLabel: "View name",
  viewNamePlaceholder: "my_view",
  locationLabel: "Location",
  locationPlaceholder: "Select a folder below",
  chooseSaveLocation: "Choose save location",
  saveView: "Save View",
  cancel: "Cancel",
  viewSaved: "View saved!",
  savingOutputAs: "Saving output as a Dremio view",
  collapse: "Collapse",
} as const;

// CATALOG CONTEXT MENU
export const CATALOG_MENU_ITEMS = {
  addToChat: "Add to chatbot",
  datasetProfile: "Dataset Profile",
  showSampleData: "Show sample data",
  viewLineage: "View lineage",
  generateWiki: "Generate wiki",
  copyPath: "Copy path",
  queryTable: "Query this table",
} as const;

// ACTION BUTTONS
export const ACTIONS = {
  run: "Run in SQL runner",
  copy: "Copy",
  saveAsView: "Save as View",
  format: "Format",
  explain: "Explain",
  downloadSql: "Download .sql",
  edit: "Edit in SQL runner",
  downloadCsv: "Download CSV",
  downloadJson: "Download JSON",
  downloadPng: "Download PNG",
  downloadTxt: "Download TXT",
  regenerate: "Regenerate",
  exportCsv: "Export CSV",
  zoomToFit: "Zoom to fit",
  execute: "Execute",
  requestChanges: "Request changes",
  saveWiki: "Save Wiki",
  dismiss: "Dismiss",
  query: "Query",
  sampleData: "Sample Data",
} as const;

// SQL ACTIONS OVERFLOW
export const SQL_OVERFLOW_ITEMS = ["Save as View", "Format", "Explain", "Download .sql", "Edit in SQL runner"];
export const TABLE_OVERFLOW_ITEMS = ["Download CSV", "Download JSON"];
export const CHART_OVERFLOW_ITEMS = ["Download PNG", "Download CSV", "Edit"];
export const EXPLANATION_OVERFLOW_ITEMS = ["Download TXT"];

// WORKSPACE TOOLBAR OVERFLOW
export const WS_SQL_OVERFLOW = ["Save as View", "Format", "Explain", "Download .sql", "Edit in SQL runner"];
export const WS_TABLE_OVERFLOW = ["Save as View", "Download JSON"];
export const WS_CHART_OVERFLOW = ["Download PNG", "Download SVG", "Share"];
export const WS_CHART_BAR_OVERFLOW = ["Download PNG", "Download CSV", "Edit"];
export const WS_EXPLANATION_OVERFLOW = ["Download TXT", "Share"];
export const WS_WIKI_OVERFLOW = ["Copy", "Download TXT"];
export const WS_DATASET_OVERFLOW = ["Add to Chat", "View Lineage", "Show Sample Data", "Copy Path"];

// APPROVAL
export const APPROVAL = {
  actionRequired: "ACTION REQUIRED",
  executed: "EXECUTED",
  changesRequested: "CHANGES REQUESTED",
  ddlOperation: "DDL/DML Operation",
  needApproval: "This operation will modify data. I need your approval before proceeding.",
  needExecute: "I need to execute the following SQL statements:",
  alwaysAllow: (schema: string) => `Always allow in ${schema}`,
  allowOnce: "Allow once",
  executedSuccess: "Operation completed successfully. 42 rows were affected.",
  rejectedMessage: "You requested changes. Describe what you'd like modified.",
} as const;

// WIKI
export const WIKI = {
  badge: "WIKI",
  saved: "SAVED",
  dismissed: "DISMISSED",
} as const;

// TOOL CALLS
export const TOOL_CALLS = {
  title: "Tool calls",
  usedTools: (count: number) => `Used ${count} tool${count !== 1 ? "s" : ""}`,
  arguments: "Arguments",
  result: "Result",
  running: "Running...",
  failed: "Failed",
  completed: "Completed",
} as const;

// TOAST MESSAGES
export const TOASTS = {
  addedToChat: (label: string) => `Added "${label}" to chat input`,
  addedContext: (label: string) => `Added "${label}" context to AI Agent`,
  addedQuery: (label: string) => `Added "${label}" to chat — ask your question`,
  openingQuery: (label: string) => `Opening query editor for "${label}"...`,
  loadingSample: (label: string) => `Loading sample data for "${label}"...`,
  loadingLineage: (label: string) => `Loading lineage for "${label}"...`,
  generatingWiki: (label: string) => `Generating wiki for "${label}"...`,
  wikiGenerated: (label: string) => `Wiki generated for "${label}"`,
  loadingProfile: (label: string) => `Loading profile for "${label}"...`,
  copied: (path: string) => `Copied: ${path}`,
  lineageUnavailable: "Lineage not available without chat connection",
  profileUnavailable: "Dataset profile not available without chat connection",
} as const;

// COLLAPSED PANEL LABELS
export const COLLAPSED_PANELS = {
  chats: "Chats",
  catalog: "Catalog",
} as const;

// DATASET PROFILE
export const DATASET_PROFILE = {
  overview: "Overview",
  semantic: "Semantic",
  wiki: "Wiki",
  entity: "Entity",
  metrics: "Metrics",
  volume: "Volume",
  dataQuality: "Data Quality",
  description: "Description",
  noProfile: "No profile data",
  jobs30d: "Jobs (last 30 days)",
  descendants: "Descendants",
  created: "Created",
  owner: "Owner",
  lastUpdated: "Last updated",
  columnName: "Column name",
  attribute: "Attribute",
} as const;