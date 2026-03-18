// COMPONENT — Chat list panel with recent chats, hover "more" menu, rename/delete dialogs
// Portable version: no Figma svgPaths imports — uses icon components from ./icons/
// Follows design system: bg-popover, shadow-dropdown, rounded-[var(--radius-button)], hover:bg-background-hover

import { useState, useRef, useEffect, useCallback } from "react";
import { IconMore } from "./icons/IconMore";
import { DropdownMenu } from "./DropdownMenu";
import { IconClose } from "./icons/IconClose";
import { IconWarning } from "./icons/IconWarning";
import { IconPlus } from "./icons/IconPlus";
import { IconSearch } from "./icons/IconSearch";

// COPY
import { CHAT_LIST, CHAT_LIST_ITEMS } from "../constants/strings";

// Inline path data for collapse panel icon (viewBox: 0 0 16.6667 13.3333)
// Source: svg-javaskxvh1.ts → p3fca0170
const PATH_COLLAPSE_PANEL = "M10.6733 4.37417C10.6184 4.31305 10.552 4.26335 10.4779 4.22792C10.4038 4.19249 10.3234 4.17202 10.2413 4.16769C10.1593 4.16336 10.0772 4.17524 9.99976 4.20266C9.92231 4.23008 9.85104 4.2725 9.79 4.3275L7.70667 6.2025C7.64167 6.2611 7.58971 6.3327 7.55415 6.41266C7.51858 6.49262 7.5002 6.57915 7.5002 6.66667C7.5002 6.75418 7.51858 6.84071 7.55415 6.92067C7.58971 7.00063 7.64167 7.07223 7.70667 7.13083L9.79 9.00583C9.91322 9.11678 10.0755 9.17424 10.241 9.16557C10.4066 9.15689 10.562 9.0828 10.6729 8.95958C10.7839 8.83637 10.8413 8.67413 10.8326 8.50855C10.824 8.34297 10.7499 8.18762 10.6267 8.07667L9.75333 7.29167H12.7083C12.7904 7.29167 12.8717 7.2755 12.9475 7.24409C13.0233 7.21268 13.0922 7.16664 13.1503 7.10861C13.2083 7.05057 13.2543 6.98167 13.2858 6.90584C13.3172 6.83002 13.3333 6.74874 13.3333 6.66667C13.3333 6.58459 13.3172 6.50332 13.2858 6.42749C13.2543 6.35166 13.2083 6.28276 13.1503 6.22473C13.0922 6.16669 13.0233 6.12065 12.9475 6.08924C12.8717 6.05783 12.7904 6.04167 12.7083 6.04167H9.75333L10.6267 5.25667C10.7497 5.1457 10.8237 4.9904 10.8323 4.82491C10.8409 4.65942 10.7842 4.49729 10.6733 4.37417ZM0 11.0425C0.000220961 11.6501 0.241761 12.2328 0.671508 12.6624C1.10125 13.092 1.68402 13.3333 2.29167 13.3333H14.375C14.6759 13.3333 14.9739 13.2741 15.252 13.1589C15.53 13.0437 15.7827 12.8749 15.9955 12.6621C16.2083 12.4493 16.3771 12.1967 16.4922 11.9186C16.6074 11.6406 16.6667 11.3426 16.6667 11.0417V2.29167C16.6667 1.68388 16.4252 1.10098 15.9955 0.671213C15.5657 0.241443 14.9828 0 14.375 0H2.29167C1.68388 0 1.10098 0.241443 0.671214 0.671213C0.241443 1.10098 0 1.68388 0 2.29167V11.0425ZM2.29167 12.0842C1.71667 12.0842 1.25 11.6175 1.25 11.0425V2.29083C1.25 1.71583 1.71667 1.24917 2.29167 1.24917H5.00333V12.0833L2.29167 12.0842ZM6.25333 12.0842V1.25H14.375C14.95 1.25 15.4167 1.71667 15.4167 2.29167V11.0417C15.4167 11.6167 14.95 12.0833 14.375 12.0833L6.25333 12.0842Z";

// STATE — Chat item type (mutable for rename)
interface ChatItem {
  id: number;
  title: string;
}

interface ChatListPanelProps {
  selectedChat: number;
  onSelectChat: (id: number) => void;
  onCollapse: () => void;
  onChatTitleChange?: (title: string | null) => void;
}


/* ── Rename dialog ────────────────────────────────────────────── */

