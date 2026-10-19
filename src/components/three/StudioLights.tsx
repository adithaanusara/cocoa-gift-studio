"use client";

import { Environment, Lightformer } from "@react-three/drei";

/** Warm boutique lighting with soft studio reflections (no HDR download). */
export function StudioLights({ intensity = 1, env = 0.7 }: { intensity?: number; env?: number }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} color="#fff1dd" />
      <directionalLight position={[3, 6, 4]} intensity={1.7 * intensity} color="#fff3e2" />
      <directionalLight position={[-4, 3, -2]} intensity={0.5 * intensity} color="#ffd6a3" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6 * env} color="#fff4e2" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={1.4 * env} color="#ffd59a" position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.1 * env} color="#ffffff" position={[6, 2.5, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2.2 * env} color="#ffe2b3" position={[3, 4, -4]} scale={2.4} />
        <Lightformer form="rect" intensity={0.8 * env} color="#c99a5b" position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
    </>
  );
}
