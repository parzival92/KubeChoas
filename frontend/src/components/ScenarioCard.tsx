import { LucideIcon } from 'lucide-react';

interface ScenarioCardProps {
    title: string;
    icon: LucideIcon;
    color: 'blue' | 'orange' | 'yellow';
    onClick?: () => void;
}

const COLOR_MAP = {
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        hover: 'group-hover:border-blue-500/50',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        iconBg: 'bg-blue-500/20'
    },
    orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        hover: 'group-hover:border-orange-500/50',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
        iconBg: 'bg-orange-500/20'
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        hover: 'group-hover:border-yellow-500/50',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
        iconBg: 'bg-yellow-500/20'
    }
};

export default function ScenarioCard({ title, icon: Icon, color, onClick }: ScenarioCardProps) {
    const styles = COLOR_MAP[color];

    return (
        <button
            onClick={onClick}
            className={`relative group flex flex-col items-center justify-center p-6 rounded-xl border ${styles.border} ${styles.bg} transition-all duration-300 ${styles.hover} ${styles.shadow} w-full`}
        >
            <div className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-7 h-7 ${styles.text}`} strokeWidth={2} />
            </div>
            <span className={`font-medium text-base ${styles.text}`}>
                {title}
            </span>
        </button>
    );
}
