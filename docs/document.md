
# document.md

# 🖥️ MacOS Terminal UI — Next.js + Tailwind (Single-File Documentation)

This document contains everything in one place.

## Terminal.tsx

\`\`\`tsx
import React from "react";

export default function Terminal() {
  return (
    <div className="w-[920px] h-[560px] rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="h-[36px] bg-[#2B2B2B] flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 text-center text-[13px] text-[#CFCFCF] font-medium">
          kubechaos — bash
        </div>
        <div className="w-24" />
      </div>

      <div className="bg-[#1E1E1E] h-[488px] p-5 font-['JetBrains_Mono']">
        <pre className="text-[15px] leading-[22px] text-[#EBEBEB]">
Last login: Thu Nov 27

kubechaos@local ~ % connect aks-demo
✔ Connected to cluster: aks-demo (centralindia)

kubechaos@aks-demo ~ % kubectl get pods
...
        </pre>
      </div>

      <div className="bg-[#262626] h-[26px] px-4 flex items-center text-[12px] text-[#9E9E9E]">
        Connected | region: centralindia | chaos: disabled
      </div>
    </div>
  );
}
\`\`\`

## index.tsx

\`\`\`tsx
import Terminal from "../components/Terminal";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0D0E] flex items-center justify-center p-6">
      <Terminal />
    </div>
  );
}
\`\`\`

## tailwind.config.js

\`\`\`js
module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        JetBrains_Mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
};
\`\`\`

## globals.css

\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
body { background:#0B0D0E; margin:0; }
\`\`\`

