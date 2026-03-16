// PAGE — AI Agent main layout
// Assembles LeftNav, TopNav, and the 4-panel content area
// No inline UI logic — all state is delegated to hooks

import { useState, useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// LAYOUT — Panel components
import { LeftNav } from "./components/LeftNav";
import { TopNav } from "./components/TopNav";
import { ChatListPanel } from "./components/ChatListPanel";
import { ChatPanel } from "./components/ChatPanel";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { CatalogPanel } from "./components/CatalogPanel";
import { CollapsedPanelStrip } from "./components/CollapsedPanelStrip";

// STATE — Custom hooks
import { usePanelLayout } from "./hooks/usePanelLayout";
import { useWorkspace } from "./hooks/useWorkspace";

// COPY
import { COLLAPSED_PANELS, WORKSPACE, CHAT_LIST_ITEMS } from "./constants/strings";

// STATE — Type imports
import type { OutputBlock, CatalogActions } from "./hooks/useChat";

/** Main AI Agent page — orchestrates the 4-panel layout */
export function AIAgentPage() {
  // STATE — Panel visibility
  const {
    chatListOpen,
    catalogOpen,
    workspaceOpen,
    openChatList,
    closeChatList,
    openCatalog,
    closeCatalog,
    openWorkspace,
    closeWorkspace,
  } = usePanelLayout();

  // STATE — Workspace
  const {
    activeBlock,
    blockHistory,
    handleBlockClick,
    handleSelectBlockFromHistory,
    addToBlockHistory,
  } = useWorkspace(openWorkspace, openCatalog);

  // STATE — Bronze layer completion (drives plan step update)
  const [bronzeComplete, setBronzeComplete] = useState(false);

  // STATE — Whether user has started chatting (false = landing page)
  const [hasStarted, setHasStarted] = useState(false);

  // INTERACTION — First message sent from landing page
  const handleFirstMessage = useCallback(() => {
    setHasStarted(true);
  }, []);

  // STATE — Chat selection
  const [selectedChat, setSelectedChat] = useState(0);

  // STATE — Dynamic chat title (null means "AI Agent" default)
  const [chatTitle, setChatTitle] = useState<string | null>(
    CHAT_LIST_ITEMS[0]?.title ?? null,
  );

  // INTERACTION — Handle chat title change from ChatListPanel
  const handleChatTitleChange = useCallback((title: string | null) => {
    setChatTitle(title);
  }, []);

  // STATE — Hover tracking
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // STATE — Cross-panel action bridge (registered by ChatPanel)
  const [chatActions, setChatActions] = useState<{
    runQuery: () => void;
    explainQuery: () => void;
    catalogActions: CatalogActions;
    wikiSave: (id: string) => void;
    wikiDismiss: (id: string) => void;
    startSaveAsViewFlow: (block: OutputBlock) => void;
  } | null>(null);

  // INTERACTION — Register actions from ChatPanel
  const handleRegisterActions = useCallback(
    (actions: {
      runQuery: () => void;
      explainQuery: () => void;
      catalogActions: CatalogActions;
      wikiSave: (id: string) => void;
      wikiDismiss: (id: string) => void;
      startSaveAsViewFlow: (block: OutputBlock) => void;
    }) => {
      setChatActions(actions);
    },
    [],
  );

  // INTERACTION — Save as View: inject into chat instead of opening catalog panel
  const handleSaveAsView = useCallback(
    (block: OutputBlock) => {
      chatActions?.startSaveAsViewFlow(block);
    },
    [chatActions],
  );

  // INTERACTION — Block hover
  const handleBlockHover = useCallback((blockId: string | null) => {
    setHoveredBlock(blockId);
  }, []);

  // INTERACTION — Blocks created by approval execution → push to Outputs
  const handleBlocksCreated = useCallback((blocks: OutputBlock[]) => {
    blocks.forEach((block) => addToBlockHistory(block));
    if (blocks.some((b) => b.title.startsWith("bronze.customer_360."))) {
      setBronzeComplete(true);
    }
  }, [addToBlockHistory]);

  return (
    // LAYOUT
    <div className="flex h-screen w-screen overflow-hidden bg-muted">
      {/* Left Navigation */}
      <LeftNav />

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Navigation */}
        <TopNav />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-[8px] pt-[8px] flex gap-[6px]">
          {/* Collapsed Chat List Strip */}
          {!chatListOpen && (
            <CollapsedPanelStrip side="left" onExpand={openChatList} />
          )}

          <PanelGroup direction="horizontal" className="h-full flex-1" id="main-layout">
            {/* Chat List Panel */}
            {chatListOpen && (
              <>
                <Panel id="chat-list" defaultSize={18} minSize={12} maxSize={30} className="h-full">
                  <div className="bg-background h-full rounded-[var(--radius-card)] border border-border overflow-hidden">
                    <ChatListPanel
                      selectedChat={selectedChat}
                      onSelectChat={setSelectedChat}
                      onCollapse={closeChatList}
                      onChatTitleChange={handleChatTitleChange}
                    />
                  </div>
                </Panel>
                <PanelResizeHandle className="w-[6px] flex items-center justify-center group cursor-col-resize">
                  <div className="w-[2px] h-[32px] rounded-full bg-border group-hover:bg-primary transition-colors" />
                </PanelResizeHandle>
              </>
            )}

            {/* Middle Section: Chat + Workspace */}
            <Panel
              id="middle"
             
              defaultSize={100 - (chatListOpen ? 18 : 0) - (catalogOpen ? 22 : 0)}
              minSize={30}
            >
              <div className="bg-card h-full rounded-[var(--radius-card)] border border-border overflow-hidden">
                <PanelGroup direction="horizontal" id="middle-inner">
                  {/* Chat Panel */}
                  <Panel id="chat" defaultSize={workspaceOpen ? 40 : 100} minSize={25}>
                    <ChatPanel
                      onBlockClick={handleBlockClick}
                      onBlockHover={handleBlockHover}
                      hoveredBlock={hoveredBlock}
                      onSaveAsView={handleSaveAsView}
                      onRegisterActions={handleRegisterActions}
                      chatTitle={chatTitle}
                      onBlocksCreated={handleBlocksCreated}
                      isLanding={!hasStarted}
                      onFirstMessage={handleFirstMessage}
                      onToggleCatalog={catalogOpen ? closeCatalog : openCatalog}
                      catalogOpen={catalogOpen}
                      onToggleWorkspace={workspaceOpen ? closeWorkspace : openWorkspace}
                      workspaceOpen={workspaceOpen}
                    />

                  </Panel>

                  {/* Workspace Panel */}
                  {workspaceOpen && (
                    <>
                      <PanelResizeHandle className="relative w-0 cursor-col-resize group z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[8px] h-full flex items-center justify-center">
                          <div className="w-[2px] h-[32px] rounded-full bg-border group-hover:bg-primary transition-colors" />
                        </div>
                      </PanelResizeHandle>
                      <Panel id="workspace" defaultSize={60} minSize={30}>
                        <WorkspacePanel
                          activeBlock={activeBlock}
                          blockHistory={blockHistory}
                          onClose={closeWorkspace}
                          onSelectBlock={handleSelectBlockFromHistory}
                          onSaveAsView={handleSaveAsView}
                          chatActions={chatActions}
                          bronzeComplete={bronzeComplete}
                        />

                      </Panel>
                    </>
                  )}
                </PanelGroup>
              </div>
            </Panel>

            {/* Catalog Panel */}
            {catalogOpen && (
              <>
                <PanelResizeHandle className="w-[6px] flex items-center justify-center group cursor-col-resize">
                  <div className="w-[2px] h-[32px] rounded-full bg-border group-hover:bg-primary transition-colors" />
                </PanelResizeHandle>
                <Panel id="catalog" defaultSize={22} minSize={14} maxSize={35} className="h-full">
                  <div className="bg-background h-full rounded-[var(--radius-card)] border border-border overflow-hidden">
                    <CatalogPanel
                      onCollapse={closeCatalog}
                      saveViewMode={null}
                      onSaveView={() => {}}
                      onCancelSave={() => {}}
                      catalogActions={chatActions?.catalogActions ?? null}
                    />
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>

        </div>

      </div>
    </div>
  );
}