"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import type { Avatar } from "@/types";
import { cn } from "@/lib/utils";

interface CharacterModel3DProps {
  avatar: Avatar;
  speaking?: boolean;
  listening?: boolean;
  className?: string;
}

function CharacterMesh({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene.clone()}
      scale={1.35}
      position={[0, -1.05, 0]}
      rotation={[0, 0.15, 0]}
    />
  );
}

function PlaceholderBust({ accentColor }: { accentColor: string }) {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial color={accentColor} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.55, 0.72, 0.9, 48]} />
        <meshStandardMaterial color={accentColor} roughness={0.55} metalness={0.02} />
      </mesh>
    </group>
  );
}

function CharacterScene({
  avatar,
  speaking,
  listening,
}: {
  avatar: Avatar;
  speaking?: boolean;
  listening?: boolean;
}) {
  const [modelReady, setModelReady] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const modelUrl = avatar.modelUrl ?? `/models/${avatar.id}.glb`;

  useEffect(() => {
    let cancelled = false;
    setModelReady(false);
    setModelFailed(false);

    fetch(modelUrl, { method: "HEAD" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setModelReady(true);
        else setModelFailed(true);
      })
      .catch(() => {
        if (!cancelled) setModelFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  const breathe = speaking ? 1.04 : listening ? 1.02 : 1;

  return (
    <group scale={breathe}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <directionalLight position={[-2, 2, -1]} intensity={0.35} color="#ffd9b0" />
      <Suspense fallback={<PlaceholderBust accentColor={avatar.accentColor} />}>
        {modelReady && !modelFailed ? (
          <CharacterMesh url={modelUrl} />
        ) : (
          <PlaceholderBust accentColor={avatar.accentColor} />
        )}
      </Suspense>
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.35}
        scale={8}
        blur={2.4}
        far={4}
      />
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={speaking}
        autoRotateSpeed={0.45}
      />
    </group>
  );
}

export function CharacterModel3D({
  avatar,
  speaking = false,
  listening = false,
  className,
}: CharacterModel3DProps) {
  return (
    <div
      className={cn(
        "h-[min(52vh,420px)] w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-zinc-100 shadow-inner dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950",
        className,
      )}
      aria-label={`${avatar.name} 3D avatar`}
    >
      <Canvas camera={{ position: [0, 0.2, 2.8], fov: 36 }} dpr={[1, 2]}>
        <CharacterScene avatar={avatar} speaking={speaking} listening={listening} />
      </Canvas>
    </div>
  );
}
