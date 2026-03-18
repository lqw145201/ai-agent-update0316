// COMPONENT — Collapsed panel strip (left chat-list panel or right catalog panel)
// Portable version: no Figma svgPaths imports — uses icon components from ./icons/
// Renders as a narrow 48px vertical strip with icon buttons to re-expand the panel.
// Left strip: new chat + search + expand menu icons
// Right strip: catalog icon + expand menu (mirrored)

import { IconPlus } from "./icons/IconPlus";
import { IconSearch } from "./icons/IconSearch";
import { IconNavExpandMenu } from "./icons/IconNavExpandMenu";
import { IconNavCatalog } from "./icons/IconNavCatalog";

interface CollapsedPanelStripProps {
  side: "left" | "right";
  onExpand: () => void;
}

export function CollapsedPanelStrip({ side, onExpand }: CollapsedPanelStripProps) {
  if (side === "left") {
    return (
      <button
        className="bg-card cursor-pointer relative rounded-[8px] shrink-0 w-[48px] h-full"
        onClick={onExpand}
        aria-label="Expand chat list panel"
      >
        <div className="flex flex-col items-center py-[12px] gap-[6px] size-full">
          {/* Top buttons */}
          <div className="flex-1 min-h-0">
            <div className="flex flex-col gap-[8px] h-full items-center">
              {/* New chat */}
              <div className="flex items-center justify-center rounded-[4px] shrink-0 size-[32px] hover:bg-muted transition-colors">
                <IconPlus size={20} style={{ color: "var(--secondary-foreground)" }} />
              </div>
              {/* Search */}
              <div className="flex items-center justify-center rounded-[4px] shrink-0 size-[32px] hover:bg-muted transition-colors">
                <IconSearch size={20} style={{ color: "var(--secondary-foreground)" }} />
              </div>
            </div>
          </div>
          {/* Expand button at bottom */}
          <div className="rounded-[4px] shrink-0 size-[32px] flex items-center justify-center hover:bg-muted transition-colors">
            <IconNavExpandMenu size={20} style={{ color: "var(--secondary-foreground)" }} />
          </div>
        </div>
        {/* Border overlay */}
        <div
          aria-hidden="true"
          className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
          style={{ borderColor: "var(--border)" }}
        />
      </button>
    );
  }

  // Right side — Catalog collapsed strip
  return (
    <button
      className="bg-card cursor-pointer relative rounded-[8px] shrink-0 w-[48px] h-full"
      onClick={onExpand}
      aria-label="Expand catalog panel"
    >
      <div className="flex flex-col items-center py-[12px] gap-[6px] size-full">
        {/* Top button — Catalog icon */}
        <div className="flex-1 min-h-0">
          <div className="flex flex-col gap-[8px] h-full items-center">
            <div className="flex items-center justify-center rounded-[4px] shrink-0 size-[32px] hover:bg-muted transition-colors">
              <IconNavCatalog size={20} style={{ color: "var(--secondary-foreground)" }} />
            </div>
          </div>
        </div>
        {/* Expand button at bottom — mirrored horizontally */}
        <div className="rounded-[4px] shrink-0 size-[32px] flex items-center justify-center hover:bg-muted transition-colors">
          <IconNavExpandMenu
            size={20}
            style={{
              color: "var(--secondary-foreground)",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      </div>
      {/* Border overlay */}
      <div
        aria-hidden="true"
        className="absolute border border-solid inset-0 pointer-events-none rounded-[8px]"
        style={{ borderColor: "var(--border)" }}
      />
    </button>
  );
}
