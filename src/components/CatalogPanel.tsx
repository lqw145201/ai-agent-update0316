// COMPONENT — Catalog panel (data source tree browser and picker)
// Portable version: no Figma svgPaths imports — uses inline path constants + IconMore
// Browse mode (TreeItem) and pick mode (PickableTreeItem) with folder/source icons

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useToast } from "./Toast";
// Inline path data for non-standard viewBox icons used in this panel
// Source: svg-javaskxvh1.ts

// SourceIcon — outer square (viewBox: 0 0 12.2222 12.2222)
const PATH_SOURCE_OUTER = "M0 1.66667C0 0.74619 0.7462 0 1.66667 0H10.5556C11.476 0 12.2222 0.74619 12.2222 1.66667V10.5556C12.2222 11.476 11.476 12.2222 10.5556 12.2222H1.66667C0.7462 12.2222 0 11.476 0 10.5556V1.66667ZM1.25 2.08333C1.25 1.6231 1.6231 1.25 2.08334 1.25H10.1389C10.5991 1.25 10.9722 1.6231 10.9722 2.08333V10.1389C10.9722 10.5991 10.5991 10.9722 10.1389 10.9722H2.08334C1.6231 10.9722 1.25 10.5991 1.25 10.1389V2.08333Z";
// SourceIcon — inner L-axis (viewBox: 0 0 11.1111 11.1111)
const PATH_SOURCE_INNER = "M0.625 0C0.97018 0 1.25 0.27982 1.25 0.625V8.95834C1.25 9.23094 1.31635 9.39384 1.38375 9.49494C1.45375 9.59994 1.55157 9.67774 1.6684 9.73614C1.78767 9.79574 1.91452 9.82874 2.01681 9.84574C2.06648 9.85404 2.1065 9.85794 2.13166 9.85974C2.14413 9.86064 2.15262 9.86094 2.15644 9.86104L10.4861 9.86114C10.8313 9.86114 11.1111 10.1409 11.1111 10.4861C11.1111 10.8313 10.8313 11.1111 10.4861 11.1111H2.15278V10.4861C2.15278 11.1111 2.1531 11.1111 2.15278 11.1111H2.15148H2.15004L2.14671 11.111L2.13832 11.1109L2.1148 11.1104C2.09624 11.1097 2.0719 11.1086 2.0426 11.1065C1.98421 11.1023 1.90488 11.0943 1.81131 11.0787C1.62715 11.048 1.37205 10.9855 1.10938 10.8541C0.84426 10.7216 0.56014 10.5129 0.34368 10.1882C0.12462 9.85964 0 9.44964 0 8.95834V0.625C0 0.27982 0.27982 0 0.625 0Z";
// FolderIcon (viewBox: 0 0 16.6666 13.3334)
const PATH_FOLDER = "M6.2425 0.335C5.92916 0.1175 5.55583 0 5.1725 0H1.875L1.74666 0.00417018C1.27267 0.0366902 0.8287 0.24793 0.50447 0.59521C0.18024 0.94249 -5.9985e-05 1.3999 1.49702e-08 1.875V11.4584L0.00416006 11.5867C0.0366801 12.0607 0.24793 12.5047 0.5952 12.8289C0.94248 13.1531 1.39989 13.3334 1.875 13.3334H14.7916L14.92 13.3292C15.394 13.2967 15.8379 13.0854 16.1622 12.7382C16.4864 12.3909 16.6667 11.9335 16.6666 11.4584V3.95834L16.6625 3.83L16.6491 3.69834C16.5864 3.25036 16.3638 2.84017 16.0225 2.54337C15.6811 2.24657 15.244 2.08319 14.7916 2.08334H8.35163L6.3725 0.435L6.2425 0.335ZM1.25 11.4584V5.41584V4.16584V1.875L1.25583 1.79C1.27637 1.64037 1.3504 1.50325 1.46422 1.40398C1.57804 1.30471 1.72397 1.25001 1.875 1.25H5.1725L5.25916 1.25584C5.37483 1.27196 5.48367 1.32017 5.57333 1.395L7.14833 2.7075C7.58693 3.06476 7.79274 3.33334 8.35083 3.33334C8.64613 3.33334 14.7916 3.33334 14.7916 3.33334L14.8766 3.33917C15.0263 3.35971 15.1634 3.43374 15.2627 3.54756C15.3619 3.66138 15.4166 3.80731 15.4166 3.95834V11.4584L15.4108 11.5434C15.3903 11.693 15.3162 11.8301 15.2024 11.9294C15.0886 12.0287 14.9427 12.0834 14.7916 12.0834H1.875L1.79 12.0775C1.485 12.0367 1.25 11.775 1.25 11.4584Z";
// Chevron caret (viewBox: 0 0 10.4397 5.96941)
const PATH_CHEVRON = "M9.6904 5.96907C9.88916 5.96907 10.0798 5.89018 10.2204 5.74973C10.3609 5.6091 10.4397 5.41848 10.4397 5.21973C10.4397 5.02098 10.3609 4.83036 10.2204 4.68973L5.75 0.219338C5.60937 0.0788879 5.41875 0 5.22 0C5.02124 0 4.83062 0.0788879 4.69 0.219338L0.238707 4.6707C0.16502 4.73936 0.105918 4.82216 0.0649265 4.91416C0.0239347 5.00616 0.00189341 5.10547 0.000116715 5.20617C-0.00165998 5.30688 0.0168637 5.40691 0.0545849 5.5003C0.092306 5.59368 0.148451 5.67852 0.21967 5.74974C0.290889 5.82095 0.375723 5.8771 0.469111 5.91482C0.562499 5.95254 0.662527 5.97107 0.76323 5.96929C0.863932 5.96751 0.963247 5.94547 1.05525 5.90448C1.14725 5.86349 1.23005 5.80438 1.29871 5.7307L5.22 1.80934L9.1604 5.74973C9.30103 5.89018 9.49165 5.96907 9.6904 5.96907Z";
// Polaris star/asterisk 12×12
const PATH_POLARIS = "M2.04053 2.27993C1.91054 2.12105 2.12105 1.91054 2.27993 2.04053L5.90311 5.00492C5.96852 5.05844 6.06129 5.06273 6.13135 5.01545L8.1102 3.68026C8.26523 3.57566 8.45093 3.76141 8.34638 3.91644L7.01112 5.89538C6.96388 5.9654 6.96812 6.05809 7.02155 6.12351L9.95955 9.72015C10.0894 9.879 9.879 10.0894 9.72015 9.95955L6.1235 7.02155C6.05809 6.96813 5.96539 6.96389 5.89538 7.01112L3.91643 8.34637C3.76141 8.451 3.57566 8.26522 3.68026 8.1102L5.01544 6.13136C5.06272 6.0613 5.05844 5.96852 5.00492 5.90312L2.04053 2.27993Z";
// Add/plus cross 10×10
const PATH_PLUS = "M6.66667 3.33333C6.83243 3.33333 6.9914 3.39918 7.10861 3.51639C7.22582 3.6336 7.29167 3.79257 7.29167 3.95833V6.04167H9.375C9.54076 6.04167 9.69973 6.10751 9.81694 6.22473C9.93415 6.34194 10 6.50091 10 6.66667C10 6.83243 9.93415 6.9914 9.81694 7.10861C9.69973 7.22582 9.54076 7.29167 9.375 7.29167H7.29167V9.375C7.29167 9.54076 7.22582 9.69973 7.10861 9.81694C6.9914 9.93415 6.83243 10 6.66667 10C6.50091 10 6.34194 9.93415 6.22473 9.81694C6.10751 9.69973 6.04167 9.54076 6.04167 9.375V7.29167H3.95833C3.79257 7.29167 3.6336 7.22582 3.51639 7.10861C3.39918 6.9914 3.33333 6.83243 3.33333 6.66667C3.33333 6.50091 3.39918 6.34194 3.51639 6.22473C3.6336 6.10751 3.79257 6.04167 3.95833 6.04167H6.04167V3.95833C6.04167 3.79257 6.10751 3.6336 6.22473 3.51639C6.34194 3.39918 6.50091 3.33333 6.66667 3.33333Z";
// Circle outline 13.3333×13.3333
const PATH_CIRCLE = "M13.3333 6.66667C13.3333 10.3486 10.3486 13.3333 6.66667 13.3333C2.98477 13.3333 0 10.3486 0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667ZM12.0833 6.66667C12.0833 9.65821 9.65821 12.0833 6.66667 12.0833C3.67512 12.0833 1.25 9.65821 1.25 6.66667C1.25 3.67512 3.67512 1.25 6.66667 1.25C9.65821 1.25 12.0833 3.67512 12.0833 6.66667Z";
// Notebook/document icon (viewBox: 0 0 13.75 16.6666)
const PATH_NOTEBOOK = "M2.5 3.33333C2.5 3.11232 2.5878 2.90035 2.74408 2.74407C2.90036 2.58779 3.11232 2.5 3.33334 2.5H9.99997C10.221 2.5 10.433 2.58779 10.5893 2.74407C10.7456 2.90035 10.8334 3.11232 10.8334 3.33333V5C10.8334 5.22101 10.7456 5.43297 10.5893 5.58925C10.433 5.74553 10.221 5.83333 9.99997 5.83333H3.33334C3.11232 5.83333 2.90036 5.74553 2.74408 5.58925C2.5878 5.43297 2.5 5.22101 2.5 5V3.33333ZM3.75 4.58333H9.58337V3.75H3.75V4.58333ZM0 2.08333C0 1.5308 0.2195 1.00089 0.6102 0.61019C1.0009 0.21949 1.5308 0 2.08334 0H11.6667C11.9403 0 12.2112 0.0538801 12.464 0.15858C12.7167 0.26328 12.9464 0.41674 13.1398 0.61019C13.3333 0.80365 13.4868 1.03331 13.5914 1.28607C13.6961 1.53883 13.75 1.80974 13.75 2.08333V13.9583C13.75 14.1241 13.6842 14.283 13.567 14.4002C13.4498 14.5175 13.2908 14.5833 13.125 14.5833H1.25C1.25 14.8043 1.3378 15.0163 1.49408 15.1726C1.65036 15.3288 1.86232 15.4166 2.08334 15.4166H13.125C13.2908 15.4166 13.4498 15.4825 13.567 15.5997C13.6842 15.7169 13.75 15.8759 13.75 16.0416C13.75 16.2074 13.6842 16.3664 13.567 16.4836C13.4498 16.6008 13.2908 16.6666 13.125 16.6666H2.08334C1.5308 16.6666 1.0009 16.4471 0.6102 16.0564C0.2195 15.6657 0 15.1358 0 14.5833V2.08333ZM1.25 13.3333H12.5V2.08333C12.5 1.86232 12.4122 1.65035 12.256 1.49407C12.0997 1.33779 11.8877 1.25 11.6667 1.25H2.08334C1.86232 1.25 1.65036 1.33779 1.49408 1.49407C1.3378 1.65035 1.25 1.86232 1.25 2.08333V13.3333Z";
import { IconMore } from "./icons/IconMore";
import { IconClose } from "./icons/IconClose";
import type { BlockType, CatalogActions } from "../hooks/useChat";
import { IconEntityTable } from "./icons/IconEntityTable";
import { IconEntityView } from "./icons/IconEntityView";

