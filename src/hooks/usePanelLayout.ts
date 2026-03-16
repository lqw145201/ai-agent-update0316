// HOOK — Panel layout state (open/close for chat list, catalog, workspace)
// Controls which of the 4 main panels are expanded or collapsed

import { useState, useCallback } from "react";

/** Manages the open/close state of the three collapsible panels */
export function usePanelLayout() {
  // STATE
  const [chatListOpen, setChatListOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // INTERACTION
  const toggleChatList = useCallback(() => setChatListOpen((v) => !v), []);
  const toggleCatalog = useCallback(() => setCatalogOpen((v) => !v), []);
  const toggleWorkspace = useCallback(() => setWorkspaceOpen((v) => !v), []);

  const openChatList = useCallback(() => setChatListOpen(true), []);
  const closeChatList = useCallback(() => setChatListOpen(false), []);
  const openCatalog = useCallback(() => setCatalogOpen(true), []);
  const closeCatalog = useCallback(() => setCatalogOpen(false), []);
  const openWorkspace = useCallback(() => setWorkspaceOpen(true), []);
  const closeWorkspace = useCallback(() => setWorkspaceOpen(false), []);

  return {
    chatListOpen,
    catalogOpen,
    workspaceOpen,
    toggleChatList,
    toggleCatalog,
    toggleWorkspace,
    openChatList,
    closeChatList,
    openCatalog,
    closeCatalog,
    openWorkspace,
    closeWorkspace,
  };
}
