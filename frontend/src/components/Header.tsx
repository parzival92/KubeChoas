// Kubernetes wheel icon component
function KubernetesIcon() {
    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
        >
            <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                fill="#3b82f6"
                fillOpacity="0.2"
                stroke="#3b82f6"
                strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="3" fill="#60a5fa" />
            <path d="M12 2v5M12 17v5M3 7l4 3M17 14l4 3M3 17l4-3M17 10l4-3"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function Header() {
    return (
        <div className="flex flex-col items-center justify-center py-8 relative">
            <div className="flex items-center gap-4 z-10">
                <div className="relative">
                    <KubernetesIcon />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Welcome to <span className="text-blue-400">kubechaos</span>
                </h1>
            </div>

            {/* Subtle background motif */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        </div>
    );
}
