import * as THREE from 'three';
import {
  createArchitectureDiagramTexture,
  createGlowSpriteTexture,
  createLeftCodePanelTexture,
  createRightMetricsPanelTexture,
  createTerminalCardTexture,
} from './textures';
import { Vec3Tuple } from './heroKinematics';

export interface HoloPanelInstance {
  id: string;
  label: string;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  basePos: Vec3Tuple;
  baseRot: Vec3Tuple;
  depthFactor: number;
  phase: number;
  shaderUniforms: {
    uTime: { value: number };
    uHover: { value: number };
    uMap: { value: THREE.Texture };
  };
}

export interface AiStructureInstance {
  id: string;
  group: THREE.Group;
  outerMesh: THREE.Object3D;
  innerMesh: THREE.Object3D;
  coreMesh: THREE.Mesh;
  coreGlow: THREE.Sprite;
  basePos: Vec3Tuple;
  spinSpeed: Vec3Tuple;
  phase: number;
  isWarm: boolean;
}

export interface HologramsHandle {
  group: THREE.Group;
  panels: HoloPanelInstance[];
  structures: AiStructureInstance[];
  neuralUniforms: { uTime: { value: number } };
  dustUniforms: { uTime: { value: number } };
  beamUniforms: { uTime: { value: number } };
  interactables: THREE.Object3D[];
  dispose: () => void;
}

/**
 * Builds all floating holographic glass interfaces, AI geometric structures,
 * ethereal dotted neural network trails, and soft bokeh atmospheric particles
 * as genuine independent 3D objects closely matching the reference image.
 */
