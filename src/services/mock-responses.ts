// SERVICES — Mock AI response generation and data factories
// When replacing with real API calls, only this file and /hooks need to change

import type { OutputBlock, ChatMessage, ApprovalData } from "../hooks/useChat";
import type { ToolCallGroup } from "../hooks/useChat";

// STATE — Mock data generators

/** Generate a mock table result for "Run" actions */
export function generateMockRunResult(): OutputBlock {
  const ts = Date.now();
  return {
    id: `table-run-${ts}`,
    type: "table",
    title: "Query Results",
    version: 1,
    createdAt: ts,
    data: {
      rows: [
        { pickup_datetime: "Grand Central", id: "45,892", passenger_count: "8.2" },
        { pickup_datetime: "Union Square", id: "38,451", passenger_count: "12.4" },
        { pickup_datetime: "Times Square", id: "35,120", passenger_count: "18.7" },
      ],
      meta: "10 rows · 5 cols",
    },
  };
}

/** Generate a mock explanation result for "Explain" actions */
export function generateMockExplainResult(): OutputBlock {
  const ts = Date.now();
  return {
    id: `explanation-${ts}`,
    type: "explanation",
    title: "Query Explanation",
    version: 1,
    createdAt: ts,
    preview:
      "The query joins trip records with station metadata to compute aggregated metrics. The GROUP BY clause partitions results by station, while CASE WHEN expressions split counts between member and casual rider types. The final ORDER BY sorts stations by total trip volume descending, and LIMIT 10 restricts output to only the busiest stations.",
  };
}

