import { Home, Terminal, AlertTriangle, Zap, Settings } from 'lucide-react';

const MENU_ITEMS = [
    { icon: Home, label: 'Home', active: true },
    { icon: Terminal, label: 'Terminal', active: false },
    { icon: AlertTriangle, label: 'Incidents', active: false },
    { icon: Zap, label: 'Chaos Events', active: false },
    { icon: Settings, label: 'Settings', active: false },
];

export default function Sidebar() {
    return (
        <div className="w-20 bg-[#1a1b26]/80 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col items-center py-8 gap-8 shadow-2xl">
            {MENU_ITEMS.map((item, index) => (
                <button
                    key={index}
                    className={`p-3 rounded-xl transition-all duration-300 group relative ${item.active
                            ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                            : 'text-slate-400 hover:text-blue-300 hover:bg-white/5'
                        }`}
                    title={item.label}
                >
                    <item.icon
                        className={`w-6 h-6 ${item.active ? 'stroke-[2px]' : 'stroke-[1.5px]'}`}
                    />
                    {item.active && (
                        <div className="absolute inset-0 border border-blue-500/30 rounded-xl shadow-[inset_0_0_10px_rgba(96,165,250,0.1)]" />
                    )}
                </button>
            ))}
        </div>
    );
}
