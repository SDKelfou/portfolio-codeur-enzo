import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { getToonGradientMap } from "./toonGradient";
import { warpState } from "../warp/warpState";

const MODEL_URL = "/models/stylized_ww1_plane.glb";
// The source file's fuselage runs along local Z, pointed straight at the
// camera by default — a nose-on view that reads as a dark blob, not a
// biplane. This resting yaw swings it to a three-quarter hero angle so the
// wingtop, fuselage flank and nose are all visible at once.
const BASE_YAW = -0.95;
const BASE_PITCH = -0.08;

// The loaded GLTF scene is cached/shared by useGLTF across remounts (HMR,
// StrictMode). These guard the one-time material/outline setup so it never
// runs twice on the same object graph.
const processedScenes = new WeakSet<THREE.Object3D>();
const toonMatCache = new WeakMap<THREE.Material, THREE.MeshToonMaterial>();
const simpleMatCache = new WeakMap<THREE.Material, THREE.MeshBasicMaterial>();

function toonify(original: THREE.Material): THREE.MeshToonMaterial {
  const hit = toonMatCache.get(original);
  if (hit) return hit;
  const src = original as THREE.MeshStandardMaterial;
  const mat = new THREE.MeshToonMaterial({
    color: src.color ? src.color.clone() : new THREE.Color("#ffffff"),
    map: src.map ?? null,
    gradientMap: getToonGradientMap(),
  });
  toonMatCache.set(original, mat);
  return mat;
}

function simplify(original: THREE.Material): THREE.MeshBasicMaterial {
  const hit = simpleMatCache.get(original);
  if (hit) return hit;
  const src = original as THREE.MeshStandardMaterial;
  const mat = new THREE.MeshBasicMaterial({
    color: src.color ? src.color.clone() : new THREE.Color("#ffffff"),
    map: src.map ?? null,
    transparent: true,
    opacity: src.opacity ?? 1,
    depthWrite: false,
  });
  simpleMatCache.set(original, mat);
  return mat;
}

/** Walks the loaded GLTF once: every opaque material becomes a toon
 *  material — the model's hand-painted textures stay as the base color,
 *  just re-lit in flat bands instead of a smooth PBR gradient. Translucent
 *  bits (the propeller's motion-blur disc, a few small glass/blend
 *  accents) are simplified to a plain unlit material instead.
 *
 *  The black ink outline itself is NOT done here as a per-mesh geometry
 *  offset ("inverted hull") — that's the textbook cel-shading trick, but
 *  it assumes reasonably volumetric meshes. This model is ~150 separate
 *  parts and much of it is thin, open, near-zero-thickness panels (fabric
 *  wing skin, strut wires); inflating those from their own center produces
 *  almost no separation between the outline's front and back faces, so the
 *  oversized black shell ends up covering the model instead of rimming it.
 *  A screen-space outline (see the <Outline> postprocessing pass in
 *  HeroScene) sidesteps that entirely — it works from the rendered
 *  silhouette, not the source geometry, so it doesn't care how thin or
 *  open any individual part is. */
function celShade(scene: THREE.Object3D) {
  if (processedScenes.has(scene)) return;
  processedScenes.add(scene);

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mesh = child;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material) return;

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    if ((material as THREE.Material).transparent) {
      mesh.material = simplify(material);
      return;
    }

    mesh.material = toonify(material);
  });
}

/** The real WWI-biplane asset (Sketchfab, painted textures, baked
 *  propeller/wheel animation), re-lit into a flat cel-shaded / ink-outline
 *  read and wired to the same cursor-tracking behavior the previous
 *  procedural plane used: it floats, pitches and yaws toward the pointer. */
export function ToonBiplane() {
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, scene);
  const trackRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  celShade(scene);

  // Recenter + normalize scale from the model's actual bounding box so it
  // rotates around its own visual center regardless of how the source file
  // was pivoted, and reads at a consistent size no matter the export scale.
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const longestAxis = Math.max(size.x, size.y, size.z) || 1;
    const s = 2.6 / longestAxis;
    return { scale: s, offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s) };
  }, [scene]);

  useEffect(() => {
    const clipName = animations[0]?.name;
    const action = clipName ? actions[clipName] : undefined;
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action?.fadeOut(0.3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, animations]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    // The mixer is already advanced by useAnimations' own internal
    // useFrame — this one only handles the cursor-follow tilt/float.
    current.current.x += (target.current.x - current.current.x) * Math.min(1, delta * 2.2);
    current.current.y += (target.current.y - current.current.y) * Math.min(1, delta * 2.2);

    const g = trackRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const boost = warpState.boost;

    g.rotation.y = BASE_YAW - current.current.x * 0.5 + Math.sin(t * 0.35) * 0.05;
    g.rotation.x = BASE_PITCH + current.current.y * 0.24 + Math.sin(t * 0.5) * 0.03 - boost * 0.1;
    g.rotation.z = -current.current.x * 0.16 + Math.sin(t * 9) * boost * 0.05;
    g.position.y = Math.sin(t * 0.6) * 0.14;
    g.position.x = current.current.x * 0.22;

    // Reality Warp boost: the biplane rushes straight at the camera and
    // grows into frame instead of just tilting toward the cursor.
    g.position.z = boost * boost * 5.2;
    const boostScale = 1 + boost * 1.4;
    g.scale.setScalar(boostScale);
  });

  return (
    <group ref={trackRef}>
      <group scale={scale} position={[offset.x, offset.y, offset.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
