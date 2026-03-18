// HOOK — Chat state (messages, input, context chips, typing indicator, catalog actions)
// All chat message management and side-effect triggers live here

import { useState, useRef, useCallback, useEffect } from "react";
import {
  generateMockResponse,
  generateMockRunResult,
  generateMockExplainResult,
  getWikiText,
  getDatasetProfile,
} from "../services/mock-responses";

// STATE — Type definitions

export type BlockType = "sql" | "table" | "chart" | "explanation" | "dataset" | "view" | "lineage" | "wiki";

export interface OutputBlock {
  id: string;
  type: BlockType;
  title: string;
  version: number;
  preview?: string;
  data?: any;
  createdAt?: number;
}

export interface ApprovalData {
  id: string;
  sql: string;
  schema: string;
  status: "pending" | "executed" | "rejected";
}

export interface WikiReviewData {
  id: string;
  nodeLabel: string;
  nodeType: "source" | "folder" | "table" | "view";
  wikiText: string;
  status: "pending" | "saved" | "dismissed";
}

// TOOL CALLS — Types for agent tool call steps
export type ToolCallStatus = "completed" | "failed" | "running" | "pending";

export interface ToolCallStep {
  id: string;
  title: string;
  status: ToolCallStatus;
  description?: string;
  arguments?: string;
  result?: string;
  durationMs?: number;
}

export interface ToolCallGroup {
  id: string;
  steps: ToolCallStep[];
}

export interface ContextChip {
  id: string;
  path: string;
  action: "context" | "query";
}

