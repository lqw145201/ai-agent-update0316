// HOOK — Workspace state (active block, block history, save-as-view)
// Manages which output block is displayed and the history dropdown

import { useState, useCallback } from "react";
import type { OutputBlock, BlockType } from "./useChat";

export interface SaveViewMode {
  blockTitle: string;
  blockType: BlockType;
}

/** Manages workspace panel state: active block, history, and save-as-view */
export function useWorkspace(
  openWorkspace: () => void,
  openCatalog: () => void,
) {
  // STATE
  const [activeBlock, setActiveBlock] = useState<OutputBlock | null>({
    id: "sql-1",
    type: "sql",
    title: "Bronze Layer DDL",
    version: 1,
    preview: "CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS SELECT customer_id, first_name, last_name, email, phone, city, state, created_at, updated_at, source_system, _ingested_at FROM crm.raw_customers;",
  });

  const [blockHistory, setBlockHistory] = useState<OutputBlock[]>([
    {
      id: "table-1",
      type: "table",
      title: "Source Tables Scan",
      version: 1,
      createdAt: Date.now() - 300000,
      data: {
        rows: [
          { pickup_datetime: "crm.raw_customers", id: "2,413,088", passenger_count: "customer_id" },
          { pickup_datetime: "crm.raw_orders", id: "18,742,651", passenger_count: "order_id" },
          { pickup_datetime: "crm.raw_interactions", id: "45,219,340", passenger_count: "interaction_id" },
          { pickup_datetime: "marketing.campaigns", id: "124,502", passenger_count: "campaign_id" },
        ],
        meta: "4 sources · 3 cols",
      },
    },
    {
      id: "sql-1",
      type: "sql",
      title: "Bronze Layer DDL",
      version: 1,
      createdAt: Date.now() - 180000,
      preview: "CREATE OR REPLACE VIEW bronze.customer_360.raw_customers AS SELECT customer_id, first_name, last_name, email...",
    },
  ]);

  const [saveViewMode, setSaveViewMode] = useState<SaveViewMode | null>(null);

  // INTERACTION
  const handleBlockClick = useCallback(
    (block: OutputBlock) => {
      setActiveBlock(block);
      openWorkspace();
      setBlockHistory((prev) => {
        if (prev.find((b) => b.id === block.id)) return prev;
        return [...prev, { ...block, createdAt: block.createdAt || Date.now() }];
      });
    },
    [openWorkspace],
  );

  const handleSelectBlockFromHistory = useCallback((block: OutputBlock) => {
    setActiveBlock(block);
  }, []);

  const handleSaveAsView = useCallback(
    (block: OutputBlock) => {
      openCatalog();
      setSaveViewMode({ blockTitle: block.title, blockType: block.type });
    },
    [openCatalog],
  );

  const handleSaveView = useCallback((_viewName: string, _locationPath: string) => {
    // Mock save — in real app this would call the Dremio API
    console.log(`Saving view "${_viewName}" to ${_locationPath}`);
  }, []);

  const handleCancelSave = useCallback(() => {
    setSaveViewMode(null);
  }, []);

  const addToBlockHistory = useCallback((block: OutputBlock) => {
    setBlockHistory((prev) => {
      if (prev.find((b) => b.id === block.id)) return prev;
      return [...prev, { ...block, createdAt: block.createdAt || Date.now() }];
    });
  }, []);

  return {
    activeBlock,
    blockHistory,
    saveViewMode,
    handleBlockClick,
    handleSelectBlockFromHistory,
    handleSaveAsView,
    handleSaveView,
    handleCancelSave,
    addToBlockHistory,
  };
}
