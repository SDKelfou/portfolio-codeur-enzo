import * as THREE from "three";

let cached: THREE.DataTexture | null = null;

/** Small 4-step lookup texture for MeshToonMaterial's gradientMap, built
 *  procedurally instead of fetched as an image — keeps the cel-shaded look
 *  self-contained (no external asset dependency, consistent with the rest
 *  of this project). NearestFilter keeps the bands hard-edged/flat, which
 *  is the whole point of a comic/toon read instead of a smooth PBR one. */
export function getToonGradientMap(): THREE.DataTexture {
  if (cached) return cached;
  // eslint-disable-next-line prettier/prettier
  const steps = new Uint8Array([
    88, 88, 88, 255,
    150, 150, 150, 255,
    212, 212, 212, 255,
    255, 255, 255, 255,
  ]);
  const tex = new THREE.DataTexture(steps, 4, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}
