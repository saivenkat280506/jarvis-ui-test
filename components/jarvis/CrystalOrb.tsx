"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { OrbVisualState } from "@/lib/types";

const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vDisplacement;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float noise1 = snoise(pos * 1.5 + uTime * 0.3);
    float noise2 = snoise(pos * 3.0 + uTime * 0.5);
    float noise3 = snoise(pos * 5.0 + uTime * 0.7);

    float displacement = (noise1 * 0.5 + noise2 * 0.25 + noise3 * 0.125) * uIntensity;
    vDisplacement = displacement;

    pos += normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vDisplacement;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vec3(0.0, 0.0, 1.0)), vec3(0.0, 0.0, 1.0))), 2.0);
    float glow = fresnel * 0.8 + vDisplacement * 0.5;
    vec3 color = uColor + vec3(0.2, 0.4, 0.6) * glow;
    float alpha = (0.3 + fresnel * 0.4 + glow * 0.3) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

const INTENSITY_MAP: Record<OrbVisualState, number> = {
  idle: 0.34,
  listening: 0.48,
  thinking: 0.62,
  talking: 0.52,
  offline: 0.14,
};

const COLOR_MAP: Record<OrbVisualState, THREE.Color> = {
  idle: new THREE.Color("#4dd0e1"),
  listening: new THREE.Color("#6ee7ff"),
  thinking: new THREE.Color("#49b3ff"),
  talking: new THREE.Color("#8cefff"),
  offline: new THREE.Color("#64748b"),
};

function OrbMesh({ state }: { state: OrbVisualState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: INTENSITY_MAP[state] },
      uColor: { value: COLOR_MAP[state].clone() },
      uOpacity: { value: state === "offline" ? 0.55 : 0.85 },
    }),
    // created once; state is lerped in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    if (material) {
      material.uniforms.uTime.value += delta;
      const targetIntensity = INTENSITY_MAP[state];
      material.uniforms.uIntensity.value +=
        (targetIntensity - material.uniforms.uIntensity.value) * 0.05;
      material.uniforms.uColor.value.lerp(COLOR_MAP[state], 0.03);
      const targetOpacity = state === "offline" ? 0.55 : 0.85;
      material.uniforms.uOpacity.value +=
        (targetOpacity - material.uniforms.uOpacity.value) * 0.06;
    }
    if (mesh) {
      const spin = state === "offline" ? 0.04 : 1;
      mesh.rotation.y += delta * 0.1 * spin;
      mesh.rotation.x += delta * 0.05 * spin;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.85, 6]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1500;
    const nextPositions = new Float32Array(count * 3);
    const nextColors = new Float32Array(count * 3);
    let seed = 280506;

    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const radius = 2.2 + rand() * 1.2;

      nextPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      nextPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      nextPositions[i * 3 + 2] = radius * Math.cos(phi);

      nextColors[i * 3] = 0.3 + rand() * 0.3;
      nextColors[i * 3 + 1] = 0.8 + rand() * 0.2;
      nextColors[i * 3 + 2] = 0.9 + rand() * 0.1;
    }

    return { positions: nextPositions, colors: nextColors };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Ring({ speed }: { speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * speed;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.8, 0.015, 16, 100]} />
      <meshBasicMaterial color="#4dd0e1" transparent opacity={0.25} />
    </mesh>
  );
}

function getRingSpeed(state: OrbVisualState) {
  if (state === "listening") return 0.8;
  if (state === "thinking") return 1.5;
  if (state === "talking") return 1.2;
  if (state === "offline") return 0.12;
  return 0.3;
}

type CrystalOrbProps = {
  state?: OrbVisualState;
  className?: string;
};

export default function CrystalOrb({
  state = "idle",
  className,
}: CrystalOrbProps) {
  const ringSpeed = getRingSpeed(state);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const canvas = glRef.current?.domElement;
    if (!canvas) return;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setTimeout(() => glRef.current?.forceContextRestore(), 1);
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    return () =>
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
  }, []);

  return (
    <div className={className ?? "absolute inset-0"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          glRef.current = gl;
        }}
      >
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <OrbMesh state={state} />
        </Float>
        <Particles />
        <Ring speed={ringSpeed} />
      </Canvas>
    </div>
  );
}