export function buildHolographicLayer(maxAnisotropy: number): HologramsHandle {
  const root = new THREE.Group();
  root.name = 'HolographicLayer';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const cyanGlowTex = trackTex(
    createGlowSpriteTexture(
      'rgba(235, 252, 255, 1)',
      'rgba(34, 211, 238, 0.72)',
      'rgba(14, 165, 233, 0.16)',
    ),
  );
  const amberGlowTex = trackTex(
    createGlowSpriteTexture(
      'rgba(255, 248, 224, 1)',
      'rgba(251, 166, 56, 0.74)',
      'rgba(245, 130, 20, 0.16)',
    ),
  );

  // =========================================================================
  // 1. FLOATING ROUNDED-GLASS HOLOGRAPHIC PANELS (Custom SDF Glass + Rim Glow)
  // =========================================================================
  const panelSpecs: Array<{
    id: string;
    label: string;
    width: number;
    height: number;
    cornerRadius: number;
    pos: Vec3Tuple;
    rot: Vec3Tuple;
    depthFactor: number;
    phase: number;
    tex: THREE.CanvasTexture;
  }> = [
    {
      id: 'left-code',
      label: 'AI Pipeline Code',
      width: 0.96,
      height: 1.56,
      cornerRadius: 0.036,
      pos: { x: -1.36, y: 2.28, z: -0.06 },
      rot: { x: 0.02, y: 0.24, z: 0 },
      depthFactor: 1.05,
      phase: 0.3,
      tex: trackTex(createLeftCodePanelTexture(maxAnisotropy)),
    },
    {
      id: 'left-architecture',
      label: 'System Architecture Diagram',
      width: 1.04,
      height: 0.7,
      cornerRadius: 0.04,
      pos: { x: -1.16, y: 1.38, z: 0.14 },
      rot: { x: -0.02, y: 0.25, z: 0 },
      depthFactor: 1.22,
      phase: 1.4,
      tex: trackTex(createArchitectureDiagramTexture(maxAnisotropy)),
    },
    {
      id: 'right-metrics',
      label: 'Neural Evaluation & Metrics',
      width: 1.02,
      height: 1.38,
      cornerRadius: 0.036,
      pos: { x: 1.32, y: 2.24, z: -0.2 },
      rot: { x: 0.02, y: -0.22, z: 0 },
      depthFactor: 0.98,
      phase: 2.6,
      tex: trackTex(createRightMetricsPanelTexture(maxAnisotropy)),
    },
    {
      id: 'right-terminal',
      label: 'Distributed Cluster Stream',
      width: 0.66,
      height: 0.46,
      cornerRadius: 0.044,
      pos: { x: 1.12, y: 1.24, z: 0.14 },
      rot: { x: -0.03, y: -0.2, z: 0 },
      depthFactor: 1.16,
      phase: 3.9,
      tex: trackTex(createTerminalCardTexture(maxAnisotropy)),
    },
  ];

  const panels: HoloPanelInstance[] = [];
  const interactables: THREE.Object3D[] = [];

  const HOLO_VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const HOLO_FRAG = `
    varying vec2 vUv;
    uniform sampler2D uMap;
    uniform float uTime;
    uniform float uHover;
    uniform float uRadius;
    uniform float uAspect;

    float sdRoundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    void main() {
      // Plane is padded by 1.18x so outer cyan glow fades smoothly without hard clipping
      float padScale = 1.0 / 1.18;
      vec2 p = vUv - 0.5;

      // Aspect-corrected SDF so corner radius is circular, not stretched
      vec2 pCorr = vec2(p.x * uAspect, p.y);
      vec2 bCorr = vec2(0.5 * padScale * uAspect, 0.5 * padScale);
      float d = sdRoundedBox(pCorr, bCorr, uRadius);

      float inside = smoothstep(0.004, -0.004, d);

      // Map texture strictly inside the glass panel bounds
      vec2 texUv = p / padScale + 0.5;
      vec4 texSample = vec4(0.0);
      if (texUv.x >= 0.0 && texUv.x <= 1.0 && texUv.y >= 0.0 && texUv.y <= 1.0) {
        texSample = texture2D(uMap, texUv);
      }

      // Frosted cobalt-sapphire translucent glass base
      float vGrad = mix(0.28, 0.16, texUv.y);
      vec3 glassBase = vec3(0.025, 0.145, 0.31) * (1.0 + uHover * 0.25);

      // Crisp luminous electric-cyan rounded border + smooth outer volumetric glow
      float crispBorder = exp(-abs(d) * 215.0);
      float innerRim = exp(-max(-d, 0.0) * 32.0) * inside * 0.34;
      float outerGlow = exp(-max(d, 0.0) * 24.0) * 0.44;
      float cornerBoost = smoothstep(0.0, -0.04, d) * 0.05;

      // Subtle animated holographic scan wave
      float sweepPos = fract(-uTime * 0.19);
      float scanBand = smoothstep(0.095, 0.0, abs(texUv.y - sweepPos)) * inside * (0.14 + uHover * 0.1);

      // Boost UI content luminance so code lines & diagrams glow crisply
      vec3 uiCol = texSample.rgb * 1.24;
      float uiAlpha = texSample.a;

      vec3 borderCol = mix(vec3(0.18, 0.85, 1.0), vec3(0.88, 0.99, 1.0), crispBorder * 0.82);

      // Composite frosted glass + crisp UI + glowing cyan edges
      vec3 innerCol = mix(glassBase, uiCol, clamp(uiAlpha * 1.08, 0.0, 1.0));
      innerCol += vec3(0.16, 0.84, 1.0) * (innerRim + scanBand + cornerBoost);

      float innerAlpha = inside * clamp(vGrad + uiAlpha * 0.84 + innerRim * 0.4 + scanBand, 0.0, 0.96);
      float glowAlpha = (crispBorder * (0.94 + uHover * 0.15) + outerGlow * (0.85 + uHover * 0.35));

      vec3 finalCol = innerCol * innerAlpha + borderCol * glowAlpha;
      float finalAlpha = clamp(innerAlpha + glowAlpha * 0.82, 0.0, 1.0);

      if (finalAlpha < 0.004) discard;
      gl_FragColor = vec4(finalCol / max(finalAlpha, 0.001), finalAlpha);
    }
  `;

  for (const spec of panelSpecs) {
    const pGroup = new THREE.Group();
    pGroup.name = `HoloPanel_${spec.id}`;
    pGroup.position.set(spec.pos.x, spec.pos.y, spec.pos.z);
    pGroup.rotation.set(spec.rot.x, spec.rot.y, spec.rot.z);

    const shaderUniforms = {
      uTime: { value: spec.phase },
      uHover: { value: 0 },
      uMap: { value: spec.tex },
      uRadius: { value: spec.cornerRadius },
      uAspect: { value: spec.width / spec.height },
    };

    const panelGeo = trackGeo(new THREE.PlaneGeometry(spec.width * 1.18, spec.height * 1.18));
    const panelMat = trackMat(
      new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader: HOLO_VERT,
        fragmentShader: HOLO_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );

    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.renderOrder = 6;
    panelMesh.userData = { holoId: spec.id, holoLabel: spec.label };
    pGroup.add(panelMesh);
    interactables.push(panelMesh);

    root.add(pGroup);
    panels.push({
      id: spec.id,
      label: spec.label,
      group: pGroup,
      hitMesh: panelMesh,
      basePos: spec.pos,
      baseRot: spec.rot,
      depthFactor: spec.depthFactor,
      phase: spec.phase,
      shaderUniforms,
    });
  }

  // =========================================================================
  // 2. AI GEOMETRIC STRUCTURES (4 Iconic Structures Matching Reference Image)
  // =========================================================================
  const structures: AiStructureInstance[] = [];

  const cyanWireMat = trackMat(
    new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    }),
  );
  const cyanBrightWireMat = trackMat(
    new THREE.LineBasicMaterial({
      color: 0xdcf8ff,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
    }),
  );
  const amberWireMat = trackMat(
    new THREE.LineBasicMaterial({
      color: 0xfdba74,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    }),
  );
  const amberBrightWireMat = trackMat(
    new THREE.LineBasicMaterial({
      color: 0xffedd5,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
    }),
  );

  const cyanGlassFillMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const cyanBrightFacetMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const amberGlassFillMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );

  const coreSphereGeo = trackGeo(new THREE.SphereGeometry(0.068, 20, 20));
  const beamUniforms = { uTime: { value: 0 } };

  const makeCore = (isWarm: boolean, coreScale = 1, haloScale = 1.05) => {
    const coreMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: isWarm ? 0xfff8e6 : 0xf4fdff,
      }),
    );
    const coreMesh = new THREE.Mesh(coreSphereGeo, coreMat);
    coreMesh.scale.setScalar(coreScale);

    const spriteMat = trackMat(
      new THREE.SpriteMaterial({
        map: isWarm ? amberGlowTex : cyanGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.96,
      }),
    );
    const coreGlow = new THREE.Sprite(spriteMat);
    coreGlow.scale.set(haloScale, haloScale, 1);
    return { coreMesh, coreGlow };
  };

  // (A) TOP-CENTER NESTED ISOMETRIC CUBE + VERTICAL RISING DATA COLUMN ABOVE MONITOR
  {
    const g = new THREE.Group();
    g.name = 'AiStructure_TopCube';
    const basePos: Vec3Tuple = { x: 0.04, y: 2.94, z: -0.22 };
    g.position.set(basePos.x, basePos.y, basePos.z);

    // Classic isometric tilt so cube silhouette reads as luminous glowing hexagon!
    const outerMesh = new THREE.Group();
    outerMesh.rotation.set(Math.atan(Math.SQRT1_2), Math.PI / 4, 0);

    const outerCubeGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.46, 0.46));
    outerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(outerCubeGeo)), cyanBrightWireMat));
    outerMesh.add(new THREE.Mesh(outerCubeGeo, cyanGlassFillMat));

    // Subtle warm golden top-edge accent glint (echoing the subtle orange corner highlight in reference!)
    const warmAccentGeo = trackGeo(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.23, 0.23, 0.23),
        new THREE.Vector3(0.23, 0.23, 0.23),
        new THREE.Vector3(0.23, 0.23, 0.23),
        new THREE.Vector3(0.23, 0.23, -0.23),
      ]),
    );
    outerMesh.add(new THREE.LineSegments(warmAccentGeo, amberWireMat));
    g.add(outerMesh);

    const innerMesh = new THREE.Group();
    innerMesh.rotation.set(Math.atan(Math.SQRT1_2), Math.PI / 4, 0);
    const innerCubeGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24));
    innerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(innerCubeGeo)), cyanBrightWireMat));
    innerMesh.add(new THREE.Mesh(innerCubeGeo, cyanBrightFacetMat));
    g.add(innerMesh);

    const { coreMesh, coreGlow } = makeCore(false, 0.78, 0.86);
    g.add(coreMesh, coreGlow);

    // Volumetric cyan projection beam + rising vertical data-rain streaks connecting to monitor top
    const beamGeo = trackGeo(new THREE.PlaneGeometry(0.74, 0.88));
    const beamMat = trackMat(
      new THREE.ShaderMaterial({
        uniforms: beamUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: HOLO_VERT,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;

          float hash(float n) { return fract(sin(n) * 43758.5453123); }

          void main() {
            float horiz = smoothstep(0.5, 0.05, abs(vUv.x - 0.5));
            float vert = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.15, vUv.y);

            // Soft volumetric light shafts
            float shafts = 0.62 + 0.38 * sin(vUv.x * 54.0 + 0.8);
            float baseGlow = horiz * horiz * vert * shafts * 0.42;

            // Fine rising digital data-rain specks inside the beam
            float colIdx = floor(vUv.x * 26.0);
            float colRand = hash(colIdx * 17.3);
            float colX = fract(vUv.x * 26.0) - 0.5;
            float speed = 0.35 + colRand * 0.55;
            float yCell = fract(vUv.y * 9.0 - uTime * speed + colRand * 10.0) - 0.5;
            float speck = exp(-(colX * colX * 36.0 + yCell * yCell * 16.0)) * horiz * vert * 0.72;

            vec3 col = mix(vec3(0.14, 0.78, 1.0), vec3(0.84, 0.98, 1.0), speck);
            float alpha = clamp(baseGlow + speck, 0.0, 1.0);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    );
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, -0.46, -0.02);
    beam.renderOrder = 4;
    g.add(beam);

    root.add(g);
    structures.push({
      id: 'top-cube',
      group: g,
      outerMesh,
      innerMesh,
      coreMesh,
      coreGlow,
      basePos,
      spinSpeed: { x: 0.04, y: 0.2, z: 0.02 },
      phase: 0.2,
      isWarm: false,
    });
  }

  // (B) LEFT FLOATING ISOMETRIC WIREFRAME HEX-CUBE WITH LUMINOUS CYAN DISC CORE
  {
    const g = new THREE.Group();
    g.name = 'AiStructure_LeftCube';
    const basePos: Vec3Tuple = { x: -2.26, y: 2.58, z: -0.3 };
    g.position.set(basePos.x, basePos.y, basePos.z);

    const outerMesh = new THREE.Group();
    outerMesh.rotation.set(Math.atan(Math.SQRT1_2), Math.PI / 4, 0);

    const cubeGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.48, 0.48));
    outerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(cubeGeo)), cyanBrightWireMat));
    outerMesh.add(new THREE.Mesh(cubeGeo, cyanGlassFillMat));

    // Internal isometric spoke lattice connecting opposite corners (matches reference's hexagonal web!)
    const spokePts: THREE.Vector3[] = [
      new THREE.Vector3(-0.24, -0.24, -0.24), new THREE.Vector3(0.24, 0.24, 0.24),
      new THREE.Vector3(0.24, -0.24, -0.24), new THREE.Vector3(-0.24, 0.24, 0.24),
      new THREE.Vector3(-0.24, 0.24, -0.24), new THREE.Vector3(0.24, -0.24, 0.24),
      new THREE.Vector3(-0.24, -0.24, 0.24), new THREE.Vector3(0.24, 0.24, -0.24),
    ];
    outerMesh.add(
      new THREE.LineSegments(trackGeo(new THREE.BufferGeometry().setFromPoints(spokePts)), cyanBrightWireMat),
    );
    g.add(outerMesh);

    // Bright cyan inner ring / core disc
    const innerMesh = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.145, 0.024, 12, 32)),
      trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xa5f3fc,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    g.add(innerMesh);

    const { coreMesh, coreGlow } = makeCore(false, 1.15, 1.32);
    g.add(coreMesh, coreGlow);

    root.add(g);
    structures.push({
      id: 'left-cube',
      group: g,
      outerMesh,
      innerMesh,
      coreMesh,
      coreGlow,
      basePos,
      spinSpeed: { x: 0.04, y: -0.18, z: 0.02 },
      phase: 1.7,
      isWarm: false,
    });
  }

  // (C) UPPER-RIGHT CRYSTALLINE GLOWING CYAN PYRAMID (signature reference landmark!)
  {
    const g = new THREE.Group();
    g.name = 'AiStructure_RightPyramid';
    const basePos: Vec3Tuple = { x: 2.18, y: 2.66, z: -0.34 };
    g.position.set(basePos.x, basePos.y, basePos.z);

    const pyrGeo = trackGeo(new THREE.ConeGeometry(0.46, 0.74, 4));
    const outerMesh = new THREE.Group();
    outerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(pyrGeo)), cyanBrightWireMat));
    outerMesh.add(new THREE.Mesh(pyrGeo, cyanBrightFacetMat));

    // Internal crystalline pyramid sub-ribs & inverted core tetra-cage
    const midPyrGeo = trackGeo(new THREE.ConeGeometry(0.3, 0.48, 4));
    outerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(midPyrGeo)), cyanWireMat));

    const invPyrGeo = trackGeo(new THREE.ConeGeometry(0.24, 0.36, 4));
    invPyrGeo.rotateX(Math.PI);
    const invPyr = new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(invPyrGeo)), cyanBrightWireMat);
    invPyr.position.y = -0.07;
    outerMesh.add(invPyr);
    g.add(outerMesh);

    // Subtle delicate orbital ring halo around upper pyramid
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.46, 0.005, 8, 44));
    const innerMesh = new THREE.Mesh(
      ringGeo,
      trackMat(
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.48,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
    innerMesh.rotation.x = Math.PI * 0.44;
    innerMesh.position.y = 0.06;
    g.add(innerMesh);

    const { coreMesh, coreGlow } = makeCore(false, 1.12, 1.32);
    coreMesh.position.y = -0.06;
    coreGlow.position.y = -0.06;
    g.add(coreMesh, coreGlow);

    // Faint vertical cyan data-drip threads descending beneath the pyramid
    const dripGeo = trackGeo(new THREE.PlaneGeometry(0.54, 0.56));
    const dripMat = trackMat(
      new THREE.ShaderMaterial({
        uniforms: beamUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: HOLO_VERT,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            float horiz = smoothstep(0.5, 0.06, abs(vUv.x - 0.5));
            float vert = smoothstep(0.0, 0.7, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
            float lines = pow(0.5 + 0.5 * sin(vUv.x * 68.0), 6.0);
            float drop = 0.55 + 0.45 * sin(vUv.y * 18.0 + uTime * 2.4 + vUv.x * 20.0);
            float alpha = horiz * vert * lines * drop * 0.48;
            gl_FragColor = vec4(0.24, 0.86, 1.0, alpha);
          }
        `,
      }),
    );
    const drip = new THREE.Mesh(dripGeo, dripMat);
    drip.position.set(0, -0.58, 0);
    g.add(drip);

    root.add(g);
    structures.push({
      id: 'right-pyramid',
      group: g,
      outerMesh,
      innerMesh,
      coreMesh,
      coreGlow,
      basePos,
      spinSpeed: { x: 0.03, y: 0.36, z: 0.02 },
      phase: 3.1,
      isWarm: false,
    });
  }

  // (D) LOWER-RIGHT WARM AMBER-GOLD GEODESIC ORB (signature warm accent!)
  {
    const g = new THREE.Group();
    g.name = 'AiStructure_WarmNode';
    const basePos: Vec3Tuple = { x: 2.34, y: 1.54, z: -0.2 };
    g.position.set(basePos.x, basePos.y, basePos.z);

    const geoOuter = trackGeo(new THREE.IcosahedronGeometry(0.32, 1));
    const outerMesh = new THREE.Group();
    outerMesh.add(new THREE.LineSegments(trackGeo(new THREE.EdgesGeometry(geoOuter)), amberWireMat));
    outerMesh.add(new THREE.Mesh(geoOuter, amberGlassFillMat));
    g.add(outerMesh);

    const geoInner = trackGeo(new THREE.IcosahedronGeometry(0.19, 0));
    const innerMesh = new THREE.LineSegments(
      trackGeo(new THREE.EdgesGeometry(geoInner)),
      amberBrightWireMat,
    );
    g.add(innerMesh);

    const { coreMesh, coreGlow } = makeCore(true, 1.0, 1.18);
    g.add(coreMesh, coreGlow);

    root.add(g);
    structures.push({
      id: 'warm-node',
      group: g,
      outerMesh,
      innerMesh,
      coreMesh,
      coreGlow,
      basePos,
      spinSpeed: { x: -0.16, y: 0.3, z: 0.12 },
      phase: 4.5,
      isWarm: true,
    });
  }

  // =========================================================================
  // 3. ETHEREAL DOTTED NEURAL NETWORK TRAILS (Custom GLSL Traveling-Wave Points)
  // =========================================================================
  const curveDefs: Array<{ pts: Vec3Tuple[]; isWarm: boolean; speed: number; phase: number; density: number }> = [
    // Left hex-cube -> Left tall code panel (upper arc)
    {
      pts: [
        { x: -2.18, y: 2.52, z: -0.32 },
        { x: -1.85, y: 2.42, z: -0.22 },
        { x: -1.52, y: 2.46, z: -0.12 },
      ],
      isWarm: false,
      speed: 0.32,
      phase: 0.1,
      density: 46,
    },
    // Left hex-cube -> Left tall code panel (lower wispy arc)
    {
      pts: [
        { x: -2.2, y: 2.34, z: -0.32 },
        { x: -1.84, y: 2.18, z: -0.24 },
        { x: -1.5, y: 2.16, z: -0.1 },
      ],
      isWarm: false,
      speed: 0.26,
      phase: 0.55,
      density: 40,
    },
    // Left tall code panel -> Top center cube (high sweeping arc)
    {
      pts: [
        { x: -0.94, y: 2.86, z: -0.14 },
        { x: -0.48, y: 3.24, z: -0.28 },
        { x: -0.16, y: 3.04, z: -0.22 },
      ],
      isWarm: false,
      speed: 0.38,
      phase: 0.28,
      density: 56,
    },
    // Left tall code panel -> Top center cube (mid-arc)
    {
      pts: [
        { x: -0.92, y: 2.58, z: -0.12 },
        { x: -0.46, y: 2.74, z: -0.24 },
        { x: -0.16, y: 2.84, z: -0.22 },
      ],
      isWarm: false,
      speed: 0.31,
      phase: 0.78,
      density: 50,
    },
    // Top center cube -> Upper-right metrics panel (upper neural arc)
    {
      pts: [
        { x: 0.24, y: 2.94, z: -0.22 },
        { x: 0.65, y: 2.88, z: -0.34 },
        { x: 0.96, y: 2.66, z: -0.22 },
      ],
      isWarm: false,
      speed: 0.36,
      phase: 0.42,
      density: 54,
    },
    // Top center cube -> Upper-right metrics panel (lower neural wave)
    {
      pts: [
        { x: 0.26, y: 2.76, z: -0.22 },
        { x: 0.64, y: 2.52, z: -0.28 },
        { x: 0.98, y: 2.46, z: -0.22 },
      ],
      isWarm: false,
      speed: 0.29,
      phase: 0.88,
      density: 48,
    },
    // Upper-right metrics panel -> Glowing crystal pyramid
    {
      pts: [
        { x: 1.56, y: 2.76, z: -0.24 },
        { x: 1.84, y: 3.04, z: -0.36 },
        { x: 2.04, y: 2.78, z: -0.34 },
      ],
      isWarm: false,
      speed: 0.42,
      phase: 0.16,
      density: 48,
    },
    // Glowing pyramid -> Lower-right warm amber geodesic orb (graceful S-drop)
    {
      pts: [
        { x: 2.24, y: 2.34, z: -0.32 },
        { x: 2.46, y: 2.08, z: -0.28 },
        { x: 2.36, y: 1.82, z: -0.22 },
      ],
      isWarm: true,
      speed: 0.3,
      phase: 0.52,
      density: 46,
    },
    // Lower-right warm orb -> Right metrics/cluster area
    {
      pts: [
        { x: 2.04, y: 1.54, z: -0.18 },
        { x: 1.72, y: 1.52, z: -0.12 },
        { x: 1.44, y: 1.44, z: 0.04 },
      ],
      isWarm: true,
      speed: 0.28,
      phase: 0.2,
      density: 38,
    },
    // Left architecture panel -> Central monitor
    {
      pts: [
        { x: -0.72, y: 1.38, z: 0.14 },
        { x: -0.45, y: 1.46, z: 0.02 },
        { x: -0.22, y: 1.54, z: -0.14 },
      ],
      isWarm: false,
      speed: 0.34,
      phase: 0.68,
      density: 36,
    },
  ];

  // Deterministic PRNG for organic micro-scatter along curves
  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const neuralPositions: number[] = [];
  const neuralProgress: number[] = [];
  const neuralSpeed: number[] = [];
  const neuralPhase: number[] = [];
  const neuralWarm: number[] = [];
  const neuralSize: number[] = [];

  for (const def of curveDefs) {
    const curve = new THREE.CatmullRomCurve3(
      def.pts.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
    );
    const pts = curve.getSpacedPoints(def.density);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const t = i / Math.max(1, pts.length - 1);
      // Slight ethereal scatter on a few secondary micro-sparks
      const scatter = i % 4 === 0 ? 0.032 : 0.008;
      neuralPositions.push(
        p.x + (rand() - 0.5) * scatter,
        p.y + (rand() - 0.5) * scatter,
        p.z + (rand() - 0.5) * scatter,
      );
      neuralProgress.push(t);
      neuralSpeed.push(def.speed);
      neuralPhase.push(def.phase);
      neuralWarm.push(def.isWarm ? 1 : 0);
      neuralSize.push(i % 5 === 0 ? 5.8 : 3.4);
    }
  }

  const neuralGeo = trackGeo(new THREE.BufferGeometry());
  neuralGeo.setAttribute('position', new THREE.Float32BufferAttribute(neuralPositions, 3));
  neuralGeo.setAttribute('aProgress', new THREE.Float32BufferAttribute(neuralProgress, 1));
  neuralGeo.setAttribute('aSpeed', new THREE.Float32BufferAttribute(neuralSpeed, 1));
  neuralGeo.setAttribute('aPhase', new THREE.Float32BufferAttribute(neuralPhase, 1));
  neuralGeo.setAttribute('aWarm', new THREE.Float32BufferAttribute(neuralWarm, 1));
  neuralGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(neuralSize, 1));

  const neuralUniforms = { uTime: { value: 0 } };
  const neuralMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: neuralUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aProgress;
        attribute float aSpeed;
        attribute float aPhase;
        attribute float aWarm;
        attribute float aSize;
        uniform float uTime;
        varying float vPulse;
        varying float vWarm;

        void main() {
          // Two traveling light pulses gliding smoothly along each dotted spline
          float p1 = fract(uTime * aSpeed + aPhase);
          float p2 = fract(uTime * aSpeed + aPhase + 0.5);
          float d1 = min(abs(aProgress - p1), 1.0 - abs(aProgress - p1));
          float d2 = min(abs(aProgress - p2), 1.0 - abs(aProgress - p2));
          float pulse = exp(-d1 * 18.0) + exp(-d2 * 18.0);

          vPulse = clamp(pulse, 0.0, 1.4);
          vWarm = aWarm;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float ptSize = (aSize + vPulse * 7.5) * (5.2 / max(-mvPosition.z, 1.2));
          gl_PointSize = clamp(ptSize, 1.8, 16.0);
        }
      `,
      fragmentShader: `
        varying float vPulse;
        varying float vWarm;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float r2 = dot(c, c);
          if (r2 > 0.25) discard;
          float core = exp(-r2 * 22.0);
          vec3 cyan = vec3(0.32, 0.88, 1.0);
          vec3 amber = vec3(1.0, 0.74, 0.36);
          vec3 baseCol = mix(cyan, amber, vWarm);
          vec3 col = mix(baseCol, vec3(0.95, 0.99, 1.0), clamp(vPulse * 0.72, 0.0, 0.92));
          float alpha = core * (0.48 + vPulse * 0.65);
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
    }),
  );
  const neuralPoints = new THREE.Points(neuralGeo, neuralMat);
  neuralPoints.renderOrder = 7;
  root.add(neuralPoints);

  // =========================================================================
  // 4. SOFT BOKEH ATMOSPHERIC PARTICLES & DATA MOTES (170 Glowing Round Points)
  // =========================================================================
  const DUST_COUNT = 170;
  const dustBasePos = new Float32Array(DUST_COUNT * 3);
  const dustMeta = new Float32Array(DUST_COUNT * 4); // speed, phase, size, isWarm

  for (let i = 0; i < DUST_COUNT; i++) {
    dustBasePos[i * 3 + 0] = -3.4 + rand() * 6.8;
    dustBasePos[i * 3 + 1] = 0.78 + rand() * 2.95;
    dustBasePos[i * 3 + 2] = -1.6 + rand() * 2.9;

    dustMeta[i * 4 + 0] = 0.16 + rand() * 0.42;
    dustMeta[i * 4 + 1] = rand() * Math.PI * 2;
    dustMeta[i * 4 + 2] = 2.6 + rand() * 5.2;
    dustMeta[i * 4 + 3] = rand() > 0.8 ? 1.0 : 0.0;
  }

  const dustGeo = trackGeo(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustBasePos, 3));
  dustGeo.setAttribute('aMeta', new THREE.BufferAttribute(dustMeta, 4));

  const dustUniforms = { uTime: { value: 0 } };
  const dustMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec4 aMeta;
        uniform float uTime;
        varying float vWarm;
        varying float vTwinkle;

        void main() {
          float speed = aMeta.x;
          float phase = aMeta.y;
          float size = aMeta.z;
          vWarm = aMeta.w;

          vec3 pos = position;
          pos.y = 0.78 + mod(pos.y - 0.78 + uTime * speed * 0.14, 2.95);
          pos.x += sin(uTime * 0.55 + phase) * 0.09;
          pos.z += cos(uTime * 0.48 + phase) * 0.07;

          vTwinkle = 0.55 + 0.45 * sin(uTime * 1.9 + phase * 2.0);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(size * (5.0 / max(-mvPosition.z, 1.2)), 1.6, 13.0);
        }
      `,
      fragmentShader: `
        varying float vWarm;
        varying float vTwinkle;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float r2 = dot(c, c);
          if (r2 > 0.25) discard;
          float soft = exp(-r2 * 18.0);
          vec3 col = mix(vec3(0.36, 0.88, 1.0), vec3(1.0, 0.76, 0.4), vWarm);
          gl_FragColor = vec4(col, soft * 0.62 * vTwinkle);
        }
      `,
    }),
  );
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.renderOrder = 5;
  root.add(dustPoints);

  return {
    group: root,
    panels,
    structures,
    neuralUniforms,
    dustUniforms,
    beamUniforms,
    interactables,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
