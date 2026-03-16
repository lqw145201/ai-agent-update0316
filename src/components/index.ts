// Dremio AI Agent — Component Library Entry Point
// ================================================
// Import from here to get all layout components, UI primitives, and icons.
//
// Layout components (full panels):
//   import { LeftNav, TopNav, ChatPanel } from './components';
//
// UI primitives:
//   import { Button, Badge } from './components/ui';
//
// Icons:
//   import { IconSearch, IconPlus } from './components/icons';

// ── Layout components ──────────────────────────────────────────────────────
export { LeftNav } from './LeftNav';
export { TopNav } from './TopNav';
export { ChatPanel } from './ChatPanel';
export { ChatListPanel } from './ChatListPanel';
export { WorkspacePanel } from './WorkspacePanel';
export { CatalogPanel } from './CatalogPanel';
export { CollapsedPanelStrip } from './CollapsedPanelStrip';
export { ToolCallsBlock } from './ToolCallsBlock';
export { ChatInput } from './ChatInput';
export { UserMessageBubble, UserMessageText, AITypingIndicator } from './UserMessageBubble';
export { UserAvatar } from './UserAvatar';
export { Toast, useToast } from './Toast';
export type { ToastProps } from './Toast';
export { ChatAttachmentPill } from './ChatAttachmentPill';
export type { ChatAttachmentPillProps } from './ChatAttachmentPill';

// ── UI primitives ─────────────────────────────────────────────────────────
export * from './ui';

// ── Icons ─────────────────────────────────────────────────────────────────
export * from './icons';
