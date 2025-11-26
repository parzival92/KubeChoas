'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, Pod } from '@/store/gameStore';

interface HexNodeProps extends Pod {
    position: [number, number, number];
    onClick?: () => void;
}

function HexNode({ position, status, name, namespace, onClick }: HexNodeProps) {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    const color = useMemo(() => {
        switch (status) {
            case 'Running': return '#34d399'; // emerald-400
            case 'Pending': return '#fbbf24'; // amber-400
            case 'Failed': return '#ef4444'; // red-500
            case 'CrashLoopBackOff': return '#ef4444';
            default: return '#94a3b8'; // slate-400
        }
    }, [status]);

    useFrame((state) => {
        if (!mesh.current) return;
        // Gentle rotation
        mesh.current.rotation.y += 0.005;

        // Pulse effect if failed
        if (status === 'Failed' || status === 'CrashLoopBackOff') {
            const t = state.clock.getElapsedTime();
            const material = mesh.current.material as THREE.MeshStandardMaterial;
            if (material) {
                material.emissiveIntensity = 1 + Math.sin(t * 5);
            }
        }

        if (hovered) {
            mesh.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
            mesh.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh
                    ref={mesh}
                    onClick={onClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <cylinderGeometry args={[1, 1, 0.5, 6]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={hovered ? 1.5 : 0.5}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Status Ring */}
                <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[1.2, 1.2, 0.05, 6]} />
                    <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
                </mesh>

                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {name}
                </Text>
                <Text
                    position={[0, 1.1, 0]}
                    fontSize={0.15}
                    color="#cbd5e1"
                    anchorX="center"
                    anchorY="middle"
                >
                    {namespace}
                </Text>
            </Float>
        </group>
    );
}

export default function Cluster3DVisualizer() {
    const { pods } = useGameStore();

    // Simple grid layout logic
    const nodes = useMemo(() => {
        return pods.map((pod, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            // Offset every other row for hex grid effect
            const xOffset = row % 2 === 0 ? 0 : 1.5;
            return {
                ...pod,
                position: [col * 3 + xOffset - 6, 0, row * 2.5 - 4] as [number, number, number]
            };
        });
    }, [pods]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-cyber-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.1)] bg-black/80 relative group">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs font-mono text-cyber-blue flex items-center gap-2">
                <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse" />
                LIVE CLUSTER VIEW // 3D VISUALIZATION
            </div>

            <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
                <color attach="background" args={['#050a14']} />

                <fog attach="fog" args={['#050a14', 10, 40]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
                <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={12} size={4} speed={0.4} opacity={0.5} color="#00f3ff" />

                <group position={[0, -1, 0]}>
                    {/* Grid Floor */}
                    <gridHelper args={[50, 50, '#1e293b', '#0f172a']} position={[0, -2, 0]} />

                    {nodes.map((node) => (
                        <HexNode
                            key={node.id}
                            {...node}
                        />
                    ))}
                </group>

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.5}
                    autoRotate={false}
                />
            </Canvas>

            {/* Overlay Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] opacity-20" />
        </div>
    );
}