export interface CatalogActions {
  addContextChip: (path: string, action: "context" | "query") => void;
  generateWiki: (nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => void;
  showSampleData: (nodeId: string, nodeLabel: string) => void;
  previewSchema: (nodeId: string, nodeLabel: string) => void;
  viewDatasetProfile: (nodeId: string, nodeLabel: string) => void;
}

export interface ClarifyingQuestion {
  id: string;
  label: string;
  options: string[];
}

export interface ClarifyingQuestionData {
  id: string;
  intro: string;
  questions: ClarifyingQuestion[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text?: string;
  blocks?: OutputBlock[];
  approval?: ApprovalData;
  wikiReview?: WikiReviewData;
  toolCalls?: ToolCallGroup;
  clarifyingQuestion?: ClarifyingQuestionData;
}

// STATE — Initial messages seed

const sourceScanBlock: OutputBlock = {
  id: "table-1",
  type: "table",
  title: "Source Tables Scan",
  version: 1,
  data: {
    rows: [
      { pickup_datetime: "crm.raw_customers", id: "2,413,088", passenger_count: "customer_id" },
      { pickup_datetime: "crm.raw_orders", id: "18,742,651", passenger_count: "order_id" },
      { pickup_datetime: "crm.raw_interactions", id: "45,219,340", passenger_count: "interaction_id" },
      { pickup_datetime: "marketing.campaigns", id: "124,502", passenger_count: "campaign_id" },
    ],
    meta: "4 sources · 3 cols",
  },
};

const bronzeDDLBlock: OutputBlock = {
  id: "sql-1",
  type: "sql",
  title: "Bronze Layer DDL",
  version: 1,
  preview: "CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS SELECT customer_id, first_name, last_name, email, phone, city, state, created_at, updated_at, source_system, _ingested_at FROM crm.raw_customers;",
};

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    text: "I need to build a medallion architecture for our Customer 360 initiative. We have raw CRM data across customers, orders, interactions, and marketing campaigns. Can you design Bronze, Silver, and Gold layers?",
  },
  {
    id: "msg-2",
    role: "ai",
    text: "I'll design a Customer 360 medallion architecture. Let me start by scanning all source tables.",
    toolCalls: {
      id: "tc-1",
      steps: [
        {
          id: "tc-1-s1",
          title: "Search catalog",
          status: "completed",
          description: "Locate CRM and marketing source tables across all schemas",
          arguments: '{"query": "crm customers orders interactions campaigns", "scope": "all", "fuzzy": true}',
          result: "Found 4 tables: crm.raw_customers (2.4M rows), crm.raw_orders (18.7M rows), crm.raw_interactions (45.2M rows), marketing.campaigns (124K rows)",
          durationMs: 420,
        },
        {
          id: "tc-1-s2",
          title: "Analyze schemas",
          status: "completed",
          description: "Inspect columns, types, and join keys across all 4 source tables",
          arguments: '{"tables": ["crm.raw_customers", "crm.raw_orders", "crm.raw_interactions", "marketing.campaigns"]}',
          result: "47 total columns. Primary join key: customer_id. All tables have _ingested_at timestamps.",
          durationMs: 680,
        },
        {
          id: "tc-1-s3",
          title: "Design architecture",
          status: "completed",
          description: "Plan Bronze (raw), Silver (cleansed), and Gold (unified customer_360) layers",
          result: "Architecture: 4 Bronze raw views → 4 Silver cleansed views → 1 Gold customer_360 view",
          durationMs: 310,
        },
      ],
    },
    blocks: [sourceScanBlock],
  },
  {
    id: "msg-3",
    role: "ai",
    text: "Here's the plan:\n\n**Bronze** — 4 raw pass-through views (no transforms)\n**Silver** — cleansed, deduplicated, type-cast\n**Gold** — single `customer_360` view joining all entities\n\nReady to generate the Bronze layer DDL?",
  },
  {
    id: "msg-4",
    role: "user",
    text: "Yes, go ahead and create the Bronze layer views.",
  },
  {
    id: "msg-5",
    role: "ai",
    text: "I've generated DDL for all 4 Bronze views. These are pass-through views — raw data preserved exactly as ingested.",
    toolCalls: {
      id: "tc-2",
      steps: [
        {
          id: "tc-2-s1",
          title: "Design Bronze views",
          status: "completed",
          description: "Map each source table 1:1 to a Bronze raw view in bronze.customer_360",
          result: "4 views designed: raw_customers, raw_orders, raw_interactions, raw_campaigns",
          durationMs: 310,
        },
        {
          id: "tc-2-s2",
          title: "Generate Bronze DDL",
          status: "completed",
          description: "Write CREATE OR REPLACE VIEW statements for all 4 Bronze views",
          result: "DDL generated. 4 statements total. Requires execution approval.",
          durationMs: 520,
        },
      ],
    },
    blocks: [bronzeDDLBlock],
  },
  {
    id: "msg-6",
    role: "ai",
    text: "I need to execute 4 `CREATE OR REPLACE VIEW` statements in `bronze.customer_360`. Please review and approve:",
    approval: {
      id: "approval-init",
      sql: `CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS
SELECT
  customer_id,
  first_name,
  last_name,
  email,
  phone,
  city,
  state,
  created_at,
  updated_at,
  source_system,
  _ingested_at
FROM crm.raw_customers;

CREATE OR REPLACE VIEW bronze.customer_360.raw_orders AS
SELECT
  order_id,
  customer_id,
  order_date,
  total_amount,
  status,
  channel,
  _ingested_at
FROM crm.raw_orders;

CREATE OR REPLACE VIEW bronze.customer_360.raw_interactions AS
SELECT
  interaction_id,
  customer_id,
  interaction_type,
  channel,
  occurred_at,
  sentiment_score,
  _ingested_at
FROM crm.raw_interactions;

CREATE OR REPLACE VIEW bronze.customer_360.raw_campaigns AS
SELECT
  campaign_id,
  customer_id,
  campaign_name,
  sent_at,
  opened_at,
  clicked_at,
  _ingested_at
FROM marketing.campaigns;`,
      schema: "bronze.customer_360",
      status: "pending",
    },
  },
];

// HOOK

interface UseChatOptions {
  onRegisterActions?: (actions: {
    runQuery: () => void;
    explainQuery: () => void;
    catalogActions: CatalogActions;
    wikiSave: (id: string) => void;
    wikiDismiss: (id: string) => void;
    startSaveAsViewFlow: (block: OutputBlock) => void;
  }) => void;
  onBlocksCreated?: (blocks: OutputBlock[]) => void;
}