// LAYOUT — Rename chat dialog matching Figma ExampleFormNo spec
function RenameDialog({
  chatName,
  onSave,
  onCancel,
}: {
  chatName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}) {
  // STATE
  const [value, setValue] = useState(chatName);
  const inputRef = useRef<HTMLInputElement>(null);

  // INTERACTION — Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20">
      <div
        className="flex flex-col items-start w-[400px] bg-card rounded-[var(--radius-button)] overflow-hidden"
        style={{ boxShadow: "var(--elevation-dropdown)" }}
      >
        {/* LAYOUT — Header */}
        <div className="relative shrink-0 w-full rounded-t-[var(--radius-button)]">
          <div className="flex flex-col items-start overflow-clip rounded-[inherit] w-full">
            <div className="h-[56px] relative rounded-t-[var(--radius-button)] shrink-0 w-full">
              <div className="flex flex-row items-center size-full">
                <div className="flex gap-[16px] items-center px-[16px] size-full">
                  {/* Title */}
                  <div className="flex-1 flex gap-[8px] items-center min-w-0">
                    <p
                      className="text-foreground flex-1"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-lg)",
                        fontWeight: "var(--font-weight-semibold)",
                        lineHeight: "1.5",
                      }}
                    >
                      {CHAT_LIST.renameTitle}
                    </p>
                  </div>
                  {/* Close button */}
                  <button
                    type="button"
                    className="shrink-0 size-[24px] flex items-center justify-center cursor-pointer rounded-[var(--radius-button)] hover:bg-muted transition-colors"
                    onClick={onCancel}
                  >
                    <IconClose size={12} style={{ color: "var(--secondary-foreground)" }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-muted border-b border-solid inset-0 pointer-events-none rounded-t-[var(--radius-button)]" />
        </div>

        {/* LAYOUT — Body: form field */}
        <div className="shrink-0 w-full bg-card">
          <div className="flex flex-col gap-[24px] items-start p-[16px] w-full">
            <div className="flex flex-col gap-[4px] items-start w-full">
              {/* Field label */}
              <div className="flex gap-[8px] items-center w-full">
                <p
                  className="text-foreground"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "1.5",
                  }}
                >
                  {CHAT_LIST.chatNameLabel}
                </p>
              </div>
              {/* Input */}
              <div className="bg-input relative rounded-[var(--radius-button)] shrink-0 w-full h-[32px]">
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full h-full px-[8px] bg-transparent outline-none text-foreground"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-normal)",
                    lineHeight: "1.5",
                  }}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSave(value); if (e.key === "Escape") onCancel(); }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LAYOUT — Footer: Cancel + Save buttons */}
        <div className="bg-card h-[55px] relative rounded-b-[var(--radius-button)] shrink-0 w-full">
          <div className="flex flex-col items-end justify-end overflow-clip rounded-[inherit] size-full">
            <div className="flex gap-[8px] h-[55px] items-center justify-end px-[16px] shrink-0">
              {/* Cancel */}
              <button
                type="button"
                className="bg-card relative h-[32px] w-[100px] rounded-[var(--radius-button)] cursor-pointer hover:bg-muted transition-colors"
                onClick={onCancel}
              >
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                <div className="flex items-center justify-center size-full">
                  <p
                    className="text-secondary-foreground whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: 500,
                      lineHeight: "1.5",
                    }}
                  >
                    {CHAT_LIST.cancel}
                  </p>
                </div>
              </button>
              {/* Save */}
              <button
                type="button"
                className="bg-primary h-[32px] w-[100px] rounded-[var(--radius-button)] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onSave(value)}
              >
                <div className="flex items-center justify-center size-full">
                  <p
                    className="text-primary-foreground whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: 500,
                      lineHeight: "1.5",
                    }}
                  >
                    {CHAT_LIST.save}
                  </p>
                </div>
              </button>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-muted border-solid border-t inset-0 pointer-events-none rounded-b-[var(--radius-button)]" />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Delete confirmation dialog ───────────────────────────────── */

