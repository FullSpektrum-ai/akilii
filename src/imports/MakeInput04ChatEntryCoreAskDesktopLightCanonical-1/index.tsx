import svgPaths from "./svg-eva1h3yjak";
import imgFrame from "./a17783d944d839f9aa57da9d49d3095b102c7136.png";
import imgOrganicPatternBg from "./2a317bb0941a4446636bd1a2bd99eb7bf66d6da6.png";
type NavigationDesktopStatusFooterProps = {
  className?: string;
  state?: "Synced";
  theme?: "Light";
};

function NavigationDesktopStatusFooter({ className, state = "Synced", theme = "Light" }: NavigationDesktopStatusFooterProps) {
  return (
    <div className={className || "bg-white h-[36px] relative w-[1040px]"}>
      <div aria-hidden className="absolute border-[#dad7ce] border-solid border-t-[0.5px] inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[32px] relative size-full">
          <div className="content-stretch flex items-center relative shrink-0" data-name="privacy-status">
            <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="secure-indicator">
              <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[12px]" data-name="lock-indicator">
                <div className="relative shrink-0 size-[12px]" data-name="icon-lock">
                  <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
                    <g clipPath="url(#clip0_0_134)" id="icon-lock">
                      <path d={svgPaths.p1e35b300} id="icon-detail / icon-lock / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
                    </g>
                    <defs>
                      <clipPath id="clip0_0_134">
                        <rect fill="white" height="12" width="12" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#171b18] text-[11px] whitespace-nowrap">Private · Protected</p>
            </div>
          </div>
          <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="system-status">
            <div className="relative shrink-0 size-[6px]" data-name="shape / system-status / 01">
              <div className="absolute inset-[-50%]">
                <svg className="block size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
                  <g filter="url(#filter0_d_0_136)" id="shape / system-status / 01">
                    <circle cx="6" cy="6" fill="#22C55E" r="3" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="12" id="filter0_d_0_136" width="12" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.13 0 0 0 0 0.77 0 0 0 0 0.37 0 0 0 0.4 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_0_136" />
                      <feBlend in="SourceGraphic" in2="effect1_dropShadow_0_136" mode="normal" result="shape" />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#171b18] text-[11px] whitespace-nowrap">Synced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type InputConversationComposerProps = {
  className?: string;
  context?: "Start";
  theme?: "Light";
  viewport?: "Desktop Wide";
};

function InputConversationComposer({ className, context = "Start", theme = "Light", viewport = "Desktop Wide" }: InputConversationComposerProps) {
  return (
    <div className={className || "drop-shadow-[0px_2px_2px_rgba(0,0,0,0.06),0px_6px_8px_rgba(0,0,0,0.08)] relative rounded-[16px] w-[736px]"}>
      <div aria-hidden className="absolute bg-gradient-to-b from-[rgba(255,255,255,0.5)] inset-0 pointer-events-none rounded-[16px] to-[rgba(246,242,234,0.25)]" />
      <div aria-hidden className="absolute border border-[#dad7ce] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center pl-[20px] pr-[14px] py-[8px] relative size-full">
          <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[44px]" data-name="control / attachment">
            <div className="relative shrink-0 size-[19px]" data-name="paperclip">
              <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 19 19" width="19">
                <g id="paperclip">
                  <path d={svgPaths.p33ad2900} id="icon / attachment" stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
                </g>
              </svg>
            </div>
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-px not-italic relative text-[#58615c] text-[14px]">Ask akilii anything or select a suggestion above...</p>
          <div className="content-stretch flex gap-[8px] h-[44px] items-center relative shrink-0" data-name="controls / voice-and-send">
            <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[44px]" data-name="mic-icon">
              <div className="relative shrink-0 size-[19px]" data-name="mic">
                <svg className="absolute block inset-0 size-full" fill="none" height="19" preserveAspectRatio="none" viewBox="0 0 19 19" width="19">
                  <g id="mic">
                    <path d={svgPaths.p11c25c80} id="icon / microphone" stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08),0px_2px_6px_0px_rgba(8,38,20,0.3)] shrink-0 size-[44px]" data-name="control / send">
              <div aria-hidden className="absolute bg-[#103a2a] inset-0 pointer-events-none rounded-[16px]" />
              <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="arrow-up-icon">
                <div className="relative shrink-0 size-[15px]" data-name="arrow-up">
                  <svg className="absolute block inset-0 size-full" fill="none" height="15" preserveAspectRatio="none" viewBox="0 0 15 15" width="15">
                    <g id="arrow-up">
                      <path d={svgPaths.p3827d880} id="icon / send" stroke="#F7F2E8" strokeLinecap="round" strokeWidth="2" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
    </div>
  );
}
type CardConversationSuggestionProps = {
  className?: string;
  action?: "Continue" | "Review" | "Explore";
  theme?: "Light";
  viewport?: "Desktop";
};

