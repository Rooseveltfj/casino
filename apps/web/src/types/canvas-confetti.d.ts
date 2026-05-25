/**
 * Augments canvas-confetti's namespace export with the ES-module default
 * shape that `import()` actually resolves to under esModuleInterop.
 */
declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  type ConfettiFn = (options?: ConfettiOptions) => Promise<null> | null;

  const confetti: ConfettiFn & { default: ConfettiFn };
  export default confetti;
  export { ConfettiOptions };
}
