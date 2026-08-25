"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { OrbVisualState } from "@/lib/types";

// Jarvis-chat Orb.jsx shaders + view-space normals so the low-poly
// icosahedron reads as the ice wreath from Screenshot (86).
const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  varying float vDisplacement;
  varying vec3 vViewNormal;

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
    vec3 pos = position;
    float noise1 = snoise(pos * 1.5 + uTime * 0.3);
    float noise2 = snoise(pos * 3.0 + uTime * 0.5);
    float noise3 = snoise(pos * 5.0 + uTime * 0.7);
    float displacement = (noise1 * 0.5 + noise2 * 0.25 + noise3 * 0.125) * uIntensity;
    vDisplacement = displacement;
    pos += normal * displacement;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vDisplacement;
  varying vec3 vViewNormal;

  void main() {
    vec3 n = normalize(vViewNormal);
    float facing = abs(n.z);
    float fresnel = pow(1.0 - facing, 2.4);
    float ridge = abs(vDisplacement) * 2.4;
    vec3 ice = uColor * (0.42 + facing * 0.58);
    vec3 rim = vec3(0.70, 0.96, 1.0);
    vec3 color = ice + rim * (fresnel * 0.95 + ridge * 0.32);
    float alpha = (0.16 + facing * 0.20 + fresnel * 0.58 + ridge * 0.22) * uOpacity;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

// Jarvis-chat Orb.jsx values. Offline is sandbox-only.
const INTENSITY_MAP: Record<OrbVisualState, number> = {
  idle: 0.18,
  listening: 0.32,
  thinking: 0.48,
  talking: 0.38,
  offline: 0.1,
};

const COLOR_MAP: Record<OrbVisualState, THREE.Color> = {
  idle: new THREE.Color("#2ec4d6"),
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
      uOpacity: { value: state === "offline" ? 0.5 : 0.92 },
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
      const targetOpacity = state === "offline" ? 0.5 : 0.92;
      material.uniforms.uOpacity.value +=
        (targetOpacity - material.uniforms.uOpacity.value) * 0.06;
    }
    if (mesh) {
      const spin = state === "offline" ? 0.04 : 1;
      mesh.rotation.y += delta * 0.1 * spin;
      mesh.rotation.x += delta * 0.05 * spin;
    }
  });

  const geometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1.64, 3);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        toneMapped={false}
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

      nextColors[i * 3] = 0.55 + rand() * 0.45;
      nextColors[i * 3 + 1] = 0.82 + rand() * 0.18;
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
        size={0.022}
        vertexColors
        transparent
        toneMapped={false}
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
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
      <torusGeometry args={[2.8, 0.012, 16, 100]} />
      <meshBasicMaterial color="#4dd0e1" transparent opacity={0.22} toneMapped={false} />
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
          alpha: false,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          gl.toneMapping = THREE.NoToneMapping;
          gl.setClearColor("#04070d", 1);
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