/** Manages all chat state: messages, input, chips, typing, and catalog integrations */
export function useChat({ onRegisterActions, onBlocksCreated }: UseChatOptions = {}) {
  // STATE
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [contextChips, setContextChips] = useState<ContextChip[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saveAsViewFlow, setSaveAsViewFlow] = useState<{ step: "name" | "location"; payload: Record<string, string> } | null>(null);

  // INTERACTION — Scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // INTERACTION — Run / Explain
  const handleRunBlock = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      const result = generateMockRunResult();
      setMessages((prev) => [
        ...prev,
        { id: `ai-run-${Date.now()}`, role: "ai", text: "Query executed successfully. Here are the results:", blocks: [result] },
      ]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, []);

  const handleExplainBlock = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      const result = generateMockExplainResult();
      setMessages((prev) => [
        ...prev,
        { id: `ai-explain-${Date.now()}`, role: "ai", text: "Here's a detailed explanation of the query:", blocks: [result] },
      ]);
      setIsTyping(false);
    }, 500 + Math.random() * 300);
  }, []);

  // INTERACTION — Approval
  const handleApprovalExecute = useCallback((approvalId: string) => {
    const approvalMsg = messages.find((msg) => msg.approval?.id === approvalId);
    const approvalSchema = approvalMsg?.approval?.schema;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.approval?.id === approvalId) return { ...msg, approval: { ...msg.approval, status: "executed" as const } };
        return msg;
      }),
    );

    setTimeout(() => {
      if (approvalSchema === "bronze.customer_360") {
        const ts = Date.now();
        const viewDefs = [
          { name: "raw_customers", cols: [{ name: "customer_id", type: "#", attr: "primary key" }, { name: "first_name", type: "abc", attr: "given name" }, { name: "last_name", type: "abc", attr: "family name" }, { name: "email", type: "abc", attr: "contact email" }, { name: "phone", type: "abc", attr: "phone number" }, { name: "city", type: "abc", attr: "city" }, { name: "state", type: "abc", attr: "state" }, { name: "created_at", type: "abc", attr: "record created" }, { name: "_ingested_at", type: "abc", attr: "ingest timestamp" }] },
          { name: "raw_orders", cols: [{ name: "order_id", type: "#", attr: "primary key" }, { name: "customer_id", type: "#", attr: "foreign key" }, { name: "order_date", type: "abc", attr: "order date" }, { name: "total_amount", type: "#", attr: "total USD" }, { name: "status", type: "abc", attr: "order status" }, { name: "channel", type: "abc", attr: "sales channel" }, { name: "_ingested_at", type: "abc", attr: "ingest timestamp" }] },
          { name: "raw_interactions", cols: [{ name: "interaction_id", type: "#", attr: "primary key" }, { name: "customer_id", type: "#", attr: "foreign key" }, { name: "interaction_type", type: "abc", attr: "type" }, { name: "channel", type: "abc", attr: "channel" }, { name: "occurred_at", type: "abc", attr: "event time" }, { name: "sentiment_score", type: "#", attr: "sentiment" }, { name: "_ingested_at", type: "abc", attr: "ingest timestamp" }] },
          { name: "raw_campaigns", cols: [{ name: "campaign_id", type: "#", attr: "primary key" }, { name: "customer_id", type: "#", attr: "foreign key" }, { name: "campaign_name", type: "abc", attr: "name" }, { name: "sent_at", type: "abc", attr: "send time" }, { name: "opened_at", type: "abc", attr: "open time" }, { name: "clicked_at", type: "abc", attr: "click time" }, { name: "_ingested_at", type: "abc", attr: "ingest timestamp" }] },
        ];
        const createdViews: OutputBlock[] = viewDefs.map((v, i) => ({
          id: `view-${ts}-${i + 1}`,
          type: "view" as const,
          title: `bronze.customer_360.${v.name}`,
          version: 1,
          createdAt: ts + i,
          preview: `bronze.customer_360.${v.name}`,
          data: {
            profile: {
              path: `bronze.customer_360.${v.name}`,
              labels: ["Bronze"],
              columnCount: v.cols.length,
              volume: "pass-through view",
              owner: "AI Agent",
              created: new Date(ts).toLocaleString(),
              updated: new Date(ts).toLocaleString(),
              jobs30d: 0,
              descendants: 0,
              entity: v.name.replace("raw_", ""),
              metrics: ["Row Count"],
              columns: v.cols,
              wikiVolume: "Pass-through Bronze view — no row transforms applied.",
              wikiQuality: "Raw ingest. No deduplication or type casting.",
              wikiDescription: `Bronze raw view over crm source table. Created by AI Agent as part of Customer 360 medallion architecture.`,
            },
          },
        }));
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-exec-${ts}`,
            role: "ai",
            text: "4 Bronze views created in `bronze.customer_360`. Step 3 complete — ready to design the Silver layer.",
            blocks: createdViews,
          },
        ]);
        onBlocksCreated?.(createdViews);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `ai-exec-${Date.now()}`, role: "ai", text: "The operation completed successfully. 42 rows were affected." },
        ]);
      }
    }, 800);
  }, [messages, onBlocksCreated]);

  const handleApprovalReject = useCallback((approvalId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.approval?.id === approvalId) return { ...msg, approval: { ...msg.approval, status: "rejected" as const } };
        return msg;
      }),
    );
  }, []);

  // INTERACTION — Wiki
  const handleWikiSave = useCallback((wikiId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.wikiReview?.id === wikiId) return { ...msg, wikiReview: { ...msg.wikiReview, status: "saved" as const } };
        return msg;
      }),
    );
  }, []);

  const handleWikiDismiss = useCallback((wikiId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.wikiReview?.id === wikiId) return { ...msg, wikiReview: { ...msg.wikiReview, status: "dismissed" as const } };
        return msg;
      }),
    );
  }, []);

  // INTERACTION — Context chips
  const addContextChip = useCallback((path: string, action: "context" | "query") => {
    setContextChips((prev) => {
      if (prev.find((c) => c.path === path)) return prev;
      return [...prev, { id: `chip-${Date.now()}`, path, action }];
    });
    textareaRef.current?.focus();
  }, []);

  const removeContextChip = useCallback((chipId: string) => {
    setContextChips((prev) => prev.filter((c) => c.id !== chipId));
  }, []);

  // INTERACTION — Catalog actions (wiki, sample, lineage, profile)
  const generateWiki = useCallback(
    (nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => {
      const ts = Date.now();
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-wiki-${ts}`,
            role: "ai",
            text: `I've generated a wiki description for ${nodeLabel}. Please review and confirm to save:`,
            wikiReview: { id: `wiki-${ts}`, nodeLabel, nodeType, wikiText: getWikiText(nodeLabel, nodeType), status: "pending" },
          },
        ]);
        setIsTyping(false);
      }, 600 + Math.random() * 400);
    },
    [],
  );

  const showSampleData = useCallback((_nodeId: string, nodeLabel: string) => {
    const ts = Date.now();
    const sampleBlock: OutputBlock = {
      id: `sample-${ts}`,
      type: "table",
      title: `Sample Data · ${nodeLabel}`,
      version: 1,
      createdAt: ts,
      data: {
        rows: [
          { pickup_datetime: "2026-02-01 08:15:00", id: "a3f2c1d4-8e7b", passenger_count: "2" },
          { pickup_datetime: "2026-02-01 09:22:00", id: "b7e4d2a1-3c9f", passenger_count: "1" },
          { pickup_datetime: "2026-02-01 10:45:00", id: "c1d8f3b2-6a4e", passenger_count: "3" },
        ],
        meta: `3 sample rows · ${nodeLabel}`,
      },
    };
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-sample-${ts}`,
          role: "ai",
          text: `Here's a sample of data from ${nodeLabel}. Click the block to expand in the workspace.`,
          blocks: [sampleBlock],
        },
      ]);
      setIsTyping(false);
    }, 400 + Math.random() * 300);
  }, []);

  const previewSchema = useCallback((_nodeId: string, nodeLabel: string) => {
    const ts = Date.now();
    const lineageBlock: OutputBlock = {
      id: `lineage-${ts}`,
      type: "chart",
      title: `Lineage · ${nodeLabel}`,
      version: 1,
      createdAt: ts,
      data: {
        lineage: true,
        targetLabel: nodeLabel,
        nodes: [
          {
            id: "src-raw",
            label: "raw_events",
            namespace: "Ingestion.pipeline",
            type: "source",
            columns: ["event_id", "timestamp", "user_id", "event_type", "payload", "source_ip"],
          },
          {
            id: "src-users",
            label: "user",
            namespace: "Marketing.analysis",
            type: "view",
            columns: ["user_id", "register_date", "version", "plan_type", "country", "device_type", "referral_source"],
          },
          {
            id: "target",
            label: nodeLabel,
            namespace: "Marketing.analysis",
            type: "view",
            columns: ["user_id", "register_date", "version", "plan_type", "country", "device_type", "user_id", "referral_source"],
          },
        ],
        edges: [
          { from: "src-raw", to: "target" },
          { from: "src-users", to: "target" },
        ],
      },
    };
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-lineage-${ts}`,
          role: "ai",
          text: `Here's the data lineage for ${nodeLabel}. Click to expand the graph in the workspace.`,
          blocks: [lineageBlock],
        },
      ]);
      setIsTyping(false);
    }, 500 + Math.random() * 300);
  }, []);

  const viewDatasetProfile = useCallback((_nodeId: string, nodeLabel: string) => {
    const ts = Date.now();
    const profile = getDatasetProfile(_nodeId, nodeLabel);
    const datasetBlock: OutputBlock = {
      id: `dataset-${ts}`,
      type: "dataset",
      title: nodeLabel,
      version: 1,
      createdAt: ts,
      preview: profile.path,
      data: { profile },
    };
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-profile-${ts}`,
          role: "ai",
          text: `Here's the dataset profile for ${nodeLabel}. Click to view full details in the workspace.`,
          blocks: [datasetBlock],
        },
      ]);
      setIsTyping(false);
    }, 400 + Math.random() * 300);
  }, []);

  // INTERACTION — Save As View conversational flow
  const startSaveAsViewFlow = useCallback((block: OutputBlock) => {
    const ts = Date.now();
    setSaveAsViewFlow({ step: "name", payload: { blockTitle: block.title } });
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-saveview-start-${ts}`,
        role: "ai",
        text: `I'll save **"${block.title}"** as a view. What would you like to name it?`,
      },
    ]);
  }, []);

  // INTERACTION — Send
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed && contextChips.length === 0) return;
    if (isTyping) return;
    const chipText = contextChips.map((c) => `@${c.path}`).join(" ");
    const fullText = [chipText, trimmed].filter(Boolean).join(" ");
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text: fullText }]);
    setInputValue("");
    setContextChips([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Intercept if in save-as-view flow
    if (saveAsViewFlow) {
      if (saveAsViewFlow.step === "name") {
        setSaveAsViewFlow({ step: "location", payload: { ...saveAsViewFlow.payload, viewName: fullText } });
        const ts = Date.now();
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-followup-loc-${ts}`,
              role: "ai",
              text: `Got it — naming it **"${fullText}"**. Where should it be saved? (e.g., \`bronze.customer_360\`, \`silver.customer_360\`, or \`My Space\`)`,
            },
          ]);
        }, 300);
      } else if (saveAsViewFlow.step === "location") {
        const viewName = saveAsViewFlow.payload.viewName ?? "my_view";
        setSaveAsViewFlow(null);
        setIsTyping(true);
        setTimeout(() => {
          const ts = Date.now();
          const viewBlock: OutputBlock = {
            id: `view-saved-${ts}`,
            type: "view",
            title: `${fullText}.${viewName}`,
            version: 1,
            createdAt: ts,
            preview: `${fullText}.${viewName}`,
            data: {
              profile: {
                path: `${fullText}.${viewName}`,
                labels: ["View"],
                columnCount: 0,
                volume: "saved view",
                owner: "AI Agent",
                created: new Date(ts).toLocaleString(),
                updated: new Date(ts).toLocaleString(),
                jobs30d: 0,
                descendants: 0,
              },
            },
          };
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-save-confirm-${ts}`,
              role: "ai",
              text: `View **"${viewName}"** has been saved to \`${fullText}\`. It's now available in the catalog and ready to query.`,
              blocks: [viewBlock],
            },
          ]);
          onBlocksCreated?.([viewBlock]);
          setIsTyping(false);
        }, 700);
      }
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      const aiMessages = generateMockResponse(fullText);
      setMessages((prev) => [...prev, ...aiMessages]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, [inputValue, isTyping, contextChips, saveAsViewFlow]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        return;
      }
      if (e.key === "Backspace" && inputValue === "" && contextChips.length > 0) {
        setContextChips((prev) => prev.slice(0, -1));
      }
    },
    [handleSend, inputValue, contextChips],
  );

  const handleTextareaInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, []);

  // INTERACTION — Register actions for cross-panel communication
  const catalogActions: CatalogActions = {
    addContextChip,
    generateWiki,
    showSampleData,
    previewSchema,
    viewDatasetProfile,
  };

  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        runQuery: handleRunBlock,
        explainQuery: handleExplainBlock,
        catalogActions,
        wikiSave: handleWikiSave,
        wikiDismiss: handleWikiDismiss,
        startSaveAsViewFlow,
      });
    }
  }, [onRegisterActions, handleRunBlock, handleExplainBlock, handleWikiSave, handleWikiDismiss, startSaveAsViewFlow]);

  return {
    // STATE
    inputValue,
    setInputValue,
    messages,
    isTyping,
    contextChips,
    messagesEndRef,
    textareaRef,
    catalogActions,
    // INTERACTION
    handleSend,
    handleInputKeyDown,
    handleTextareaInput,
    handleRunBlock,
    handleExplainBlock,
    handleApprovalExecute,
    handleApprovalReject,
    handleWikiSave,
    handleWikiDismiss,
    startSaveAsViewFlow,
    removeContextChip,
  };
}