// LAYOUT — Delete chat dialog matching Figma ExampleDialog spec
function DeleteDialog({
  chatName,
  onConfirm,
  onCancel,
}: {
  chatName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20">
      <div
        className="flex flex-col items-start w-[400px] bg-card rounded-[var(--radius-button)] overflow-hidden"
        style={{ boxShadow: "var(--elevation-dropdown)" }}
      >
        {/* LAYOUT — Header with warning icon */}
        <div className="relative shrink-0 w-full rounded-t-[var(--radius-button)]">
          <div className="bg-card h-[55px] relative rounded-t-[var(--radius-button)] shrink-0 w-full">
            <div className="flex flex-row items-center size-full">
              <div className="flex gap-[8px] items-center px-[16px] py-[10px] size-full">
                {/* Warning icon */}
                <div className="shrink-0 size-[24px] flex items-center justify-center">
                  <IconWarning size={20} style={{ color: "var(--secondary-foreground)" }} />
                </div>
                {/* Title */}
                <p
                  className="flex-1 text-foreground"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    lineHeight: "1.5",
                  }}
                >
                  {CHAT_LIST.deleteTitle}
                </p>
                {/* Close button */}
                <button
                  type="button"
                  className="shrink-0 size-[24px] flex items-center justify-center cursor-pointer rounded-[var(--radius-button)] hover:bg-muted transition-colors"
                  onClick={onCancel}
                >
                  <IconClose size={12} style={{ color: "var(--secondary-foreground)" }} />
                </button>
              </div>
            </div>
          </div>
          {/* Hairline */}
          <div className="h-px w-full bg-muted absolute bottom-0 left-0" />
        </div>

        {/* LAYOUT — Body: confirmation text */}
        <div className="bg-card shrink-0 w-full">
          <div className="flex flex-col items-start p-[16px] w-full">
            <p
              className="text-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete{" "}
              <span
                style={{ fontWeight: "var(--font-weight-semibold)" } as React.CSSProperties}
              >
                {chatName}
              </span>
              ?
            </p>
          </div>
        </div>

        {/* LAYOUT — Footer: Cancel + Delete buttons */}
        <div className="bg-card h-[56px] relative rounded-b-[var(--radius-button)] shrink-0 w-full">
          <div className="flex flex-col items-end justify-end overflow-clip rounded-[inherit] size-full">
            <div className="flex gap-[8px] h-[55px] items-center justify-end px-[16px] shrink-0">
              {/* Cancel */}
              <button
                type="button"
                className="bg-card relative h-[32px] w-[100px] rounded-[var(--radius-button)] cursor-pointer hover:bg-muted transition-colors"
                onClick={onCancel}
              >
                <div aria-hidden="true" className="absolute border border-border border-solid inset-0 pointer-events-none rounded-[var(--radius-button)]" />
                <div className="flex items-center justify-center size-full">
                  <p
                    className="text-secondary-foreground whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: 500,
                      lineHeight: "1.5",
                    }}
                  >
                    {CHAT_LIST.cancel}
                  </p>
                </div>
              </button>
              {/* Delete */}
              <button
                type="button"
                className="bg-destructive h-[32px] w-[100px] rounded-[var(--radius-button)] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={onConfirm}
              >
                <div className="flex items-center justify-center size-full">
                  <p
                    className="text-destructive-foreground whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: 500,
                      lineHeight: "1.5",
                    }}
                  >
                    {CHAT_LIST.delete}
                  </p>
                </div>
              </button>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-muted border-solid border-t inset-0 pointer-events-none rounded-b-[var(--radius-button)]" />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Single chat row ──────────────────────────────────────────── */

