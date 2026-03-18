// COMPONENT — Chat input with gradient border (Figma Form2 design)
// Portable version: no Figma svgPaths imports — uses IconSend from ./icons/IconSend
// Features: context chips, auto-resizing textarea, gradient send button, add-data dropdown

import { useState, useRef } from "react";
import type { ContextChip } from "../hooks/useChat";
import { IconSend } from "./icons/IconSend";
import { DropdownMenu } from "./DropdownMenu";

// Upload to Cloud — exact paths from Figma node 384:5845 (Dremio Design System)
const IconUploadFile = () => (
  <svg width="16" height="16" viewBox="0 0 20 18.9941" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.087 4.74406C4.32369 3.41424 5.02082 2.21013 6.05623 1.34274C7.09164 0.475346 8.39928 0 9.75 0C11.1007 0 12.4084 0.475346 13.4438 1.34274C14.4792 2.21013 15.1763 3.41424 15.413 4.74406H15.5C16.0719 4.74403 16.6373 4.86664 17.1578 5.10364C17.6783 5.34065 18.142 5.68652 18.5175 6.11794C18.893 6.54936 19.1716 7.05629 19.3345 7.60453C19.4975 8.15278 19.5409 8.72959 19.462 9.29606C19.0067 8.75826 18.4674 8.29764 17.865 7.93206C17.6957 7.43945 17.3768 7.01201 16.9528 6.70939C16.5288 6.40678 16.0209 6.2441 15.5 6.24406H14.744C14.5513 6.2443 14.366 6.17038 14.2263 6.03763C14.0867 5.90489 14.0035 5.72349 13.994 5.53106C13.9386 4.44272 13.4672 3.41726 12.6773 2.66654C11.8874 1.91582 10.8393 1.49721 9.7495 1.49721C8.65975 1.49721 7.61164 1.91582 6.82171 2.66654C6.03179 3.41726 5.56042 4.44272 5.505 5.53106C5.4955 5.72332 5.41245 5.90457 5.27303 6.03729C5.13361 6.17001 4.94849 6.24404 4.756 6.24406H4C3.33696 6.24406 2.70107 6.50746 2.23223 6.9763C1.76339 7.44514 1.5 8.08102 1.5 8.74406C1.5 9.40711 1.76339 10.043 2.23223 10.5118C2.70107 10.9807 3.33696 11.2441 4 11.2441H8.4C8.22152 11.728 8.10167 12.2316 8.043 12.7441H4C2.93913 12.7441 1.92172 12.3226 1.17157 11.5725C0.421427 10.8223 0 9.80493 0 8.74406C0 7.6832 0.421427 6.66578 1.17157 5.91564C1.92172 5.16549 2.93913 4.74406 4 4.74406H4.087ZM20 13.4941C20 14.9528 19.4205 16.3517 18.3891 17.3832C17.3576 18.4146 15.9587 18.9941 14.5 18.9941C13.0413 18.9941 11.6424 18.4146 10.6109 17.3832C9.57946 16.3517 9 14.9528 9 13.4941C9 12.0354 9.57946 10.6364 10.6109 9.60498C11.6424 8.57353 13.0413 7.99406 14.5 7.99406C15.9587 7.99406 17.3576 8.57353 18.3891 9.60498C19.4205 10.6364 20 12.0354 20 13.4941ZM14 11.7011V16.4941C14 16.6267 14.0527 16.7538 14.1464 16.8476C14.2402 16.9414 14.3674 16.9941 14.5 16.9941C14.6326 16.9941 14.7598 16.9414 14.8536 16.8476C14.9473 16.7538 15 16.6267 15 16.4941V11.7011L16.646 13.3481C16.7399 13.442 16.8672 13.4947 17 13.4947C17.1328 13.4947 17.2601 13.442 17.354 13.3481C17.4479 13.2542 17.5006 13.1268 17.5006 12.9941C17.5006 12.8613 17.4479 12.734 17.354 12.6401L14.854 10.1401C14.8076 10.0935 14.7524 10.0566 14.6916 10.0314C14.6309 10.0061 14.5658 9.99317 14.5 9.99317C14.4342 9.99317 14.3691 10.0061 14.3084 10.0314C14.2476 10.0566 14.1924 10.0935 14.146 10.1401L11.646 12.6401C11.5521 12.734 11.4994 12.8613 11.4994 12.9941C11.4994 13.1268 11.5521 13.2542 11.646 13.3481C11.7399 13.442 11.8672 13.4947 12 13.4947C12.1328 13.4947 12.2601 13.442 12.354 13.3481L14 11.7011Z"/>
  </svg>
);

