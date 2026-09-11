import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX_NOISE_3D } from "./glslNoise";
import { warpState } from "../warp/warpState";

function hexToVec3(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uFrequency;
  uniform float uAmplitude;
  varying float vNoise;
  varying vec3 vNormal;
  varying vec3 vPos;

  ${SIMPLEX_NOISE_3D}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float n = snoise(position * uFrequency * 0.15 + uTime * uSpeed);
    vNoise = n;
    vec3 displaced = position + normal * n * uAmplitude * 0.08;
    vPos = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

// Inspired by the three ShaderGradient presets supplied: a warm/cool
// "cosmic" swirl (teal / amber / periwinkle) and a darker, slower "liquid"
// mood (graphite / violet-grey). Recolored live from the site's own accent
// tokens rather than fixed hex values, so it follows the visitor's chosen
// mode instead of fighting it.
const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uGrain;
  uniform float uWarp;
  varying float vNoise;
  varying vec3 vNormal;
  varying vec3 vPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    float t = clamp(vNoise * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.6, t));
    color = mix(color, uColor3, smoothstep(0.45, 1.0, t));

    // Fresnel-ish rim light for a bit of glassy depth.
    vec3 viewDir = normalize(-vPos);
    float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.2);
    color += rim * 0.22;

    float g = (hash(gl_FragCoord.xy) - 0.5) * uGrain;
    color += g;

    // Reality Warp: the whole field burns toward a white-hot / scorched-
    // orange flash as uWarp ramps 0 -> 1, standing in for the "speed of
    // light" transition without a separate post-process pass.
    vec3 warpColor = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.97, 0.9), 0.45);
    color = mix(color, warpColor, smoothstep(0.0, 1.0, uWarp));

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ShaderBackdropProps {
  color1: string;
  color2: string;
  color3: string;
  speed?: number;
  frequency?: number;
  amplitude?: number;
  grain?: number;
  radius?: number;
  position?: [number, number, number];
}

/** A large low-poly sphere with vertex-displaced, noise-blended color —
 *  the "cosmic gradient" backdrop from the brief, done as a live shader
 *  instead of a baked GIF so it recolors instantly with the site's mode
 *  switcher and never repeats. */
export function ShaderBackdrop({
  color1,
  color2,
  color3,
  speed = 0.12,
  frequency = 1,
  amplitude = 1,
  grain = 0.035,
  radius = 4.2,
  position = [0, 0, -2],
}: ShaderBackdropProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uFrequency: { value: frequency },
      uAmplitude: { value: amplitude },
      uGrain: { value: grain },
      uWarp: { value: 0 },
      uColor1: { value: new THREE.Vector3(...hexToVec3(color1)) },
      uColor2: { value: new THREE.Vector3(...hexToVec3(color2)) },
      uColor3: { value: new THREE.Vector3(...hexToVec3(color3)) },
    }),
    // Only built once — colors are updated in place below on every change
    // instead of rebuilding the material, so a mode switch never causes a
    // shader recompile/hitch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uColor1.value.set(...hexToVec3(color1));
    uniforms.uColor2.value.set(...hexToVec3(color2));
    uniforms.uColor3.value.set(...hexToVec3(color3));
  }, [color1, color2, color3, uniforms]);

  useFrame((_, delta) => {
    const boost = warpState.boost;
    uniforms.uTime.value += delta * (1 + boost * 9);
    uniforms.uFrequency.value = frequency * (1 + boost * 2.5);
    uniforms.uWarp.value = boost;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.02 + boost * 0.45);
      meshRef.current.rotation.x += delta * (0.006 + boost * 0.16);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[radius, 24]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