function CardConversationSuggestion({ className, action = "Continue", theme = "Light", viewport = "Desktop" }: CardConversationSuggestionProps) {
  const isExploreAndDesktopAndLight = action === "Explore" && viewport === "Desktop" && theme === "Light";
  const isReviewAndDesktopAndLight = action === "Review" && viewport === "Desktop" && theme === "Light";
  return (
    <div className={className || `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] relative rounded-[16px] w-[260px] ${isExploreAndDesktopAndLight ? "h-[83px]" : ""}`}>
      <div aria-hidden className="absolute bg-[#faf8f4] inset-0 pointer-events-none rounded-[16px]" />
      <div aria-hidden className="absolute border border-[#dad7ce] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <div className="bg-[#e3eae1] content-stretch flex flex-col items-center justify-center relative rounded-[10px] shrink-0 size-[36px]" data-name="icon / container">
            <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[18px]" data-name="chip-icon">
              {action === "Continue" && viewport === "Desktop" && theme === "Light" && (
                <div className="relative shrink-0 size-[17px]" data-name="clock">
                  <svg className="absolute block inset-0 size-full" fill="none" height="17" preserveAspectRatio="none" viewBox="0 0 17 17" width="17">
                    <g clipPath="url(#clip0_0_157)" id="clock">
                      <path d={svgPaths.p1ef09180} id="icon-detail / clock / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
                    </g>
                    <defs>
                      <clipPath id="clip0_0_157">
                        <rect fill="white" height="17" width="17" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              )}
              {isReviewAndDesktopAndLight && (
                <div className="relative shrink-0 size-[17px]" data-name="rotate-ccw">
                  <svg className="absolute block inset-0 size-full" fill="none" height="17" preserveAspectRatio="none" viewBox="0 0 17 17" width="17">
                    <g id="rotate-ccw">
                      <path d={svgPaths.p1bacbbc0} id="icon-detail / rotate-ccw / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
                    </g>
                  </svg>
                </div>
              )}
              {isExploreAndDesktopAndLight && (
                <div className="relative shrink-0 size-[17px]" data-name="compass">
                  <svg className="absolute block inset-0 size-full" fill="none" height="17" preserveAspectRatio="none" viewBox="0 0 17 17" width="17">
                    <g clipPath="url(#clip0_0_141)" id="compass">
                      <path d={svgPaths.p9f8bf20} id="icon-detail / compass / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
                    </g>
                    <defs>
                      <clipPath id="clip0_0_141">
                        <rect fill="white" height="17" width="17" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative" data-name="chip-text">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#103a2a] text-[14px] w-full">{isExploreAndDesktopAndLight ? "Explore: Something new" : isReviewAndDesktopAndLight ? "Start fresh: Weekly review" : "Continue: Investor meeting"}</p>
            <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#58615c] text-[13px] w-full">{isExploreAndDesktopAndLight ? "Open-ended · Explore freely" : isReviewAndDesktopAndLight ? "Routine session · Highly structured" : "Recent context · 2 hours ago"}</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.03),inset_0px_1px_0px_0px_rgba(255,255,255,0.5)]" />
    </div>
  );
}
type NavigationExperiencePickerProps = {
  className?: string;
  selection?: "Chat";
  state?: "Closed";
  theme?: "Light";
  viewport?: "Desktop";
};

function NavigationExperiencePicker({ className, selection = "Chat", state = "Closed", theme = "Light", viewport = "Desktop" }: NavigationExperiencePickerProps) {
  return (
    <div className={className || "h-[44px] relative w-[96px]"}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pl-[12px] pr-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic opacity-85 relative shrink-0 text-[#171b18] text-[13px] whitespace-nowrap">Chat</p>
          <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
            <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
              <g id="chevron-down" opacity="0.7">
                <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="#58615C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandCanonicalWordmarkOnForest({ className }: { className?: string }) {
  return (
    <div className={className || "h-[24px] relative w-[113px]"} data-name="Brand / Canonical / Wordmark On Forest">
      <div className="absolute inset-[0_9.23%_17.93%_0]" data-name="Canonical Wordmark Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="19.6973" preserveAspectRatio="none" viewBox="0 0 102.575 19.6973" width="102.575">
          <path clipRule="evenodd" d={svgPaths.p372e8900} fill="#F7F2E8" fillRule="evenodd" id="Canonical Wordmark Vector" />
        </svg>
      </div>
    </div>
  );
}

function BrandCanonicalBrandmark({ className }: { className?: string }) {
  return (
    <div className={className || "h-[56.714px] relative w-[58px]"} data-name="Brand / Canonical / Brandmark">
      <div className="absolute inset-[21.64%_39.04%_52.49%_21.03%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="14.6689" preserveAspectRatio="none" viewBox="0 0 23.1616 14.6689" width="23.1616">
          <path d={svgPaths.p3cc6ce80} fill="#F7F2E8" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[22.98%_22.38%_39.65%_53.37%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="21.194" preserveAspectRatio="none" viewBox="0 0 14.0632 21.194" width="14.0632">
          <path d={svgPaths.p20aa9980} fill="#F7F2E8" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[38.43%_54.51%_21.67%_21%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="22.6254" preserveAspectRatio="none" viewBox="0 0 14.2035 22.6254" width="14.2035">
          <path d={svgPaths.pf279fc0} fill="#F7F2E8" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[52.51%_21%_21.64%_36.43%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="14.6568" preserveAspectRatio="none" viewBox="0 0 24.6906 14.6568" width="24.6906">
          <path d={svgPaths.p894e80} fill="#F7F2E8" id="Vector" />
        </svg>
      </div>
    </div>
  );
}
type NavigationUnifiedDesktopSidebarProps = {
  className?: string;
  selection?: "None";
  state?: "Expanded";
  theme?: "Light";
};

function NavigationUnifiedDesktopSidebar({ className, selection = "None", state = "Expanded", theme = "Light" }: NavigationUnifiedDesktopSidebarProps) {
  return (
    <div className={className || "bg-[#103a2a] h-[900px] relative w-[240px]"}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start relative size-full">
          <div className="flex-[1_0_0] min-h-px relative w-full" data-name="sidebar-content">
            <div className="overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex flex-col items-start pb-[16px] pt-[20px] px-[16px] relative size-full">
                <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full" data-name="brand-logo-wrapper">
                  <BrandCanonicalBrandmark className="h-[41px] relative shrink-0 w-[42px]" />
                  <BrandCanonicalWordmarkOnForest className="h-[24px] relative shrink-0 w-[68px]" />
                </div>
                <div className="h-[16px] relative shrink-0 w-px" data-name="_s" />
                <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.08)] border-solid content-stretch flex gap-[8px] h-[36px] items-center overflow-clip pl-[12px] pr-[10px] relative rounded-[8px] shrink-0 w-full" data-name="search">
                  <div className="relative shrink-0 size-[9px]" data-name="Ellipse">
                    <svg className="absolute block inset-0 size-full" fill="none" height="9" preserveAspectRatio="none" viewBox="0 0 9 9" width="9">
                      <circle cx="4.5" cy="4.5" fill="#A0B2A8" id="Ellipse" opacity="0.6" r="4.5" />
                    </svg>
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic opacity-50 relative shrink-0 text-[#a0b2a8] text-[13px] whitespace-nowrap">Search...</p>
                  <div className="flex-[1_0_0] h-px min-w-px relative" data-name="Frame" />
                  <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex h-[20px] items-center justify-center overflow-clip relative rounded-[4px] shrink-0 w-[30px]" data-name="Frame">
                    <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic opacity-60 relative shrink-0 text-[#a0b2a8] text-[9px] whitespace-nowrap">⌘K</p>
                  </div>
                </div>
                <div className="h-[12px] relative shrink-0 w-px" data-name="_s" />
                <div className="[word-break:break-word] border border-[rgba(255,255,255,0.12)] border-solid content-stretch flex gap-[6px] h-[36px] items-center justify-center leading-[normal] not-italic overflow-clip relative rounded-[8px] shrink-0 text-[#f7f2e8] w-full whitespace-nowrap" data-name="new-btn">
                  <p className="font-['Inter:Regular',sans-serif] font-normal opacity-70 relative shrink-0 text-[15px]">+</p>
                  <p className="font-['Inter:Medium',sans-serif] font-medium opacity-70 relative shrink-0 text-[13px]">New conversation</p>
                </div>
                <div className="h-[24px] relative shrink-0 w-px" data-name="_s" />
                <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic opacity-60 relative shrink-0 text-[#a0b2a8] text-[10px] tracking-[0.8px] whitespace-nowrap">RECENTS</p>
                <div className="h-[8px] relative shrink-0 w-px" data-name="_s" />
                <div className="bg-[rgba(255,255,255,0.06)] content-stretch flex gap-[10px] h-[44px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0 w-full" data-name="item-investor">
                  <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
                    <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                      <circle cx="4" cy="4" fill="#59C78C" id="Ellipse" r="4" />
                    </svg>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic overflow-clip relative" data-name="Frame">
                    <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] min-w-full relative shrink-0 text-[#f7f2e8] text-[13px] w-[min-content]">Investor meeting</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 relative shrink-0 text-[#a0b2a8] text-[10px] whitespace-nowrap">Work · active</p>
                  </div>
                </div>
                <div className="content-stretch flex gap-[10px] h-[44px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0 w-full" data-name="item-funding">
                  <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
                    <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                      <circle cx="4" cy="4" fill="#A0B2A8" id="Ellipse" opacity="0.4" r="4" />
                    </svg>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic overflow-clip relative" data-name="Frame">
                    <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] min-w-full relative shrink-0 text-[#f7f2e8] text-[13px] w-[min-content]">Funding conversation</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 relative shrink-0 text-[#a0b2a8] text-[10px] whitespace-nowrap">Chat · today</p>
                  </div>
                  <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
                    <svg className="absolute block inset-0 size-full" fill="none" height="6" preserveAspectRatio="none" viewBox="0 0 6 6" width="6">
                      <circle cx="3" cy="3" fill="#59C78C" id="Ellipse" r="3" />
                    </svg>
                  </div>
                </div>
                <div className="content-stretch flex gap-[10px] h-[44px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0 w-full" data-name="item-weekly">
                  <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
                    <svg className="absolute block inset-0 size-full" fill="none" height="8" preserveAspectRatio="none" viewBox="0 0 8 8" width="8">
                      <circle cx="4" cy="4" fill="#A0B2A8" id="Ellipse" opacity="0.4" r="4" />
                    </svg>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic overflow-clip relative" data-name="Frame">
                    <p className="font-['Inter:Medium',sans-serif] font-medium h-[16px] min-w-full relative shrink-0 text-[#f7f2e8] text-[13px] w-[min-content]">Weekly reflection</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal opacity-55 relative shrink-0 text-[#a0b2a8] text-[10px] whitespace-nowrap">Chat · yesterday</p>
                  </div>
                </div>
                <div className="h-[24px] relative shrink-0 w-px" data-name="_s" />
                <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic opacity-60 relative shrink-0 text-[#a0b2a8] text-[10px] tracking-[0.8px] whitespace-nowrap">SPACES</p>
                <div className="h-[8px] relative shrink-0 w-px" data-name="_s" />
                <div className="content-stretch flex gap-[10px] h-[36px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0 w-full" data-name="Frame">
                  <div className="bg-[#59c78c] relative rounded-[4px] shrink-0 size-[14px]" data-name="Frame" />
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-px not-italic relative text-[#f7f2e8] text-[13px]">FullSpektrum</p>
                  <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic opacity-40 relative shrink-0 text-[#a0b2a8] text-[11px] whitespace-nowrap">4</p>
                </div>
                <div className="content-stretch flex gap-[10px] h-[36px] items-center overflow-clip px-[10px] relative rounded-[6px] shrink-0 w-full" data-name="Frame">
                  <div className="bg-[#737a8c] relative rounded-[4px] shrink-0 size-[14px]" data-name="Frame" />
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-px not-italic relative text-[#f7f2e8] text-[13px]">Personal admin</p>
                  <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic opacity-40 relative shrink-0 text-[#a0b2a8] text-[11px] whitespace-nowrap">1</p>
                </div>
                <div className="flex-[1_0_0] min-h-px relative w-px" data-name="Frame" />
                <div className="bg-[rgba(255,255,255,0.06)] h-px relative shrink-0 w-full" data-name="Rectangle" />
                <div className="h-[12px] relative shrink-0 w-px" data-name="_s" />
                <div className="content-stretch flex gap-[10px] h-[36px] items-center overflow-clip pl-[10px] relative rounded-[6px] shrink-0 w-full" data-name="Frame">
                  <div className="relative shrink-0 size-[14px]" data-name="Frame">
                    <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
                      <g clipPath="url(#clip0_0_253)" id="Frame">
                        <circle cx="7" cy="4" fill="#A0B2A8" id="Ellipse" opacity="0.6" r="3" />
                        <circle cx="7" cy="13" fill="#A0B2A8" id="Ellipse_2" opacity="0.6" r="5" />
                      </g>
                      <defs>
                        <clipPath id="clip0_0_253">
                          <rect fill="white" height="14" width="14" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic opacity-70 relative shrink-0 text-[#f7f2e8] text-[13px] whitespace-nowrap">My akilii</p>
                </div>
                <div className="content-stretch flex gap-[10px] h-[36px] items-center overflow-clip pl-[10px] relative rounded-[6px] shrink-0 w-full" data-name="Frame">
                  <div className="overflow-clip relative shrink-0 size-[14px]" data-name="Frame">
                    <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[7px] not-italic opacity-60 text-[#a0b2a8] text-[14px] text-center top-[7px] whitespace-nowrap">
                      <p className="leading-[normal]">⚙</p>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic opacity-70 relative shrink-0 text-[#f7f2e8] text-[13px] whitespace-nowrap">Settings</p>
                </div>
                <div className="h-[8px] relative shrink-0 w-px" data-name="_s" />
                <div className="content-stretch flex gap-[10px] h-[44px] items-center overflow-clip pl-[6px] pr-[10px] relative rounded-[8px] shrink-0 w-full" data-name="profile">
                  <div className="relative rounded-[14px] shrink-0 size-[28px]" data-name="Frame">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[14px] size-full" src={imgFrame} />
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Medium',sans-serif] font-medium leading-[normal] min-w-px not-italic opacity-85 relative text-[#f7f2e8] text-[12px]">Alex Morgan</p>
                  <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
                    <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
                      <g id="chevron-down" opacity="0.7">
                        <path d="M3 5L6 8L9 5" id="Vector" stroke="#58615C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="absolute border-[#1f3a2b] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function TitleArea() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic relative shrink-0 whitespace-nowrap" data-name="title-area">
      <p className="font-['DM_Serif_Display:Regular',sans-serif] relative shrink-0 text-[#103a2a] text-[28px]">New conversation</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#58615c] text-[13px]">Start a support session tailored to your needs</p>
    </div>
  );
}

function Lock1() {
  return (
    <div className="relative shrink-0 size-[13px]" data-name="lock">
      <svg className="absolute block inset-0 size-full" fill="none" height="13" preserveAspectRatio="none" viewBox="0 0 13 13" width="13">
        <g clipPath="url(#clip0_0_283)" id="lock">
          <path d={svgPaths.p32b4a500} id="icon-detail / lock / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_283">
            <rect fill="white" height="13" width="13" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Lock() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[14px]" data-name="lock">
      <Lock1 />
    </div>
  );
}

function RightStatus() {
  return (
    <div className="bg-[#f7f2e8] content-stretch drop-shadow-[0px_1px_2px_rgba(0,0,0,0.04)] flex gap-[6px] items-center px-[12px] py-[6px] relative rounded-[100px] shrink-0" data-name="right-status">
      <div aria-hidden className="absolute border border-[#dad7ce] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <Lock />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#103a2a] text-[13px] whitespace-nowrap">Private and protected</p>
    </div>
  );
}

function TopBar() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[20px] pt-[24px] px-[32px] relative shrink-0 w-full" data-name="top-bar">
      <div aria-hidden className="absolute border-[#dad7ce] border-b-[0.5px] border-solid inset-0 pointer-events-none" />
      <TitleArea />
      <RightStatus />
      <NavigationExperiencePicker className="h-[44px] relative shrink-0 w-[96px]" />
    </div>
  );
}

function AbstractPromptIllustration() {
  return (
    <div className="relative shrink-0 size-[132px]" data-name="abstract-prompt-illustration">
      <svg className="absolute block inset-0 size-full" fill="none" height="132" preserveAspectRatio="none" viewBox="0 0 132 132" width="132">
        <g id="abstract-prompt-illustration">
          <circle cx="66" cy="66" fill="#103A2A" id="ring-outer" opacity="0.08" r="66" />
          <circle cx="66" cy="66" id="ring-1" opacity="0.35" r="47.5" stroke="#103A2A" />
          <circle cx="66" cy="66" id="ring-2" opacity="0.45" r="31.5" stroke="#103A2A" />
          <circle cx="66" cy="66" id="ring-3" opacity="0.55" r="19.5" stroke="#103A2A" />
          <circle cx="32" cy="32" fill="#103A2A" id="node-1" opacity="0.6" r="5" />
          <circle cx="100" cy="32" fill="#103A2A" id="node-2" opacity="0.6" r="5" />
          <circle cx="32" cy="100" fill="#103A2A" id="node-3" opacity="0.6" r="5" />
          <circle cx="100" cy="100" fill="#103A2A" id="node-4" opacity="0.6" r="5" />
          <g id="message-circle" opacity="0.35">
            <path d={svgPaths.p3c296cf2} id="icon-detail / message-circle / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
          </g>
          <g id="sparkles" opacity="0.25">
            <path d={svgPaths.p33d34780} id="icon-detail / sparkles / 01" stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
          </g>
          <circle cx="66" cy="66" fill="#103A2A" id="spark" opacity="0.85" r="6" />
        </g>
      </svg>
    </div>
  );
}

function WelcomeTextBlock() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center not-italic relative shrink-0 text-center w-[640px]" data-name="welcome-text-block">
      <p className="font-['DM_Serif_Display:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#103a2a] text-[32px] w-full">What would you like to work on?</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#58615c] text-[15px] w-full">{`akilii adapts support based on what you've confirmed works for you`}</p>
    </div>
  );
}

function SuggestionsRow() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center pt-[24px] relative shrink-0 w-full" data-name="suggestions-row">
      <CardConversationSuggestion className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] relative rounded-[16px] shrink-0 w-[260px]" />
      <CardConversationSuggestion action="Review" className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] relative rounded-[16px] shrink-0 w-[260px]" />
      <CardConversationSuggestion action="Explore" className="drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05),0px_3px_4px_rgba(0,0,0,0.08)] h-[83px] relative rounded-[16px] shrink-0 w-[260px]" />
    </div>
  );
}

function CenterContent() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="center-content">
      <AbstractPromptIllustration />
      <WelcomeTextBlock />
      <SuggestionsRow />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[11px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" height="11" preserveAspectRatio="none" viewBox="0 0 11 11" width="11">
        <g clipPath="url(#clip0_0_137)" id="settings">
          <path d={svgPaths.p1acb3500} id="icon-detail / settings / 01" stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_0_137">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SettingsInline() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[12px]" data-name="settings-inline">
      <Settings />
    </div>
  );
}

function ControlOptionsTrigger() {
  return <div className="absolute h-[44px] left-0 top-[-14px] w-[84px]" data-name="control / options-trigger" />;
}

function VisualOptionsTrigger() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="visual / options-trigger">
      <SettingsInline />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#58615c] text-[13px] whitespace-nowrap">AI Settings</p>
      <ControlOptionsTrigger />
    </div>
  );
}

function InputMeta() {
  return (
    <div className="content-stretch flex items-center justify-between px-[8px] relative shrink-0 w-full" data-name="input-meta">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#58615c] text-[13px] whitespace-nowrap">Press Enter to send, Shift+Enter for new line</p>
      <VisualOptionsTrigger />
    </div>
  );
}

function InputPanel() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center max-w-[800px] px-[32px] relative shrink-0 w-full" data-name="input-panel">
      <InputConversationComposer className="drop-shadow-[0px_2px_2px_rgba(0,0,0,0.06),0px_6px_8px_rgba(0,0,0,0.08)] relative rounded-[16px] shrink-0 w-[736px]" />
      <InputMeta />
    </div>
  );
}

function WelcomeCenter() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-between min-h-px pb-[24px] pt-[48px] px-[48px] relative w-full" data-name="welcome-center">
      <CenterContent />
      <InputPanel />
    </div>
  );
}

function VisualHelp() {
  return (
    <div className="absolute bg-[#103a2a] content-stretch drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center left-[4px] rounded-[18px] size-[36px] top-[4px]" data-name="visual / help">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f7f2e8] text-[18px] text-center whitespace-nowrap">?</p>
    </div>
  );
}

function DesktopWorkspace() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-w-px relative" data-name="desktop-workspace">
      <div aria-hidden className="absolute bg-gradient-to-b from-[rgba(250,248,244,0.4)] inset-0 pointer-events-none to-[rgba(247,242,234,0.2)]" />
      <TopBar />
      <WelcomeCenter />
      <NavigationDesktopStatusFooter className="bg-white h-[36px] relative shrink-0 w-[1040px]" />
      <div className="absolute left-[980px] size-[44px] top-[800px]" data-name="help-trigger">
        <VisualHelp />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_3px_0px_8px_0px_rgba(0,0,0,0.03),inset_0px_3px_12px_0px_rgba(0,0,0,0.06)]" />
    </div>
  );
}

export default function MakeInput04ChatEntryCoreAskDesktopLightCanonical() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#fcfaf7] items-start overflow-clip relative rounded-[24px] size-full to-[#f5f1ea]" data-name="MAKE INPUT / 04 · Chat entry / CORE / ASK / Desktop / Light / Canonical">
      <div className="absolute inset-0 opacity-24" data-name="organic-pattern-bg">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgOrganicPatternBg} />
      </div>
      <NavigationUnifiedDesktopSidebar className="bg-[#103a2a] h-[900px] relative shrink-0 w-[240px]" />
      <DesktopWorkspace />
    </div>
  );
}