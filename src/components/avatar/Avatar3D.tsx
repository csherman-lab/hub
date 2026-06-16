"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import type { Avatar } from "@/types";
import { cn } from "@/lib/utils";

interface Avatar3DProps {
  avatar: Avatar;
  speaking?: boolean;
  className?: string;
  modelUrl?: string;
}

function CharacterModel({
  url,
  speaking,
  accentColor,
}: {
  url: string;
  speaking: boolean;
  accentColor: string;
}) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={speaking ? 1.02 : 1}
      position={[0, -1.2, 0]}
    />
  );
}

/** Placeholder 3D bust until a GLB model is added to public/models/ */
function PlaceholderBust({ accentColor }: { accentColor: string }) {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#f5d0b5" />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d2314" />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 0.9, 32]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
    </group>
  );
}

function Scene({
  avatar,
  speaking,
  modelUrl,
}: {
  avatar: Avatar;
  speaking: boolean;
  modelUrl?: string;
}) {
  const [hasModel, setHasModel] = useState(false);
  const url = modelUrl || avatar.modelUrl || `/models/${avatar.id}.glb`;

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasModel(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasModel(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow />
      <Environment preset="city" />
      {hasModel ? (
        <CharacterModel url={url} speaking={speaking} accentColor={avatar.accentColor} />
      ) : (
        <PlaceholderBust accentColor={avatar.accentColor} />
      )}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={speaking ? 1.2 : 0.4}
      />
    </>
  );
}

export function Avatar3D({ avatar, speaking = false, className, modelUrl }: Avatar3DProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <Canvas camera={{ position: [0, 1.2, 2.8], fov: 35 }} shadows>
        <Suspense fallback={null}>
          <Scene avatar={avatar} speaking={speaking} modelUrl={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