// LAYOUT — Chat list item with hover "more" button
function ChatItemRow({
  chat,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  chat: ChatItem;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  // STATE
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // INTERACTION — Open context menu
  const handleMore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreRef.current) {
      setAnchorRect(moreRef.current.getBoundingClientRect());
    }
    setMenuOpen(true);
  }, []);

  return (
    <div
      className={`group relative rounded-[var(--radius-button)] shrink-0 w-full cursor-pointer transition-colors ${
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center px-[12px] py-[8px] w-full">
        <p
          className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-foreground min-w-0`}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-base)",
            fontWeight: isSelected ? 500 : "var(--font-weight-normal)",
            lineHeight: "1.5",
          }}
        >
          {chat.title}
        </p>

        {/* INTERACTION — More button (visible on hover or when menu is open) */}
        <button
          ref={moreRef}
          type="button"
          className={`shrink-0 size-[24px] flex items-center justify-center rounded-[var(--radius-button)] cursor-pointer hover:bg-muted transition-all ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleMore}
        >
          <IconMore size={16} style={{ color: "var(--secondary-foreground)" }} />
        </button>
      </div>

      {/* LAYOUT — Context menu dropdown */}
      {menuOpen && anchorRect && (
        <DropdownMenu
          anchorRect={anchorRect}
          onClose={() => setMenuOpen(false)}
          items={[
            { label: CHAT_LIST.rename, onClick: () => onRename(chat.id) },
            { label: CHAT_LIST.delete, onClick: () => onDelete(chat.id), variant: "destructive" },
          ]}
        />
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */

export function ChatListPanel({ selectedChat, onSelectChat, onCollapse, onChatTitleChange }: ChatListPanelProps) {
  // STATE — Local mutable chat list for rename/delete
  const [chats, setChats] = useState<ChatItem[]>(
    CHAT_LIST_ITEMS.map((c) => ({ id: c.id, title: c.title })),
  );

  // STATE — Dialog management
  const [renameTarget, setRenameTarget] = useState<ChatItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChatItem | null>(null);

  // INTERACTION — Rename
  const handleRenameRequest = useCallback(
    (id: number) => {
      const chat = chats.find((c) => c.id === id);
      if (chat) setRenameTarget(chat);
    },
    [chats],
  );

  const handleRenameSave = useCallback(
    (newName: string) => {
      if (renameTarget && newName.trim()) {
        setChats((prev) =>
          prev.map((c) => (c.id === renameTarget.id ? { ...c, title: newName.trim() } : c)),
        );
        // INTERACTION — Notify parent if renamed chat is the currently selected one
        if (renameTarget.id === selectedChat && onChatTitleChange) {
          onChatTitleChange(newName.trim());
        }
      }
      setRenameTarget(null);
    },
    [renameTarget, onChatTitleChange, selectedChat],
  );

  // INTERACTION — Delete
  const handleDeleteRequest = useCallback(
    (id: number) => {
      const chat = chats.find((c) => c.id === id);
      if (chat) setDeleteTarget(chat);
    },
    [chats],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      setChats((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }, [deleteTarget]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-[8px] items-start px-[16px] py-[12px] flex-1 overflow-hidden">
        {/* LAYOUT — New chat button */}
        <div
          className={`h-[32px] shrink-0 w-full rounded-[var(--radius-card)] cursor-pointer hover:bg-muted transition-colors ${selectedChat === -1 ? "bg-muted" : ""}`}
          onClick={() => { onSelectChat(-1); onChatTitleChange?.(null); }}
        >
          <div className="flex items-center size-full px-[6px] gap-[8px]">
            <div className="flex items-center justify-center shrink-0 size-[20px]">
              <IconPlus size={16} style={{ color: "var(--secondary-foreground)" }} />
            </div>
            <p
              className="text-secondary-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: 500,
                lineHeight: "1.5",
              }}
            >
              {CHAT_LIST.newChat}
            </p>
          </div>
        </div>

        {/* LAYOUT — Search chats button */}
        <div className="h-[32px] shrink-0 w-full rounded-[var(--radius-card)] cursor-pointer hover:bg-muted transition-colors">
          <div className="flex items-center size-full px-[6px] gap-[8px]">
            <div className="flex items-center justify-center shrink-0 size-[20px]">
              <IconSearch size={16} style={{ color: "var(--secondary-foreground)" }} />
            </div>
            <p
              className="text-secondary-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-base)",
                fontWeight: 500,
                lineHeight: "1.5",
              }}
            >
              {CHAT_LIST.searchChats}
            </p>
          </div>
        </div>

        {/* LAYOUT — Divider */}
        <div className="w-full shrink-0">
          <div className="bg-muted h-px w-full" />
        </div>

        {/* COPY — Recent chats label */}
        <p
          className="text-secondary-foreground w-full shrink-0"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "1.5",
          }}
        >
          {CHAT_LIST.recentChats}
        </p>

        {/* LAYOUT — Chat list */}
        <div className="flex flex-col gap-[4px] items-start flex-1 overflow-y-auto w-full">
          {chats.map((chat) => (
            <ChatItemRow
              key={chat.id}
              chat={chat}
              isSelected={selectedChat === chat.id}
              onSelect={() => { onSelectChat(chat.id); onChatTitleChange?.(chat.title); }}
              onRename={handleRenameRequest}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      </div>

      {/* LAYOUT — Collapse button */}
      <div className="shrink-0 w-full border-t border-muted">
        <div
          className="h-[40px] w-full cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onCollapse}
        >
          <div className="flex items-center gap-[8px] px-[12px] size-full">
            {/* Collapse panel icon — non-standard viewBox 16.6667×13.3333, inline path */}
            <div className="relative shrink-0 size-[20px]">
              <div className="absolute inset-[16.67%_8.33%]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 13.3333">
                  <path d={PATH_COLLAPSE_PANEL} fill="var(--secondary-foreground)" />
                </svg>
              </div>
            </div>
            <p
              className="text-secondary-foreground whitespace-nowrap"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-normal)",
                lineHeight: "1.5",
              }}
            >
              {CHAT_LIST.collapse}
            </p>
          </div>
        </div>
      </div>

      {/* LAYOUT — Dialogs */}
      {renameTarget && (
        <RenameDialog
          chatName={renameTarget.title}
          onSave={handleRenameSave}
          onCancel={() => setRenameTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          chatName={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