interface CatalogPanelProps {
  onCollapse: () => void;
  saveViewMode?: { blockTitle: string; blockType: BlockType } | null;
  onSaveView?: (viewName: string, locationPath: string) => void;
  onCancelSave?: () => void;
  catalogActions?: CatalogActions | null;
  addedSources?: Array<{ name: string; type: "file" | "source" }>;
}

interface TreeNode {
  id: string;
  label: string;
  type: "source" | "folder" | "table" | "view";
  children?: TreeNode[];
}

const namespaceData: TreeNode[] = [
  {
    id: "dremio-samples",
    label: "Dremio_samples",
    type: "source",
    children: [
      {
        id: "nyc-taxi",
        label: "NYC-taxi-trips",
        type: "folder",
        children: [
          { id: "nyc-trips", label: "trips", type: "table" },
          { id: "nyc-zones", label: "zones", type: "table" },
          { id: "nyc-fares", label: "fares", type: "table" },
        ],
      },
      {
        id: "sf-weather",
        label: "SF-weather",
        type: "folder",
        children: [
          { id: "sf-daily", label: "daily_observations", type: "table" },
          { id: "sf-stations", label: "weather_stations", type: "table" },
        ],
      },
      {
        id: "production",
        label: "Production",
        type: "source",
        children: [
          {
            id: "citibike",
            label: "citibike",
            type: "folder",
            children: [
              { id: "cb-trips", label: "trips", type: "table" },
              { id: "cb-stations", label: "stations", type: "table" },
              { id: "cb-members", label: "members", type: "table" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "analytics-space",
    label: "Analytics",
    type: "source",
    children: [
      {
        id: "reports",
        label: "Reports",
        type: "folder",
        children: [
          { id: "rpt-monthly", label: "monthly_summary", type: "view" },
          { id: "rpt-kpis", label: "kpi_dashboard", type: "view" },
        ],
      },
    ],
  },
];

const connectionData: TreeNode[] = [
  { id: "glue", label: "Glue", type: "source" },
  { id: "unity", label: "Unity", type: "source" },
  { id: "aws", label: "AWS", type: "source" },
  { id: "samples", label: "Samples", type: "source" },
];

/* ── helpers ─────────────────────────────────────────────── */

function findNodePath(nodes: TreeNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const current = [...path, node.label];
    if (node.id === targetId) return current;
    if (node.children) {
      const found = findNodePath(node.children, targetId, current);
      if (found) return found;
    }
  }
  return null;
}

function buildFullPath(nodeId: string): string {
  const allData = [...namespaceData, ...connectionData];
  const parts = findNodePath(allData, nodeId);
  return parts ? parts.join(".") : nodeId;
}

/* ── Mock sample data per table ──────────────────────────── */

const sampleDataMap: Record<string, { columns: string[]; rows: string[][] }> = {
  "nyc-trips": {
    columns: ["pickup_datetime", "dropoff_datetime", "passenger_count", "trip_distance"],
    rows: [
      ["2026-01-15 08:12:00", "2026-01-15 08:34:00", "2", "4.3"],
      ["2026-01-15 09:05:00", "2026-01-15 09:22:00", "1", "2.1"],
      ["2026-01-15 10:30:00", "2026-01-15 10:58:00", "3", "7.8"],
    ],
  },
  "nyc-zones": {
    columns: ["zone_id", "zone_name", "borough", "service_zone"],
    rows: [
      ["1", "Newark Airport", "EWR", "EWR"],
      ["2", "Jamaica Bay", "Queens", "Boro Zone"],
      ["3", "Allerton/Pelham", "Bronx", "Boro Zone"],
    ],
  },
  "nyc-fares": {
    columns: ["trip_id", "fare_amount", "tip_amount", "total_amount"],
    rows: [
      ["a3f2c1", "$12.50", "$2.50", "$18.30"],
      ["b7e4d2", "$8.00", "$1.50", "$12.80"],
      ["c1d8f3", "$22.00", "$5.00", "$31.50"],
    ],
  },
  "sf-daily": {
    columns: ["date", "temp_high", "temp_low", "precipitation"],
    rows: [
      ["2026-02-01", "62°F", "48°F", "0.00 in"],
      ["2026-02-02", "58°F", "45°F", "0.12 in"],
      ["2026-02-03", "65°F", "50°F", "0.00 in"],
    ],
  },
  "sf-stations": {
    columns: ["station_id", "station_name", "latitude", "longitude"],
    rows: [
      ["USW001", "SF Downtown", "37.7749", "-122.4194"],
      ["USW002", "SF Airport", "37.6213", "-122.3790"],
    ],
  },
  "cb-trips": {
    columns: ["trip_id", "started_at", "ended_at", "member_casual"],
    rows: [
      ["T001", "2026-02-10 07:30", "2026-02-10 07:52", "member"],
      ["T002", "2026-02-10 08:15", "2026-02-10 08:40", "casual"],
      ["T003", "2026-02-10 09:00", "2026-02-10 09:18", "member"],
    ],
  },
  "cb-stations": {
    columns: ["station_id", "station_name", "capacity", "status"],
    rows: [
      ["S001", "Grand Central", "45", "active"],
      ["S002", "Union Square", "38", "active"],
      ["S003", "Times Square", "52", "maintenance"],
    ],
  },
  "cb-members": {
    columns: ["member_id", "plan_type", "signup_date", "status"],
    rows: [
      ["M001", "annual", "2025-06-01", "active"],
      ["M002", "monthly", "2025-11-15", "active"],
      ["M003", "annual", "2024-03-20", "expired"],
    ],
  },
  "rpt-monthly": {
    columns: ["month", "total_trips", "revenue", "new_members"],
    rows: [
      ["2026-01", "284,510", "$1.2M", "3,420"],
      ["2026-02", "312,890", "$1.4M", "4,105"],
    ],
  },
  "rpt-kpis": {
    columns: ["kpi_name", "current_value", "target", "status"],
    rows: [
      ["Avg Trip Duration", "14.2 min", "15 min", "on-track"],
      ["Member Retention", "87%", "85%", "exceeded"],
      ["Station Utilization", "72%", "80%", "at-risk"],
    ],
  },
};

/* ── Mock wiki data ──────────────────────────────────────── */

const wikiSnippets: Record<string, string> = {
  "source": "Data source namespace containing curated datasets managed by the platform team.",
  "folder": "Logical grouping of related datasets. Contains tables with consistent schemas.",
  "table": "Queryable dataset. Use AI Agent to explore columns, run queries, or build visualizations.",
};

/* ── Icons ──────────────────────────────────────────────── */

function SourceIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div className="absolute inset-[12.5%_12.5%_26.39%_26.39%]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 12.2222 12.2222">
          <path clipRule="evenodd" d={PATH_SOURCE_OUTER} fill="var(--secondary-foreground)" fillRule="evenodd" />
        </svg>
      </div>
      <div className="absolute inset-[31.94%_31.94%_12.5%_12.5%]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 11.1111 11.1111">
          <path d={PATH_SOURCE_INNER} fill="var(--secondary-foreground)" />
        </svg>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div className="absolute inset-[16.67%_8.33%]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 16.6666 13.3334">
          <path clipRule="evenodd" d={PATH_FOLDER} fill="var(--secondary-foreground)" fillRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function TableIcon() {
  return (
    <div className="relative shrink-0 size-[20px] flex items-center justify-center">
      <IconEntityTable size={20} />
    </div>
  );
}

function ViewIcon() {
  return (
    <div className="relative shrink-0 size-[20px] flex items-center justify-center">
      <IconEntityView size={20} />
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px] flex items-center justify-center">
      <svg width="10" height="6" viewBox="0 0 10.4397 5.96941" fill="none" style={{ transform: "rotate(180deg)" }}>
        <path d={PATH_CHEVRON} fill="var(--secondary-foreground)" />
      </svg>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[16px] flex items-center justify-center">
      <svg width="10" height="6" viewBox="0 0 10.4397 5.96941" fill="none" style={{ transform: "rotate(90deg)" }}>
        <path d={PATH_CHEVRON} fill="var(--secondary-foreground)" />
      </svg>
    </div>
  );
}

function NodeIcon({ type }: { type: "source" | "folder" | "table" | "view" }) {
  if (type === "table") return <TableIcon />;
  if (type === "view") return <ViewIcon />;
  if (type === "source") return <SourceIcon />;
  return <FolderIcon />;
}

/* ── Inline sample data preview ─────────────────────────── */

function SampleDataPreview({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const data = sampleDataMap[nodeId];
  if (!data) return null;

  return (
    <div className="w-full bg-card border border-border rounded-[var(--radius-button)] overflow-hidden my-[4px] mx-[8px]" style={{ maxWidth: "calc(100% - 16px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-[8px] py-[4px] bg-background border-b border-muted">
        <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-secondary-foreground text-[9px] uppercase tracking-[0.3px]">
          Sample Data · {data.rows.length} rows
        </p>
        <button type="button" className="shrink-0 size-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="var(--secondary-foreground)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted">
              {data.columns.map((col) => (
                <th key={col} className="text-left px-[6px] py-[4px] font-['Inter',sans-serif] font-semibold text-foreground text-[9px] leading-[150%] whitespace-nowrap border-r border-muted last:border-r-0">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b border-muted last:border-b-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-[6px] py-[3px] font-['Inter',sans-serif] font-normal text-foreground text-[9px] leading-[150%] whitespace-nowrap border-r border-muted last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Inline wiki preview ────────────────────────────────── */

function WikiPreview({ nodeType, nodeLabel, onClose }: { nodeType: "source" | "folder" | "table" | "view"; nodeLabel: string; onClose: () => void }) {
  return (
    <div className="w-full bg-card border border-border rounded-[var(--radius-button)] overflow-hidden my-[4px] mx-[8px]" style={{ maxWidth: "calc(100% - 16px)" }}>
      <div className="flex items-center justify-between px-[8px] py-[4px] bg-background border-b border-muted">
        <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-secondary-foreground text-[9px] uppercase tracking-[0.3px]">
          Wiki · {nodeLabel}
        </p>
        <button type="button" className="shrink-0 size-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="var(--secondary-foreground)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="px-[8px] py-[6px]">
        <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[9px]">
          {wikiSnippets[nodeType]} This wiki was auto-generated by the AI Agent based on schema analysis and usage patterns for <span className="font-semibold">{nodeLabel}</span>.
        </p>
      </div>
    </div>
  );
}

/* ── Context menu (the "..." actions) ───────────────────── */

function ItemContextMenu({
  nodeId,
  nodeType,
  nodeLabel,
  triggerRef,
  onClose,
  onAction,
}: {
  nodeId: string;
  nodeType: "source" | "folder" | "table" | "view";
  nodeLabel: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onAction: (action: string, nodeId: string, nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 2, left: rect.right });
    }
  }, [triggerRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, triggerRef]);

  const isDataset = nodeType === "table" || nodeType === "view";

  const items: { label: string; action: string }[] = [
    { label: "Add to chatbot", action: "add-to-chat" },
    ...(isDataset ? [{ label: "Dataset Profile", action: "dataset-profile" }] : []),
    ...(isDataset ? [{ label: "Show sample data", action: "sample-data" }] : []),
    ...(isDataset ? [{ label: "View lineage", action: "view-lineage" }] : []),
    { label: "Generate wiki", action: "generate-wiki" },
    { label: "Copy path", action: "copy-path" },
    ...(isDataset ? [{ label: "Query this table", action: "query-table" }] : []),
  ];

  if (!pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover overflow-clip py-[4px] rounded-[var(--radius-button)] shadow-dropdown min-w-[8rem]"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-100%)" }}
    >
      {items.map((item) => (
        <button
          key={item.action}
          type="button"
          className="h-[32px] w-full text-left flex items-center cursor-pointer select-none hover:bg-background-hover transition-colors"
          onClick={() => { onClose(); onAction(item.action, nodeId, nodeLabel, nodeType); }}
        >
          <div className="flex items-center gap-[4px] pl-[16px] pr-[8px] size-full">
            <span
              className="flex-1 whitespace-nowrap text-popover-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "20px",
              }}
            >
              {item.label}
            </span>
          </div>
        </button>
      ))}
    </div>,
    document.body,
  );
}

/* ── Three-dot trigger button ───────────────────────────── */

function MoreDots({ onClick, btnRef }: { onClick: () => void; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <button
      ref={btnRef}
      type="button"
      className="shrink-0 size-[20px] flex items-center justify-center rounded-[var(--radius-button)] hover:bg-border/50 transition-colors cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <IconMore size={16} style={{ color: "var(--secondary-foreground)" }} />
    </button>
  );
}

/* ── Tree item (normal mode) ────────────────────────────── */

function TreeItem({
  node,
  depth = 0,
  openMenuId,
  setOpenMenuId,
  onAction,
}: {
  node: TreeNode;
  depth?: number;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onAction: (action: string, nodeId: string, nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => void;
}) {
  const [expanded, setExpanded] = useState(node.id === "dremio-samples" || node.id === "production");
  const [hovered, setHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === "dremio-samples";
  const moreRef = useRef<HTMLButtonElement>(null);
  const menuOpen = openMenuId === node.id;

  return (
    <div className="w-full">
      <div
        className={`h-[32px] shrink-0 w-full cursor-pointer transition-colors ${isActive ? "bg-[#e9f5f9]" : "hover:bg-muted/50"}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <div className="flex gap-[4px] items-center pr-[8px] size-full">
          {hasChildren ? (expanded ? <ChevronDown /> : <ChevronRight />) : <div className="w-[16px] shrink-0" />}
          <NodeIcon type={node.type} />
          <p className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
            {node.label}
          </p>
          {(hovered || menuOpen) && (
            <MoreDots btnRef={moreRef} onClick={() => setOpenMenuId(menuOpen ? null : node.id)} />
          )}
        </div>
      </div>
      {menuOpen && (
        <ItemContextMenu
          nodeId={node.id}
          nodeType={node.type}
          nodeLabel={node.label}
          triggerRef={moreRef}
          onClose={() => setOpenMenuId(null)}
          onAction={onAction}
        />
      )}
      {expanded && hasChildren && (
        <div className="w-full">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tree item (save / pick-location mode) ──────────────── */

function PickableTreeItem({
  node,
  depth = 0,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(node.id === "dremio-samples" || node.id === "production");
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isFolder = node.type === "source" || node.type === "folder";

  return (
    <div className="w-full">
      <div
        className={`h-[32px] shrink-0 w-full cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
        }`}
        onClick={() => {
          if (isFolder) onSelect(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <div className="flex gap-[4px] items-center pr-[12px] size-full">
          {hasChildren ? (expanded ? <ChevronDown /> : <ChevronRight />) : <div className="w-[16px] shrink-0" />}
          <NodeIcon type={node.type} />
          <p className={`flex-1 font-['Inter',sans-serif] leading-[150%] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap ${
            isSelected ? "font-semibold text-accent" : "font-normal text-foreground"
          }`}>
            {node.label}
          </p>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="w-full">
          {node.children!.map((child) => (
            <PickableTreeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Connection item (normal mode) ──────────────────────── */

function ConnectionItem({
  node,
  openMenuId,
  setOpenMenuId,
  onAction,
}: {
  node: TreeNode;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onAction: (action: string, nodeId: string, nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const menuOpen = openMenuId === node.id;

  return (
    <div className="w-full">
      <div
        className="h-[32px] shrink-0 w-full cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex gap-[4px] items-center pl-[8px] pr-[8px] size-full">
          {expanded ? <ChevronDown /> : <ChevronRight />}
          <SourceIcon />
          <p className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
            {node.label}
          </p>
          {(hovered || menuOpen) && (
            <MoreDots btnRef={moreRef} onClick={() => setOpenMenuId(menuOpen ? null : node.id)} />
          )}
        </div>
      </div>
      {menuOpen && (
        <ItemContextMenu
          nodeId={node.id}
          nodeType={node.type}
          nodeLabel={node.label}
          triggerRef={moreRef}
          onClose={() => setOpenMenuId(null)}
          onAction={onAction}
        />
      )}
    </div>
  );
}

/* ── Pickable connection item (save mode) ───────────────── */

function PickableConnectionItem({
  node,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const isSelected = selectedId === node.id;
  return (
    <div className="w-full">
      <div
        className={`h-[32px] shrink-0 w-full cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
        }`}
        onClick={() => onSelect(node.id)}
      >
        <div className="flex gap-[4px] items-center pl-[8px] pr-[12px] size-full">
          <ChevronRight />
          <SourceIcon />
          <p className={`flex-1 font-['Inter',sans-serif] leading-[150%] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap ${
            isSelected ? "font-semibold text-accent" : "font-normal text-foreground"
          }`}>
            {node.label}
          </p>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Block type badge (for save banner) ─────────────────── */

function SaveBlockBadge({ type }: { type: BlockType }) {
  const labels: Record<BlockType, string> = { sql: "SQL", table: "TABLE", chart: "VIS", explanation: "TEXT", dataset: "DATASET", view: "VIEW", wiki: "WIKI", lineage: "LINEAGE" };
  const colors: Record<BlockType, string> = {
    sql: "text-secondary-foreground",
    table: "text-secondary-foreground",
    chart: "text-secondary-foreground",
    explanation: "text-secondary-foreground",
    dataset: "text-accent",
    view: "text-accent",
    wiki: "text-secondary-foreground",
    lineage: "text-secondary-foreground",
  };
  return (
    <div className="bg-card flex h-[20px] items-center justify-center px-[6px] py-px relative rounded-[var(--radius-button)] shrink-0">
      <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
      <p
        className={`tracking-[0.3px] uppercase whitespace-nowrap ${colors[type]}`}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9px",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "1.5",
        }}
      >
        {labels[type]}
      </p>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export function CatalogPanel({ onCollapse, saveViewMode, onSaveView, onCancelSave, catalogActions, addedSources }: CatalogPanelProps) {
  const isSaveMode = !!saveViewMode;
  const [viewName, setViewName] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shared menu state — only one "..." menu open at a time
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Toast — uses shared component from components/Toast.tsx
  const { showToast, ToastOutlet } = useToast();

  // Inline preview state
  const [samplePreviewId, setSamplePreviewId] = useState<string | null>(null);
  const [wikiPreview, setWikiPreview] = useState<{ nodeType: "source" | "folder" | "table" | "view"; nodeLabel: string } | null>(null);

  /* Reset state when entering/exiting save mode */
  useEffect(() => {
    if (saveViewMode) {
      setViewName(saveViewMode.blockTitle);
      setSelectedLocationId(null);
      setSaveSuccess(false);
      setTimeout(() => inputRef.current?.select(), 80);
    }
  }, [saveViewMode]);

  const selectedPath = selectedLocationId
    ? findNodePath([...namespaceData, ...connectionData.map((c) => ({ ...c, children: undefined }))], selectedLocationId)?.join(" / ") ?? selectedLocationId
    : null;

  const handleSave = () => {
    if (!viewName.trim() || !selectedLocationId || !onSaveView) return;
    setSaveSuccess(true);
    onSaveView(viewName.trim(), selectedPath ?? selectedLocationId);
    setTimeout(() => {
      setSaveSuccess(false);
      onCancelSave?.();
    }, 1600);
  };


  const handleAction = useCallback((action: string, nodeId: string, nodeLabel: string, nodeType: "source" | "folder" | "table" | "view") => {
    const fullPath = buildFullPath(nodeId);
    switch (action) {
      case "add-to-chat":
        if (catalogActions) {
          catalogActions.addContextChip(fullPath, "context");
          showToast(`Added "${nodeLabel}" to chat input`);
        } else {
          showToast(`Added "${nodeLabel}" context to AI Agent`);
        }
        break;
      case "query-table":
        if (catalogActions) {
          catalogActions.addContextChip(fullPath, "query");
          showToast(`Added "${nodeLabel}" to chat — ask your question`);
        } else {
          showToast(`Opening query editor for "${nodeLabel}"...`);
        }
        break;
      case "sample-data":
        if (catalogActions) {
          catalogActions.showSampleData(nodeId, nodeLabel);
          showToast(`Loading sample data for "${nodeLabel}"...`);
        } else {
          setSamplePreviewId((prev) => (prev === nodeId ? null : nodeId));
          setWikiPreview(null);
        }
        break;
      case "view-lineage":
        if (catalogActions) {
          catalogActions.previewSchema(nodeId, nodeLabel);
          showToast(`Loading lineage for "${nodeLabel}"...`);
        } else {
          showToast(`Lineage not available without chat connection`);
        }
        break;
      case "generate-wiki":
        if (catalogActions) {
          catalogActions.generateWiki(nodeLabel, nodeType);
          showToast(`Generating wiki for "${nodeLabel}"...`);
        } else {
          setSamplePreviewId(null);
          setWikiPreview({ nodeType, nodeLabel });
          showToast(`Wiki generated for "${nodeLabel}"`);
        }
        break;
      case "dataset-profile":
        if (catalogActions) {
          catalogActions.viewDatasetProfile(nodeId, nodeLabel);
          showToast(`Loading profile for "${nodeLabel}"...`);
        } else {
          showToast(`Dataset profile not available without chat connection`);
        }
        break;
      case "copy-path": {
        navigator.clipboard?.writeText(fullPath).catch(() => {});
        showToast(`Copied: ${fullPath}`);
        break;
      }
      default:
        break;
    }
  }, [showToast, catalogActions]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-[52px] shrink-0 w-full relative">
        <div aria-hidden="true" className="absolute border-muted border-b border-solid left-0 right-0 bottom-0 pointer-events-none" style={{ height: "1px" }} />
        <div className="flex gap-[8px] items-center justify-between pl-[12px] pr-[8px] size-full">
          <div className="flex gap-[8px] items-center">
            <div className="relative shrink-0 size-[20px]">
              <div className="absolute inset-[8.33%_14.58%_8.33%_16.67%]">
                <svg className="absolute block size-full" fill="none" viewBox="0 0 13.75 16.6666">
                  <path d={PATH_NOTEBOOK} fill="var(--secondary-foreground)" />
                </svg>
              </div>
            </div>
            <p
              className="text-secondary-foreground whitespace-nowrap"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-weight-semibold)",
                lineHeight: "1.5",
              }}
            >
              {isSaveMode ? "Save as View" : "Catalog"}
            </p>
          </div>
          {/* Close */}
          <button type="button" onClick={onCollapse} className="size-[24px] flex items-center justify-center rounded-[4px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Save-mode banner ─────────────────────────────── */}
      {isSaveMode && (
        <div className="shrink-0 w-full border-b border-border">
          {saveSuccess ? (
            <div className="px-[12px] py-[16px] flex flex-col gap-[8px] items-center">
              <div className="size-[32px] rounded-full bg-chart-5/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="var(--chart-5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-foreground text-[12px] text-center">
                View saved!
              </p>
              <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[9px] text-center">
                {viewName} → {selectedPath}
              </p>
            </div>
          ) : (
            <div className="px-[12px] py-[12px] flex flex-col gap-[12px]">
              <div className="flex items-center gap-[8px]">
                <SaveBlockBadge type={saveViewMode!.blockType} />
                <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[9px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  Saving output as a Dremio view
                </p>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Inter',sans-serif] font-semibold leading-[150%] text-secondary-foreground text-[9px] uppercase tracking-[0.3px]">
                  View name
                </label>
                <div className="relative h-[32px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="my_view"
                    className="w-full h-full bg-input-background border border-border rounded-[var(--radius-button)] px-[8px] font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[12px] outline-none focus:border-ring transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className="font-['Inter',sans-serif] font-semibold leading-[150%] text-secondary-foreground text-[9px] uppercase tracking-[0.3px]">
                  Location
                </label>
                <div className={`h-[32px] flex items-center px-[8px] rounded-[var(--radius-button)] border transition-colors ${
                  selectedLocationId ? "border-accent bg-primary/5" : "border-border border-dashed bg-muted/30"
                }`}>
                  {selectedLocationId ? (
                    <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-foreground text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {selectedPath}
                    </p>
                  ) : (
                    <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-muted-foreground text-[12px]">
                      Select a folder below
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  type="button"
                  disabled={!viewName.trim() || !selectedLocationId}
                  className={`flex-1 h-[32px] flex items-center justify-center rounded-[var(--radius-button)] transition-colors cursor-pointer ${
                    viewName.trim() && selectedLocationId
                      ? "bg-accent text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  onClick={handleSave}
                >
                  <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-[12px]">
                    Save View
                  </p>
                </button>
                <button
                  type="button"
                  className="h-[32px] px-[12px] flex items-center justify-center rounded-[var(--radius-button)] border border-border hover:bg-muted transition-colors cursor-pointer"
                  onClick={onCancelSave}
                >
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">
                    Cancel
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Prompt label when in save mode ───────────────── */}
      {isSaveMode && !saveSuccess && (
        <div className="shrink-0 px-[12px] py-[8px] bg-primary/5">
          <p className="font-['Inter',sans-serif] font-semibold leading-[150%] text-accent text-[9px] uppercase tracking-[0.3px]">
            Choose save location
          </p>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* My Data section — shown when sources have been added via Add Data modal */}
        {addedSources && addedSources.length > 0 && (
          <div className="w-full border-b border-border pb-[4px] mb-[4px]">
            <div className="flex gap-[6px] items-center px-[12px] py-[8px] w-full">
              <p className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">
                <span>My Data </span>
                <span>({addedSources.length})</span>
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              {addedSources.map((src, i) => (
                <div
                  key={`added-${i}`}
                  className="flex items-center gap-[6px] w-full px-[12px] py-[6px] hover:bg-muted transition-colors cursor-default"
                >
                  <div className="shrink-0 size-[14px] flex items-center justify-center">
                    {src.type === "file" ? (
                      /* File icon */
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M1 1.5C1 0.948 1.448 0.5 2 0.5H7L11 4.5V12.5C11 13.052 10.552 13.5 10 13.5H2C1.448 13.5 1 13.052 1 12.5V1.5Z" stroke="var(--accent)" strokeWidth="1" fill="none"/>
                        <path d="M7 0.5V4.5H11" stroke="var(--accent)" strokeWidth="1" strokeLinejoin="round" fill="none"/>
                      </svg>
                    ) : (
                      /* Source/connection icon */
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <rect x="0.5" y="0.5" width="11" height="11" rx="2" stroke="var(--accent)" strokeWidth="1" fill="none"/>
                        <path d="M1 4H11M4 1V11" stroke="var(--accent)" strokeWidth="1"/>
                      </svg>
                    )}
                  </div>
                  <p
                    className="flex-1 text-foreground overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "var(--font-weight-normal)", lineHeight: "1.5" }}
                  >
                    {src.name}
                  </p>
                  <span className="shrink-0 text-[10px] text-accent font-medium">New</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Namespaces section */}
        <div className="w-full">
          <div className="flex gap-[6px] items-center px-[12px] py-[8px] w-full">
            <p className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">
              <span>Namespaces </span>
              <span>(2)</span>
            </p>
            {!isSaveMode && (
              <>
                <div className="flex gap-[3px] items-center shrink-0">
                  <div className="relative shrink-0 size-[12px]">
                    <svg className="absolute block size-full" fill="none" viewBox="0 0 12 12">
                      <path d={PATH_POLARIS} fill="var(--accent)" />
                    </svg>
                  </div>
                  <p className="font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[9px]">
                    Powered by Polaris
                  </p>
                </div>
                <div className="flex items-center justify-center shrink-0 size-[24px] cursor-pointer hover:bg-muted rounded-[var(--radius-button)] transition-colors">
                  <div className="relative shrink-0 size-[20px]">
                    <div className="absolute inset-[16.67%]">
                      <svg className="absolute block size-full" fill="none" viewBox="0 0 13.3333 13.3333">
                        <path d={PATH_PLUS} fill="var(--secondary-foreground)" />
                        <path clipRule="evenodd" d={PATH_CIRCLE} fill="var(--secondary-foreground)" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Tree */}
          <div className="flex flex-col items-start w-full">
            {isSaveMode
              ? namespaceData.map((node) => (
                  <PickableTreeItem key={node.id} node={node} selectedId={selectedLocationId} onSelect={setSelectedLocationId} />
                ))
              : namespaceData.map((node) => (
                  <TreeItem key={node.id} node={node} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onAction={handleAction} />
                ))
            }
          </div>
        </div>

        {/* Inline previews (shown below namespace tree when active) */}
        {!isSaveMode && samplePreviewId && (
          <SampleDataPreview nodeId={samplePreviewId} onClose={() => setSamplePreviewId(null)} />
        )}
        {!isSaveMode && wikiPreview && (
          <WikiPreview nodeType={wikiPreview.nodeType} nodeLabel={wikiPreview.nodeLabel} onClose={() => setWikiPreview(null)} />
        )}

        {/* Connections section */}
        <div className="w-full mt-[8px]">
          <div className="flex gap-[6px] items-center px-[12px] py-[8px] w-full">
            <p className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-secondary-foreground text-[12px]">
              <span>Connections </span>
              <span>(4)</span>
            </p>
            {!isSaveMode && (
              <div className="flex items-center justify-center shrink-0 size-[24px] cursor-pointer hover:bg-muted rounded-[var(--radius-button)] transition-colors">
                <div className="relative shrink-0 size-[20px]">
                  <div className="absolute inset-[16.67%]">
                    <svg className="absolute block size-full" fill="none" viewBox="0 0 13.3333 13.3333">
                      <path d={PATH_PLUS} fill="var(--secondary-foreground)" />
                      <path clipRule="evenodd" d={PATH_CIRCLE} fill="var(--secondary-foreground)" fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start w-full">
            {isSaveMode
              ? connectionData.map((node) => (
                  <PickableConnectionItem key={node.id} node={node} selectedId={selectedLocationId} onSelect={setSelectedLocationId} />
                ))
              : connectionData.map((node) => (
                  <ConnectionItem key={node.id} node={node} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onAction={handleAction} />
                ))
            }
          </div>
        </div>
      </div>


      {/* Toast */}
      <ToastOutlet />
    </div>
  );
}