import React from "react";

export default function TerminalInline() {
    const style = {
        container: {
            width: 920, height: 560, borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: '#1E1E1E',
            display: 'flex', flexDirection: 'column' as const,
        },
        hdr: { height: 36, background: '#2B2B2B', display: 'flex', alignItems: 'center', padding: '0 16px' },
        traffic: { display: 'flex', gap: 8 },
        dot: (c: string) => ({ width: 12, height: 12, borderRadius: 999, background: c }),
        title: { flex: 1, textAlign: 'center' as const, color: '#CFCFCF', fontSize: 13, fontWeight: 500 },
        body: { padding: 20, flex: 1, color: '#EBEBEB', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, lineHeight: '22px' },
        footer: { height: 26, background: '#262626', display: 'flex', alignItems: 'center', padding: '0 12px', color: '#9E9E9E', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }
    };

    return (
        <div style={{ background: '#0B0D0E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={style.container}>
                <div style={style.hdr}>
                    <div style={style.traffic}>
                        <span style={style.dot('#FF5F56')}></span>
                        <span style={style.dot('#FFBD2E')}></span>
                        <span style={style.dot('#27C93F')}></span>
                    </div>
                    <div style={style.title}>kubechaos — bash</div>
                    <div style={{ width: 80 }} />
                </div>

                <div style={style.body}>
                    {`Last login: Thu, Nov 27

Welcome to KubeChaos Terminal!
Type "help" for available commands.
Type "kubectl get pods" to see your cluster pods.

kubechaos@cluster ~ % `}
                </div>

                <div style={style.footer}>Disconnected | region: local | chaos: disabled</div>
            </div>
        </div>
    );
}