// Connect — exact paths from Figma node 2096:20817 (Dremio Design System)
const IconConnectSource = () => (
  <svg width="16" height="16" viewBox="0 0 20.0189 20.0189" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.4992 3.57922C18.0341 4.26777 18.4125 5.06465 18.608 5.91435C18.8035 6.76406 18.8114 7.64617 18.6312 8.49925C18.451 9.35233 18.087 10.1559 17.5646 10.8539C17.0422 11.552 16.3739 12.1278 15.6062 12.5412C14.9572 12.8922 14.1762 12.6762 13.6542 12.1552L7.86422 6.36422C7.34222 5.84222 7.12622 5.06122 7.47622 4.41222C7.88962 3.6444 8.46545 2.97595 9.16359 2.45341C9.86173 1.93088 10.6654 1.56684 11.5186 1.38664C12.3718 1.20644 13.2541 1.21442 14.1039 1.41002C14.9537 1.60562 15.7506 1.98414 16.4392 2.51922L18.7292 0.229217C18.7984 0.157553 18.8811 0.100378 18.9726 0.0610283C19.0641 0.0216791 19.1625 0.000943444 19.2621 3.14517e-05C19.3616 -0.00088054 19.4604 0.0180494 19.5526 0.0557166C19.6448 0.0933838 19.7286 0.149034 19.799 0.21942C19.8695 0.289806 19.9252 0.373518 19.9629 0.465672C20.0007 0.557826 20.0197 0.656577 20.0189 0.756161C20.0181 0.855746 19.9974 0.95417 19.9582 1.04569C19.9189 1.13721 19.8618 1.22 19.7902 1.28922L17.5002 3.57922H17.4992ZM15.4822 10.8422C15.9933 10.4534 16.4152 9.95979 16.7197 9.39442C17.0242 8.82906 17.2041 8.20508 17.2474 7.56441C17.2908 6.92374 17.1965 6.28122 16.9709 5.68001C16.7454 5.07879 16.3937 4.53282 15.9397 4.07876C15.4856 3.6247 14.9396 3.27308 14.3384 3.04752C13.7372 2.82195 13.0947 2.72767 12.454 2.771C11.8134 2.81433 11.1894 2.99428 10.624 3.29875C10.0587 3.60321 9.565 4.02515 9.17622 4.53622C8.91022 4.88522 8.99022 5.36922 9.30122 5.67922L14.3382 10.7172C14.6482 11.0272 15.1332 11.1082 15.4822 10.8422ZM1.28922 19.7892L3.57922 17.4992C4.26777 18.0341 5.06465 18.4125 5.91435 18.608C6.76406 18.8035 7.64617 18.8114 8.49925 18.6312C9.35233 18.451 10.1559 18.087 10.8539 17.5646C11.552 17.0422 12.1278 16.3739 12.5412 15.6062C12.8922 14.9572 12.6762 14.1762 12.1542 13.6542L6.36422 7.86422C5.84222 7.34222 5.06122 7.12622 4.41222 7.47622C3.6444 7.88962 2.97595 8.46545 2.45341 9.16359C1.93088 9.86173 1.56684 10.6654 1.38664 11.5186C1.20644 12.3718 1.21442 13.2541 1.41002 14.1039C1.60562 14.9537 1.98414 15.7506 2.51922 16.4392L0.229217 18.7292C0.157553 18.7984 0.100378 18.8811 0.0610283 18.9726C0.0216791 19.0641 0.000943444 19.1625 3.14517e-05 19.2621C-0.00088054 19.3616 0.0180494 19.4604 0.0557166 19.5526C0.0933838 19.6448 0.149034 19.7286 0.21942 19.799C0.289806 19.8695 0.373518 19.9252 0.465672 19.9629C0.557826 20.0007 0.656577 20.0197 0.756161 20.0189C0.855746 20.0181 0.95417 19.9974 1.04569 19.9582C1.13721 19.9189 1.22 19.8618 1.28922 19.7902V19.7892ZM5.67922 9.30122L10.7172 14.3392C11.0272 14.6492 11.1072 15.1332 10.8422 15.4822C10.4534 15.9933 9.95979 16.4152 9.39442 16.7197C8.82906 17.0242 8.20508 17.2041 7.56441 17.2474C6.92374 17.2908 6.28122 17.1965 5.68001 16.9709C5.07879 16.7454 4.53282 16.3937 4.07876 15.9397C3.6247 15.4856 3.27308 14.9396 3.04752 14.3384C2.82195 13.7372 2.72767 13.0947 2.771 12.454C2.81433 11.8134 2.99428 11.1894 3.29875 10.624C3.60321 10.0587 4.02515 9.565 4.53622 9.17622C4.88522 8.91022 5.36922 8.99022 5.67922 9.30122Z"/>
  </svg>
);
import { CHAT_PANEL } from "../constants/strings";

