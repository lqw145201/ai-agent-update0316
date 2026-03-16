// COMPONENT — Top navigation bar
// Uses icon components from ./icons/ — do not substitute other icon libraries.
// Contains: project context dropdown (left) + global search bar (center)
// Height: 48px. Background: var(--card) white. Bottom border: 1px solid var(--muted).
//
// ⚠️ Icon components only accept size/className — NOT style.
// Wrap icons in a <span> with color so fill="currentColor" inherits correctly.

import { IconCaretDown } from "./icons/IconCaretDown";
import { IconSearch } from "./icons/IconSearch";

// TOP NAV — Project/context dropdown (left side)
interface ProjectDropdownProps {
  projectName?: string;
}

export function ProjectDropdown({ projectName = "First Lakehouse" }: ProjectDropdownProps) {
  return (
    <div
      className="flex gap-[8px] h-[32px] items-center px-[8px] relative rounded-[4px] shrink-0 w-[200px] cursor-pointer"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        aria-hidden="true"
        className="absolute border border-solid inset-0 pointer-events-none rounded-[4px]"
        style={{ borderColor: "var(--border)" }}
      />
      <p
        className="flex-1 font-['Inter',sans-serif] font-semibold leading-[150%] text-[14px]"
        style={{ color: "var(--foreground)" }}
      >
        {projectName}
      </p>
      <span style={{ display: "flex", flexShrink: 0, color: "var(--secondary-foreground, #505862)" }}>
        <IconCaretDown size={16} />
      </span>
    </div>
  );
}

// TOP NAV — Global search bar (centered)
interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Search data, scripts, recent jobs and more..." }: SearchBarProps) {
  return (
    <div
      className="flex gap-[4px] h-[32px] items-center px-[8px] rounded-[4px] w-[525px] relative cursor-text"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        aria-hidden="true"
        className="absolute border border-solid inset-0 pointer-events-none rounded-[4px]"
        style={{ borderColor: "var(--border)" }}
      />
      <span style={{ display: "flex", flexShrink: 0, color: "var(--secondary-foreground, #505862)" }}>
        <IconSearch size={16} />
      </span>
      <p
        className="flex-1 font-['Inter',sans-serif] font-normal leading-[150%] text-[14px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {placeholder}
      </p>
    </div>
  );
}

// TOP NAV — Main container
// ⚠️ Height is 48px. Background is var(--card) (white). Has bottom border: 1px solid var(--muted).
// ProjectDropdown sits left-aligned. SearchBar is absolutely centered.
export function TopNav() {
  return (
    <div
      className="flex h-[48px] items-center justify-between px-[16px] py-[8px] shrink-0 w-full relative"
      style={{
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--muted)",
      }}
    >
      <ProjectDropdown />
      <div className="absolute left-1/2 -translate-x-1/2">
        <SearchBar />
      </div>
    </div>
  );
}
