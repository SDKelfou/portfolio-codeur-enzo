/** Static CSS gradient used as the Suspense placeholder while the 3D scene
 *  chunk loads, and permanently whenever WebGL is unavailable or the
 *  visitor asked for reduced motion — same hue family as the live shader,
 *  just frozen, so nobody ever sees a blank hero. Deliberately has zero
 *  three.js/R3F imports so it costs nothing in the main bundle. */
export function StaticFallback({ colors }: { colors: { accent: string; accent2: string; strong: string } }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: `radial-gradient(120% 90% at 70% 20%, ${colors.accent2}33, transparent 60%),
                     radial-gradient(100% 80% at 20% 80%, ${colors.accent}2e, transparent 65%),
                     linear-gradient(160deg, #08080a, #0d0d12)`,
      }}
    />
  );
}
