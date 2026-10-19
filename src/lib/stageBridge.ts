import type { Placement } from "./types";

/** How long a chocolate takes to fly from its card into the box (ms). */
export const FLIGHT_MS = 760;
/** How long the lift-out takes before the return flight starts (ms). */
export const LIFT_OUT_MS = 380;

export type Projector = (placement: Placement | null) => { x: number; y: number } | null;

/**
 * Lets DOM animations find where a placement appears on screen, whether the
 * stage is the 3D canvas or the flat fallback view, and lets drag-and-drop
 * know where the drop zone is.
 */
let projector: Projector | null = null;
let stageElement: HTMLElement | null = null;

export const stageBridge = {
  setElement(element: HTMLElement | null) {
    stageElement = element;
  },
  setProjector(project: Projector) {
    projector = project;
    return () => {
      if (projector === project) projector = null;
    };
  },
  project(placement: Placement | null) {
    const point = projector?.(placement);
    if (point) return point;
    if (!stageElement) return null;
    const rect = stageElement.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  },
  isPointInside(x: number, y: number) {
    if (!stageElement) return false;
    const rect = stageElement.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  },
};
