import svgPaths from "../../imports/svg-eva1h3yjak";

export default function StatusFooter() {
  return (
    <div className="relative h-9 shrink-0 bg-white w-full">
      <div className="absolute inset-0 border-t border-[#dad7ce] border-t-[0.5px] pointer-events-none" />
      <div className="flex items-center justify-between px-8 h-full">
        <div className="flex gap-[6px] items-center">
          <div className="flex flex-col items-center justify-center overflow-clip size-3">
            <svg fill="none" viewBox="0 0 12 12" className="size-3">
              <g clipPath="url(#cl-sf2-lock)">
                <path d={svgPaths.p1e35b300} stroke="#103A2A" strokeLinecap="round" strokeWidth="2" />
              </g>
              <defs><clipPath id="cl-sf2-lock"><rect fill="white" height="12" width="12" /></clipPath></defs>
            </svg>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#171b18] text-[11px] whitespace-nowrap">Private · Protected</p>
        </div>
        <div className="flex gap-[6px] items-center">
          <div className="relative size-[6px]">
            <div className="absolute inset-[-50%]">
              <svg fill="none" viewBox="0 0 12 12" className="size-3">
                <g filter="url(#sf2-dot)">
                  <circle cx="6" cy="6" fill="#22C55E" r="3" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="12" id="sf2-dot" width="12" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset /><feGaussianBlur stdDeviation="1.5" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.13 0 0 0 0 0.77 0 0 0 0 0.37 0 0 0 0.4 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_sf2" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_sf2" mode="normal" result="shape" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[#171b18] text-[11px] whitespace-nowrap">Synced</p>
        </div>
      </div>
    </div>
  );
}