/** Generate mock AI responses based on user question keywords */
export function generateMockResponse(question: string): ChatMessage[] {
  const q = question.toLowerCase();
  const ts = Date.now();

  // DDL/DML detection — requires human approval
  if (
    q.includes("update") ||
    q.includes("delete") ||
    q.includes("drop") ||
    q.includes("alter") ||
    q.includes("insert into") ||
    q.includes("create table") ||
    q.includes("truncate")
  ) {
    const sqlStmt = q.includes("update")
      ? "UPDATE TABLE source.raw.a_2025.customers\nSET status = 'inactive'\nWHERE last_login < '2025-01-01'"
      : q.includes("delete")
        ? "DELETE FROM source.raw.a_2025.customers\nWHERE status = 'inactive' AND created_at < '2024-01-01'"
        : q.includes("drop")
          ? "DROP TABLE source.raw.a_2025.temp_staging"
          : q.includes("insert")
            ? "INSERT INTO source.raw.a_2025.customers (name, email, status)\nSELECT name, email, 'active' FROM staging.new_customers"
            : q.includes("create table")
              ? "CREATE TABLE source.raw.a_2025.customer_archive AS\nSELECT * FROM source.raw.a_2025.customers WHERE status = 'inactive'"
              : "ALTER TABLE source.raw.a_2025.customers ADD COLUMN last_synced TIMESTAMP";
    return [
      {
        id: `ai-${ts}-1`,
        role: "ai",
        text: "This operation will modify data. I need your approval before proceeding.",
        approval: { id: `approval-${ts}`, sql: sqlStmt, schema: "source.raw.a_2025", status: "pending" },
      },
    ];
  }

  // Medallion architecture / Customer 360
  if (
    q.includes("medallion") ||
    q.includes("customer 360") ||
    q.includes("c360") ||
    q.includes("bronze layer") ||
    q.includes("bronze views") ||
    q.includes("silver layer") ||
    q.includes("gold layer") ||
    q.includes("create the bronze") ||
    q.includes("build the bronze")
  ) {
    const bronzeSql: OutputBlock = {
      id: `sql-${ts}`,
      type: "sql",
      title: "Bronze Layer DDL",
      version: 1,
      preview: "CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS SELECT customer_id, first_name, last_name, email...",
    };
    const toolCalls: ToolCallGroup = {
      id: `tc-${ts}`,
      steps: [
        {
          id: `tc-${ts}-s1`,
          title: "Search catalog",
          status: "completed",
          description: "Locate CRM and marketing source tables across all schemas",
          arguments: '{"query": "crm customers orders interactions campaigns", "scope": "all", "fuzzy": true}',
          result: "Found 4 tables: crm.raw_customers (2.4M rows), crm.raw_orders (18.7M rows), crm.raw_interactions (45.2M rows), marketing.campaigns (124K rows)",
          durationMs: 420,
        },
        {
          id: `tc-${ts}-s2`,
          title: "Analyze schemas",
          status: "completed",
          description: "Inspect columns, types, and join keys across all 4 source tables",
          arguments: '{"tables": ["crm.raw_customers", "crm.raw_orders", "crm.raw_interactions", "marketing.campaigns"]}',
          result: "47 total columns identified. Primary join key: customer_id. All tables have _ingested_at for watermarking.",
          durationMs: 680,
        },
        {
          id: `tc-${ts}-s3`,
          title: "Design Bronze layer",
          status: "completed",
          description: "Map raw source tables 1:1 into bronze views with minimal transformation",
          result: "Designed 4 Bronze views: raw_customers, raw_orders, raw_interactions, raw_campaigns",
          durationMs: 310,
        },
        {
          id: `tc-${ts}-s4`,
          title: "Generate Bronze DDL",
          status: "completed",
          description: "Write CREATE OR REPLACE VIEW statements for all 4 Bronze views",
          result: "DDL generated for 4 views in bronze.customer_360. Requires execution approval.",
          durationMs: 520,
        },
      ],
    };
    const bronzeDML = `CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS
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
FROM marketing.campaigns;`;
    return [
      {
        id: `ai-${ts}-1`,
        role: "ai",
        text: "I've analyzed all 4 source tables and generated the Bronze layer DDL. These are pass-through views with no transformation — raw data preserved exactly.",
        toolCalls,
        blocks: [bronzeSql],
      },
      {
        id: `ai-${ts}-2`,
        role: "ai",
        text: "I need to execute 4 `CREATE OR REPLACE VIEW` statements in `bronze.customer_360`. Please review and approve:",
        approval: {
          id: `approval-${ts}`,
          sql: bronzeDML,
          schema: "bronze.customer_360",
          status: "pending",
        },
        suggestedQuestions: [
          "Now build the Silver layer",
          "What are the join keys across tables?",
          "Show me the Gold layer schema",
          "How do I query this data?",
        ],
      },
    ];
  }

  if (q.includes("revenue") || q.includes("sales") || q.includes("earnings")) {
    const mockSql: OutputBlock = {
      id: `sql-${ts}`,
      type: "sql",
      title: "Revenue Query",
      version: 1,
      preview:
        "SELECT region, SUM(revenue) AS total_revenue, COUNT(DISTINCT customer_id) AS customers FROM sales.transactions WHERE date >= '2026-01-01' GROUP BY region ORDER BY total_revenue DESC",
    };
    const mockTable: OutputBlock = {
      id: `table-${ts}`,
      type: "table",
      title: "Revenue by Region",
      version: 1,
      data: {
        rows: [
          { pickup_datetime: "Northeast", id: "$4,250,000", passenger_count: "12,450" },
          { pickup_datetime: "West Coast", id: "$3,890,000", passenger_count: "10,820" },
          { pickup_datetime: "Southeast", id: "$2,670,000", passenger_count: "8,340" },
        ],
        meta: "5 rows · 3 cols",
      },
    };
    const toolCalls: ToolCallGroup = {
      id: `tc-${ts}`,
      steps: [
        { id: `tc-${ts}-s1`, title: "Search catalog", status: "completed", description: "Searching for revenue and sales datasets", arguments: '{"query": "revenue sales transactions"}', result: "Found sales.transactions table", durationMs: 250 },
        { id: `tc-${ts}-s2`, title: "Analyze schema", status: "completed", description: "Inspecting sales.transactions columns", result: "15 columns including region, revenue, customer_id, date", durationMs: 140 },
        { id: `tc-${ts}-s3`, title: "Generate SQL", status: "completed", description: "Building aggregation query with GROUP BY region", result: "Generated SELECT with SUM, COUNT DISTINCT, and ORDER BY", durationMs: 380 },
      ],
    };
    return [
      { id: `ai-${ts}-1`, role: "ai", text: "I'll pull revenue data grouped by region. Here's the query:", toolCalls, blocks: [mockSql] },
      {
        id: `ai-${ts}-2`,
        role: "ai",
        text: "Here are your revenue figures — Northeast leads with $4.25M across 12,450 customers.",
        blocks: [mockTable],
        suggestedQuestions: [
          "Show me a chart of this",
          "Break down by month",
          "Filter to top 5 regions",
          "Save this as a view",
        ],
      },
    ];
  }

  if (q.includes("chart") || q.includes("graph") || q.includes("visual") || q.includes("plot")) {
    return [
      {
        id: `ai-${ts}-1`,
        role: "ai",
        text: "I've generated a chart based on the latest data. Click on it to view the full visualization in the workspace.",
        blocks: [{ id: `chart-${ts}`, type: "chart", title: "Visualization", version: 1 }],
      },
    ];
  }

  if (q.includes("explain") || q.includes("what") || q.includes("why") || q.includes("how")) {
    return [{ id: `ai-${ts}-1`, role: "ai", text: "Here's a detailed breakdown:", blocks: [generateMockExplainResult()] }];
  }

  const defaultSql: OutputBlock = {
    id: `sql-${ts}`,
    type: "sql",
    title: "Generated Query",
    version: 1,
    preview: `SELECT * FROM citibike.trips WHERE started_at >= '2026-02-01' LIMIT 100`,
  };
  const defaultTable: OutputBlock = {
    id: `table-${ts}`,
    type: "table",
    title: "Query Results",
    version: 1,
    data: {
      rows: [
        { pickup_datetime: "2026-02-01 08:15:00", id: "a3f2c1d4-8e7b-42...", passenger_count: "2.35" },
        { pickup_datetime: "2026-02-01 09:22:00", id: "b7e4d2a1-3c9f-51...", passenger_count: "1.80" },
        { pickup_datetime: "2026-02-01 10:45:00", id: "c1d8f3b2-6a4e-73...", passenger_count: "3.12" },
      ],
      meta: "100 rows · 6 cols",
    },
  };
  return [
    { id: `ai-${ts}-1`, role: "ai", text: "I've analyzed your request and generated a query. Here are the results:", blocks: [defaultSql] },
    {
      id: `ai-${ts}-2`,
      role: "ai",
      text: "Found 100 matching records. Here's a preview of the data:",
      blocks: [defaultTable],
      suggestedQuestions: [
        "Visualize this as a chart",
        "Filter by date range",
        "Save as a view",
        "Explain this query",
      ],
    },
  ];
}

