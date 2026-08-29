export default function OrganicPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 size-full ${className}`}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1040 900"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flowing topographic-style curves */}
      <path d="M-80 680 C 60 640 200 720 350 660 C 500 600 580 520 720 510 C 860 500 960 560 1120 530" stroke="#103a2a" strokeWidth="1.2" fill="none" />
      <path d="M-80 620 C 80 575 240 650 400 595 C 520 555 620 475 760 465 C 880 455 980 510 1120 480" stroke="#103a2a" strokeWidth="1.2" fill="none" />
      <path d="M-80 560 C 100 510 260 585 430 530 C 560 490 650 410 790 400 C 920 390 1000 450 1120 430" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M-80 760 C 40 730 180 790 310 760 C 480 720 560 650 700 640 C 840 630 940 690 1120 660" stroke="#103a2a" strokeWidth="1.2" fill="none" />
      <path d="M-80 830 C 60 800 220 855 380 820 C 530 785 620 720 760 710 C 900 700 980 750 1120 730" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M-80 490 C 120 440 280 520 460 460 C 600 415 690 340 830 330 C 960 320 1040 380 1120 360" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M-80 420 C 140 370 300 455 490 390 C 640 340 730 270 870 260 C 1000 250 1060 310 1120 290" stroke="#103a2a" strokeWidth="0.8" fill="none" />
      <path d="M-80 340 C 120 300 310 370 510 310 C 650 270 750 200 900 190 C 1030 180 1080 240 1120 220" stroke="#103a2a" strokeWidth="0.8" fill="none" />
      <path d="M-80 260 C 100 230 320 285 530 230 C 670 195 770 130 920 120 C 1050 112 1090 170 1120 155" stroke="#103a2a" strokeWidth="0.7" fill="none" />
      <path d="M200 -40 C 160 80 140 200 180 340 C 220 480 280 560 260 700 C 240 830 180 890 200 970" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M340 -40 C 300 70 270 190 320 320 C 370 450 420 530 400 670 C 380 800 310 870 320 970" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M480 -40 C 440 60 400 180 460 310 C 520 440 560 510 540 650 C 520 780 440 860 450 970" stroke="#103a2a" strokeWidth="1" fill="none" />
      <path d="M620 -40 C 590 55 560 175 610 310 C 660 445 690 510 670 660 C 650 800 580 865 590 970" stroke="#103a2a" strokeWidth="0.9" fill="none" />
      <path d="M760 -40 C 740 50 720 165 760 305 C 800 445 820 515 800 665 C 780 800 720 865 730 970" stroke="#103a2a" strokeWidth="0.9" fill="none" />
      <path d="M900 -40 C 890 45 880 155 910 300 C 940 445 950 520 930 670 C 910 800 860 860 870 970" stroke="#103a2a" strokeWidth="0.8" fill="none" />
    </svg>
  );
}
