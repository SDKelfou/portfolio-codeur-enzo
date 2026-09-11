import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/** A 2D delta-wing silhouette, extruded thin — used for both the main
 *  wings and the small tail fin. Kept deliberately simple/geometric
 *  (a stylized jet, not a literal model) per the agreed direction. */
function wingShape(span: number, sweep: number, root: number, tip: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, root / 2);
  shape.lineTo(span, root / 2 - sweep);
  shape.lineTo(span, root / 2 - sweep - tip);
  shape.lineTo(0, -root / 2);
  shape.closePath();
  return shape;
}

interface GlassPlaneProps {
  color: string;
  color2: string;
}

/** Stylized minimalist glass jet: a capsule fuselage + nose cone + swept
 *  wings + tail fin, all sharing one MeshTransmissionMaterial so it reads
 *  as a single "liquid glass" object. Idles with a gentle float and turns
 *  to face the cursor. */
export function GlassPlane({ color, color2 }: GlassPlaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const wingGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(wingShape(1.05, 0.55, 0.62, 0.18), {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  const finGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(wingShape(0.46, 0.3, 0.34, 0.08), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((state, delta) => {
    current.current.x += (target.current.x - current.current.x) * Math.min(1, delta * 2.2);
    current.current.y += (target.current.y - current.current.y) * Math.min(1, delta * 2.2);

    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = -current.current.x * 0.55 + Math.sin(t * 0.35) * 0.06;
    g.rotation.x = current.current.y * 0.28 + Math.sin(t * 0.5) * 0.03;
    g.rotation.z = -current.current.x * 0.18;
    g.position.y = Math.sin(t * 0.6) * 0.16;
    g.position.x = current.current.x * 0.25;
  });

  return (
    <group ref={groupRef} rotation={[0.08, -0.5, 0.08]}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.17, 1.5, 6, 12]} />
        <MeshTransmissionMaterial
          color={color}
          thickness={0.6}
          roughness={0.06}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.04}
          anisotropy={0.15}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.08}
          resolution={256}
          samples={6}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.42, 12]} />
        <MeshTransmissionMaterial
          color={color2}
          thickness={0.4}
          roughness={0.05}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.05}
          resolution={256}
          samples={6}
        />
      </mesh>

      {/* Wings */}
      <mesh geometry={wingGeo} position={[-0.05, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <MeshTransmissionMaterial
          color={color}
          thickness={0.15}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.06}
          resolution={256}
          samples={6}
        />
      </mesh>
      <mesh geometry={wingGeo} position={[-0.05, 0, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <MeshTransmissionMaterial
          color={color}
          thickness={0.15}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.06}
          resolution={256}
          samples={6}
        />
      </mesh>

      {/* Tail fin */}
      <mesh geometry={finGeo} position={[-0.68, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <MeshTransmissionMaterial
          color={color2}
          thickness={0.12}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.05}
          resolution={256}
          samples={6}
        />
      </mesh>

      {/* Discrete luminous trail, not a literal particle stream */}
      <Sparkles count={70} scale={[3.2, 1.4, 1.6]} size={1.6} speed={0.25} noise={1} color={color} opacity={0.55} position={[-0.6, 0, 0]} />
    </group>
  );
}
