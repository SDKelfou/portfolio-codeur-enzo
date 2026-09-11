import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type * as THREE from "three";
import { useTheme, MODE_COLORS } from "../theme";
import { useReducedMotion } from "../useReducedMotion";
import { isWebglSupported } from "../useWebglSupported";
import { ShaderBackdrop } from "./ShaderBackdrop";
import { ToonBiplane } from "./ToonBiplane";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { StaticFallback } from "./StaticFallback";
import { warpState } from "../warp/warpState";

/** Punches the camera in toward the biplane during the Reality Warp boost
 *  (a fake aggressive dolly-zoom) and eases back once the transition ends. */
function WarpCameraKick() {
  const { camera } = useThree();
  const baseFov = useRef<number | null>(null);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (typeof cam.fov !== "number") return;
    if (baseFov.current === null) baseFov.current = cam.fov;
    const targetFov = baseFov.current - warpState.boost * 10;
    if (Math.abs(cam.fov - targetFov) > 0.02) {
      cam.fov = targetFov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

function Scene({ colors }: { colors: { accent: string; accent2: string; strong: string } }) {
  // The headline/subcopy always live in the left ~60% of the hero. Keep the
  // plane clear of that column so it never cuts across the text — parked
  // toward the right on desktop, tucked up into the corner (smaller, out of
  // the paragraph's way) on narrow/mobile viewports.
  const { size } = useThree();
  const isMobile = size.width < 720;
  const planePosition: [number, number, number] = isMobile ? [0.35, 0.95, -0.8] : [1.35, 0, -0.3];
  const planeScale = isMobile ? 0.85 : 1.5;
  const biplaneRef = useRef<THREE.Group>(null);

  return (
    <>
      <WarpCameraKick />
      {/* Flat toon shading only needs directional key/fill light, no
          reflection environment — simpler and cheaper than the previous
          glass material's synthetic Lightformer rig. Kept bright: this is
          a painted, colorful asset and the whole point of the toon pass is
          to show it off, not bury it in shadow. */}
      <ambientLight intensity={2.2} />
      <directionalLight position={[4, 5, 4]} intensity={3.2} />
      <directionalLight position={[-3, -1, 2]} intensity={0.9} color={colors.accent} />
      <ShaderBackdrop color1={colors.strong} color2={colors.accent} color3={colors.accent2} radius={5.5} position={[0.6, -0.2, -3]} />
      <group ref={biplaneRef} position={planePosition} scale={planeScale}>
        <ToonBiplane />
      </group>
      {/* Screen-space ink outline (see the long comment in ToonBiplane's
          celShade): the model is ~150 mostly-thin, open parts where a
          per-mesh geometry outline breaks down, so this reads the actual
          rendered silhouette instead. */}
      {/* autoClear intentionally left at its default (true): the library's
          own docs suggest autoClear={false} for this effect, but on this
          transparent (alpha:true) canvas that setting renders solid black
          — the composer never gets a fresh base to draw onto. Default
          clearing renders correctly here and is what's actually verified
          working; it only costs a single harmless "requires autoClear
          false" warning in the console. */}
      <EffectComposer multisampling={0}>
        <Outline
          selection={biplaneRef}
          blendFunction={BlendFunction.ALPHA}
          visibleEdgeColor={0x0b0b10}
          hiddenEdgeColor={0x0b0b10}
          edgeStrength={5}
          xRay={false}
          blur={false}
        />
      </EffectComposer>
    </>
  );
}

/** Full-bleed 3D hero backdrop: the shader-gradient cosmic sphere plus the
 *  cel-shaded WWI biplane, both recolored from the visitor's chosen accent
 *  mode. Non-interactive (pointer-events-none) — the plane tracks the
 *  cursor via a window listener, so buttons/links layered on top stay
 *  fully usable. */
function HeroScene() {
  const { mode } = useTheme();
  const reducedMotion = useReducedMotion();
  const colors = MODE_COLORS[mode];

  if (reducedMotion || !isWebglSupported()) {
    return <StaticFallback colors={colors} />;
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <CanvasErrorBoundary fallback={<StaticFallback colors={colors} />}>
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Scene colors={colors} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

// Default export so this whole module (three.js + R3F + drei — a genuinely
// heavy dependency) can be code-split with React.lazy() and loaded only
// once the visitor actually has the page open, instead of blocking the
// initial bundle everyone downloads.
export default HeroScene;
