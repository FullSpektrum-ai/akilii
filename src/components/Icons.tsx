import svgPaths from "../../imports/svg-eva1h3yjak";

export function IconLock({ className = "size-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 12 12">
      <g clipPath="url(#cl-lock)">
        <path d={svgPaths.p1e35b300} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="cl-lock"><rect fill="white" height="12" width="12" /></clipPath>
      </defs>
    </svg>
  );
}

export function IconPaperclip({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 19 19">
      <path d={svgPaths.p33ad2900} stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function IconMic({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 19 19">
      <path d={svgPaths.p11c25c80} stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function IconSend({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 15 15">
      <path d={svgPaths.p3827d880} stroke="#F7F2E8" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function IconClock({ className = "size-[17px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 17 17">
      <g clipPath="url(#cl-clock)">
        <path d={svgPaths.p1ef09180} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="cl-clock"><rect fill="white" height="17" width="17" /></clipPath>
      </defs>
    </svg>
  );
}

export function IconRotateCcw({ className = "size-[17px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 17 17">
      <path d={svgPaths.p1bacbbc0} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function IconCompass({ className = "size-[17px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 17 17">
      <g clipPath="url(#cl-compass)">
        <path d={svgPaths.p9f8bf20} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="cl-compass"><rect fill="white" height="17" width="17" /></clipPath>
      </defs>
    </svg>
  );
}

export function IconSettings({ className = "size-[11px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 11 11">
      <g clipPath="url(#cl-settings)">
        <path d={svgPaths.p1acb3500} stroke="#58615C" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="cl-settings"><rect fill="white" height="11" width="11" /></clipPath>
      </defs>
    </svg>
  );
}

export function IconLock2({ className = "size-[13px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 13 13">
      <g clipPath="url(#cl-lock2)">
        <path d={svgPaths.p32b4a500} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="cl-lock2"><rect fill="white" height="13" width="13" /></clipPath>
      </defs>
    </svg>
  );
}

export function AbstractPromptIllustration() {
  return (
    <svg className="size-[132px]" fill="none" viewBox="0 0 132 132">
      <circle cx="66" cy="66" fill="#103A2A" opacity="0.08" r="66" />
      <circle cx="66" cy="66" opacity="0.35" r="47.5" stroke="#103A2A" />
      <circle cx="66" cy="66" opacity="0.45" r="31.5" stroke="#103A2A" />
      <circle cx="66" cy="66" opacity="0.55" r="19.5" stroke="#103A2A" />
      <circle cx="32" cy="32" fill="#103A2A" opacity="0.6" r="5" />
      <circle cx="100" cy="32" fill="#103A2A" opacity="0.6" r="5" />
      <circle cx="32" cy="100" fill="#103A2A" opacity="0.6" r="5" />
      <circle cx="100" cy="100" fill="#103A2A" opacity="0.6" r="5" />
      <g opacity="0.35">
        <path d={svgPaths.p3c296cf2} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <g opacity="0.25">
        <path d={svgPaths.p33d34780} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
      </g>
      <circle cx="66" cy="66" fill="#103A2A" opacity="0.85" r="6" />
    </svg>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-5 ${className}`} fill="none" viewBox="0 0 102.575 19.6973">
      <path clipRule="evenodd" d={svgPaths.p372e8900} fill="#F7F2E8" fillRule="evenodd" />
    </svg>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: 42, height: 41 }}>
      <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 58 56.714">
        <path d={svgPaths.p3cc6ce80} fill="#F7F2E8" transform="translate(12.2,12.16) scale(0.399)" />
        <path d={svgPaths.p20aa9980} fill="#F7F2E8" transform="translate(30.95,12.89) scale(0.242)" />
        <path d={svgPaths.pf279fc0} fill="#F7F2E8" transform="translate(12.18,21.77) scale(0.245)" />
        <path d={svgPaths.p894e80} fill="#F7F2E8" transform="translate(12.18,29.73) scale(0.425)" />
      </svg>
    </div>
  );
}