/** Generate mock wiki text based on node type */
export function getWikiText(nodeLabel: string, nodeType: "source" | "folder" | "table" | "view"): string {
  const wikiTexts: Record<string, string> = {
    source: `${nodeLabel} is a data source namespace containing curated datasets managed by the platform team. It serves as the primary data catalog entry point for downstream analytics workloads. Schema governance policies are enforced at this level.`,
    folder: `${nodeLabel} is a logical folder grouping related datasets with consistent schemas. It contains multiple tables that share a common domain and are typically queried together in analytics pipelines.`,
    table: `${nodeLabel} is a queryable dataset containing structured records. Based on schema analysis: the table has 12 columns, approximately 2.4M rows, and is refreshed daily via incremental ingestion. Common join keys include station_id and trip_id.`,
  };
  return wikiTexts[nodeType];
}

/** Mock dataset profiles keyed by node id */
export function getDatasetProfile(nodeId: string, nodeLabel: string): any {
  const mockProfiles: Record<string, any> = {
    "nyc-trips": {
      path: "Dremio_samples.NYC-taxi-trips.trips",
      labels: ["Gold", "Transport", "NYC"],
      columnCount: 21,
      volume: "~284M rows",
      owner: "John Hill@dremio.com",
      created: "12/13/2021 13:28:18",
      updated: "7/17/2022 18:34:22",
      jobs30d: 21,
      descendants: 25,
      entity: "Trip",
      metrics: ["Trip Distance", "Fare Amount", "Passenger Count"],
      columns: [
        { name: "trip_id", type: "#", attr: "trip identifier" },
        { name: "pickup_datetime", type: "abc", attr: "pickup timestamp" },
        { name: "dropoff_datetime", type: "abc", attr: "dropoff timestamp" },
        { name: "passenger_count", type: "#", attr: "passenger count" },
        { name: "trip_distance", type: "#", attr: "distance miles" },
        { name: "fare_amount", type: "#", attr: "fare USD" },
        { name: "tip_amount", type: "#", attr: "tip USD" },
        { name: "total_amount", type: "#", attr: "total charge" },
        { name: "pickup_zone", type: "abc", attr: "zone name" },
        { name: "dropoff_zone", type: "abc", attr: "zone name" },
        { name: "payment_type", type: "abc", attr: "payment method" },
      ],
      wikiVolume: "284 Million records stored in the data lake",
      wikiQuality: "This dataset has been validated to meet the gold data quality standards by our data quality team.",
      wikiDescription:
        "The yellow and green taxi trip records include fields capturing pick-up and drop-off dates/times, pick-up and drop-off locations, trip distances, itemized fares, rate types, payment types, and driver-reported passenger counts.",
    },
    "nyc-zones": {
      path: "Dremio_samples.NYC-taxi-trips.zones",
      labels: ["Silver", "Reference"],
      columnCount: 4,
      volume: "~265 rows",
      owner: "Jane Doe@dremio.com",
      created: "11/02/2021 09:15:00",
      updated: "11/02/2021 09:15:00",
      jobs30d: 8,
      descendants: 12,
      entity: "Zone",
      metrics: ["Zone Coverage"],
      columns: [
        { name: "zone_id", type: "#", attr: "zone identifier" },
        { name: "zone_name", type: "abc", attr: "zone name" },
        { name: "borough", type: "abc", attr: "NYC borough" },
        { name: "service_zone", type: "abc", attr: "service area" },
      ],
      wikiVolume: "265 records",
      wikiQuality: "Reference dataset maintained by NYC TLC.",
      wikiDescription: "NYC taxi zone lookup table mapping zone IDs to borough and service zone names.",
    },
  };
  return (
    mockProfiles[nodeId] || {
      path: `Dremio_samples.${nodeLabel}`,
      labels: ["Bronze"],
      columnCount: 8,
      volume: "~1.2M rows",
      owner: "admin@dremio.com",
      created: "01/15/2025 10:00:00",
      updated: "03/01/2026 14:30:00",
      jobs30d: 5,
      descendants: 3,
      entity: nodeLabel,
      metrics: ["Row Count"],
      columns: [
        { name: "id", type: "#", attr: "primary key" },
        { name: "name", type: "abc", attr: "display name" },
        { name: "created_at", type: "abc", attr: "timestamp" },
        { name: "status", type: "abc", attr: "record status" },
      ],
      wikiVolume: "1.2 Million records",
      wikiQuality: "Standard data quality checks applied.",
      wikiDescription: `Dataset ${nodeLabel} contains structured records used in analytics workloads.`,
    }
  );
}