// LAYOUT — Props
interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInput: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  contextChips: ContextChip[];
  onRemoveChip: (chipId: string) => void;
  variant?: "default" | "landing";
  onUploadFile?: (file: File) => void;
  onConnectSource?: () => void;
}

// LAYOUT — Component
// Border: gradient stroke from Figma Form2 — uses var(--ring) with rgba(147,195,75) glow shadows
export function ChatInput({
  inputValue,
  onInputChange,
  onSend,
  onKeyDown,
  onInput,
  textareaRef,
  contextChips,
  onRemoveChip,
  variant = "default",
  onUploadFile,
  onConnectSource,
}: ChatInputProps) {
  const isLanding = variant === "landing";
  const showAddBtn = onUploadFile || onConnectSource;

  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholder = contextChips.length > 0 ? CHAT_PANEL.inputPlaceholderWithChips : CHAT_PANEL.inputPlaceholder;

  return (
    // LAYOUT — Outer wrapper with bottom padding
    <div className="shrink-0 w-full pb-[16px] px-[16px]">
      <div
        className="bg-card relative rounded-[var(--radius-card)] w-full"
        style={{ padding: isLanding ? "16px 20px" : "12px 16px" }}
      >
        {/* LAYOUT — Border overlay: gradient stroke from Figma Form2 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[var(--radius-card)] z-0"
          style={{
            border: "1px solid var(--ring)",
            borderRadius: "var(--radius-card)",
            boxShadow:
              "109px 82px 38px 0px rgba(147,195,75,0), 70px 52px 35px 0px rgba(147,195,75,0.01), 39px 29px 29px 0px rgba(147,195,75,0.03), 17px 13px 22px 0px rgba(147,195,75,0.06), 4px 3px 12px 0px rgba(147,195,75,0.07)",
          }}
        />

        <div className="flex flex-col gap-[4px] w-full relative z-10">
          {/* INTERACTION — Context chips (data source references) */}
          {contextChips.length > 0 && (
            <div className="flex flex-wrap gap-[4px] max-w-full overflow-hidden">
              {contextChips.map((chip) => (
                <div
                  key={chip.id}
                  className="bg-muted flex items-center px-[4px] rounded-[var(--radius-button)] h-[24px] gap-[4px] max-w-full min-w-0"
                >
                  <p
                    className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-base)",
                      fontWeight: "var(--font-weight-normal)",
                      lineHeight: "1.5",
                      fontFeatureSettings: "'cv08', 'lnum', 'tnum'",
                    }}
                  >
                    {chip.path}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 size-[14px] flex items-center justify-center cursor-pointer hover:opacity-60 transition-opacity"
                    onClick={() => onRemoveChip(chip.id)}
                    aria-label={`Remove ${chip.path}`}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1 1L7 7M7 1L1 7"
                        stroke="var(--secondary-foreground)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* LAYOUT — Textarea (full width) */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
              onInput();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={isLanding ? 3 : 2}
            className={`chat-input-textarea w-full bg-transparent outline-none resize-none max-h-[120px] ${isLanding ? "min-h-[64px]" : "min-h-[42px]"}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-normal)",
              lineHeight: "1.5",
              color: "var(--foreground)",
            }}
          />

          {/* LAYOUT — Bottom action bar: + icon (left) | Send (right) */}
          <div className="flex items-center pt-[6px]">
            {showAddBtn && (
              <>
                {/* + Add data icon button */}
                <button
                  ref={addBtnRef}
                  type="button"
                  onClick={() => setAnchorRect(anchorRect ? null : addBtnRef.current!.getBoundingClientRect())}
                  aria-label="Add data"
                  className={`shrink-0 size-[32px] flex items-center justify-center rounded-[var(--radius-button)] transition-colors text-[var(--foreground)] hover:bg-[var(--muted)] ${
                    anchorRect ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Shared dropdown — portal, positioned above button */}
                {anchorRect && (
                  <DropdownMenu
                    anchorRect={anchorRect}
                    align="left"
                    placement="above"
                    onClose={() => setAnchorRect(null)}
                    items={[
                      { label: "Upload file", icon: <IconUploadFile />, onClick: () => fileInputRef.current?.click() },
                      { label: "Connect data source", icon: <IconConnectSource />, onClick: () => onConnectSource?.() },
                    ]}
                  />
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.parquet"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadFile?.(f);
                    e.target.value = "";
                  }}
                />
              </>
            )}

            {/* INTERACTION — Send button: gradient icon from IconSend */}
            <button
              type="button"
              className="ml-auto shrink-0 size-[32px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
              onClick={onSend}
              aria-label="Send message"
            >
              <IconSend size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder color override */}
      <style>{`
        .chat-input-textarea::placeholder {
          color: var(--muted-foreground);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
