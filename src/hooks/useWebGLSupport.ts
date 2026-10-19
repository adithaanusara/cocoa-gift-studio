"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detect(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** `null` while rendering on the server, then whether WebGL is available. */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(noop, detect, () => null);
}
