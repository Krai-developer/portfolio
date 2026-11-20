import * as THREE from 'three';
import {
  createDeskSurfaceTextures,
  createGlowSpriteTexture,
  createMainMonitorCodeTexture,
  createRadialShadowTexture,
} from './textures';

export interface WorkstationHandle {
  group: THREE.Group;
  monitorScanUniforms: { uTime: { value: number } };
  keyboardGlowUniforms: { uTime: { value: number } };
  dispose: () => void;
}

/**
 * Builds the hero central developer workstation to closely mirror the reference image:
 *  - Wide glossy midnight-blue developer desk with vivid cyan monitor/keyboard reflection smear
 *  - Large central monitor with rounded-corner glowing electric-cyan bezel frame & IDE code
 *  - Luminous holographic cyan keyboard wedge + sleek wireless mouse flooding the desk with cyan light
 *  - Matte dark ceramic coffee mug & slim black notebook resting in the left foreground
 *  - Sleek dark rim-lit ergonomic office chair framing the right foreground
 */
export function buildWorkstation(
  maxAnisotropy: number,
  enableShadows: boolean,
  includeDesk = true,
): WorkstationHandle {
  const root = new THREE.Group();
  root.name = 'CentralWorkstation';

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

  const DESK_HEIGHT = 0.88;
  const DESK_TOP_THICKNESS = 0.068;
  const DESK_SURFACE_Y = DESK_HEIGHT + DESK_TOP_THICKNESS * 0.5;

  const { bumpMap, roughnessMap } = createDeskSurfaceTextures();
  trackTex(bumpMap);
  trackTex(roughnessMap);

  const shadowTex = trackTex(createRadialShadowTexture());
  const contactShadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );

  // Glossy deep sapphire-midnight desktop catching rich cyan reflection sheen (zero dull gray)
  const deskTopMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x041733,
      roughness: 0.11,
      metalness: 0.3,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      bumpMap,
      bumpScale: 0.002,
      roughnessMap,
    }),
  );

  const darkMetalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x081526,
      roughness: 0.34,
      metalness: 0.82,
    }),
  );

  const matteChassisMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x06101e,
      roughness: 0.68,
      metalness: 0.25,
    }),
  );

  const brushedAlumMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e3a5c,
      roughness: 0.26,
      metalness: 0.88,
    }),
  );

  const cyanPoolTex = trackTex(
    createGlowSpriteTexture(
      'rgba(165, 243, 252, 0.9)',
      'rgba(34, 211, 238, 0.45)',
      'rgba(14, 165, 233, 0.12)',
    ),
  );

  // =========================================================================
  // 1. WIDE GLOSSY DEVELOPER DESK WITH DRAMATIC CYAN BOUNCE REFLECTION
  // =========================================================================
  const deskGroup = new THREE.Group();
  deskGroup.name = 'DeveloperDesk';

  // Wide tabletop slab sweeping diagonally through the foreground
  const deskTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.45, DESK_TOP_THICKNESS, 1.65)),
    deskTopMat,
  );
  deskTop.position.set(0.05, DESK_HEIGHT, 0.08);
  deskTop.castShadow = enableShadows;
  deskTop.receiveShadow = enableShadows;
  deskGroup.add(deskTop);

  // Crisp subtle cyan specular rim along the front edge bevel
  const frontBevel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.46, 0.014, 0.018)),
    brushedAlumMat,
  );
  frontBevel.position.set(0.05, DESK_HEIGHT + 0.022, 0.908);
  deskGroup.add(frontBevel);

  // Under-desk solid dark modesty/frame beam
  const underBeam = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.0, 0.09, 1.2)),
    darkMetalMat,
  );
  underBeam.position.set(0.05, DESK_HEIGHT - 0.075, 0.05);
  deskGroup.add(underBeam);

  // Architectural leg slabs
  const legGeo = trackGeo(new THREE.BoxGeometry(0.085, DESK_HEIGHT - 0.04, 1.15));
  for (const sx of [-1.92, 2.02]) {
    const leg = new THREE.Mesh(legGeo, darkMetalMat);
    leg.position.set(sx, (DESK_HEIGHT - 0.04) * 0.5, 0.06);
    deskGroup.add(leg);
  }

  // Vivid electric-cyan specular reflection smear on the glossy desk right in front of monitor & keyboard
  const deskReflectPrimary = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.85, 1.54)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: cyanPoolTex,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  deskReflectPrimary.rotation.x = -Math.PI / 2;
  deskReflectPrimary.position.set(0.02, DESK_SURFACE_Y + 0.003, 0.28);
  deskGroup.add(deskReflectPrimary);

  // Tight intense reflection highlight right under keyboard & monitor front
  const deskReflectHotspot = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.95, 0.78)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: cyanPoolTex,
        transparent: true,
        opacity: 0.76,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  deskReflectHotspot.rotation.x = -Math.PI / 2;
  deskReflectHotspot.position.set(0.02, DESK_SURFACE_Y + 0.004, 0.36);
  deskGroup.add(deskReflectHotspot);

  if (includeDesk) {
    root.add(deskGroup);
  }

  // =========================================================================
  // 2. LARGE CENTRAL MONITOR WITH ROUNDED LUMINOUS CYAN GLASS BEZEL
  // =========================================================================
  const monitorGroup = new THREE.Group();
  monitorGroup.name = 'CentralMonitor';
  monitorGroup.position.set(0.05, DESK_SURFACE_Y, -0.2);

  // Contact shadow under stand
  const monShadow = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.05, 0.56)), contactShadowMat);
  monShadow.rotation.x = -Math.PI / 2;
  monShadow.position.set(0, 0.004, 0.02);
  monitorGroup.add(monShadow);

  // Sleek metallic stand base + curved neck
  const standBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.72, 0.024, 0.34)),
    brushedAlumMat,
  );
  standBase.position.set(0, 0.012, 0.03);
  monitorGroup.add(standBase);

  const standNeck = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 0.44, 0.055)),
    darkMetalMat,
  );
  standNeck.position.set(0, 0.23, -0.09);
  standNeck.rotation.x = -0.14;
  monitorGroup.add(standNeck);

  const MON_W = 1.92;
  const MON_H = 1.18;

  // Dark slim aluminum rear body
  const chassis = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(MON_W + 0.06, MON_H + 0.06, 0.048)),
    matteChassisMat,
  );
  chassis.position.set(0, 0.78, -0.042);
  monitorGroup.add(chassis);

  // Soft wide radiant cyan aura behind the monitor
  const monitorAura = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(MON_W + 1.35, MON_H + 0.95)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: cyanPoolTex,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  monitorAura.position.set(0, 0.78, -0.095);
  monitorGroup.add(monitorAura);

  // Crisp backlit anti-glare OLED IDE display face (no circular point-light specular glare!)
  const codeTex = trackTex(createMainMonitorCodeTexture(maxAnisotropy));
  const screenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: codeTex,
      emissive: 0xffffff,
      emissiveMap: codeTex,
      emissiveIntensity: 1.24,
      roughness: 0.78,
      metalness: 0.0,
    }),
  );
  const screenGeo = trackGeo(new THREE.PlaneGeometry(MON_W, MON_H));
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0.78, -0.014);
  monitorGroup.add(screenMesh);

  // Custom SDF Rounded-Rectangle Luminous Electric-Cyan Glass Frame + Scanline Sweep
  // (Recreates the iconic bright glowing rounded cyan monitor border in the reference image!)
  const monitorScanUniforms = { uTime: { value: 0 } };
  const frameGlowGeo = trackGeo(new THREE.PlaneGeometry(MON_W + 0.24, MON_H + 0.24));
  const frameGlowMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: monitorScanUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;

        float sdRoundedBox(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        void main() {
          vec2 p = vUv - 0.5;
          float d = sdRoundedBox(p, vec2(0.455, 0.44), 0.036);

          // Razor bright cyan-white border line + soft outer volumetric bloom
          float crispLine = exp(-abs(d) * 210.0);
          float softBloom = exp(-abs(d) * 26.0) * 0.58;
          // Extra radiant glow along bottom bezel (mirrors reference image!)
          float bottomBoost = smoothstep(0.05, -0.45, p.y) * exp(-abs(d) * 32.0) * 0.55;

          // Subtle animated holographic scan wave inside screen bounds
          float inside = smoothstep(0.004, -0.004, d);
          float scanPos = fract(-uTime * 0.16);
          float scanBand = smoothstep(0.09, 0.0, abs(vUv.y - scanPos)) * inside * 0.12;

          vec3 cyanCol = vec3(0.16, 0.84, 1.0);
          vec3 coreCol = vec3(0.84, 0.98, 1.0);
          vec3 col = mix(cyanCol, coreCol, crispLine * 0.85);
          float alpha = clamp(crispLine * 0.95 + softBloom + bottomBoost + scanBand, 0.0, 1.0);

          gl_FragColor = vec4(col, alpha);
        }
      `,
    }),
  );
  const frameGlowMesh = new THREE.Mesh(frameGlowGeo, frameGlowMat);
  frameGlowMesh.position.set(0, 0.78, -0.008);
  frameGlowMesh.renderOrder = 5;
  monitorGroup.add(frameGlowMesh);

  root.add(monitorGroup);

  // =========================================================================
  // 3. LUMINOUS CYAN HOLOGRAPHIC KEYBOARD WEDGE & SLEEK MOUSE
  // =========================================================================
  const inputGroup = new THREE.Group();
  inputGroup.name = 'KeyboardAndMouse';
  inputGroup.position.set(0.06, DESK_SURFACE_Y, 0.36);

  // Tilted metallic base wedge
  const kbGroup = new THREE.Group();
  kbGroup.position.set(-0.08, 0.024, 0.04);
  kbGroup.rotation.x = 0.095;

  const kbBase = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.94, 0.022, 0.34)),
    darkMetalMat,
  );
  kbGroup.add(kbBase);

  // Radiant luminous holographic glass keyboard surface shader (matches reference's glowing cyan keyboard!)
  const keyboardGlowUniforms = { uTime: { value: 0 } };
  const kbGlassMat = trackMat(
    new THREE.ShaderMaterial({
      uniforms: keyboardGlowUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;

        float sdBox(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        void main() {
          vec2 p = vUv - 0.5;
          float d = sdBox(p, vec2(0.47, 0.45), 0.04);
          float rim = exp(-abs(d) * 95.0);
          float glow = exp(-abs(d) * 18.0) * 0.55;
          float inside = smoothstep(0.008, -0.008, d);

          // Crisp illuminated keycap grid pattern
          vec2 grid = fract(vec2(vUv.x * 16.0, vUv.y * 5.5));
          float keyBox = step(0.14, grid.x) * step(grid.x, 0.86) * step(0.18, grid.y) * step(grid.y, 0.84);
          float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + vUv.x * 4.0);

          vec3 col = mix(vec3(0.12, 0.78, 1.0), vec3(0.82, 0.98, 1.0), rim * 0.8 + keyBox * 0.35);
          float alpha = clamp((rim * 0.95 + glow + inside * (0.28 + keyBox * 0.48)) * pulse, 0.0, 1.0);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    }),
  );
  const kbGlassTop = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.06, 0.42)), kbGlassMat);
  kbGlassTop.rotation.x = -Math.PI / 2;
  kbGlassTop.position.set(0, 0.015, 0);
  kbGroup.add(kbGlassTop);

  // Subtle physical instanced keycaps underneath the glow for true 3D relief
  const keyGeo = trackGeo(new THREE.BoxGeometry(0.044, 0.01, 0.038));
  const keyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b2542,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.95,
      roughness: 0.3,
      metalness: 0.2,
    }),
  );
  const keyMesh = new THREE.InstancedMesh(keyGeo, keyMat, 60);
  const dummy = new THREE.Object3D();
  let kIdx = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 15; c++) {
      dummy.position.set(-0.39 + c * 0.056, 0.014, -0.09 + r * 0.058);
      dummy.updateMatrix();
      keyMesh.setMatrixAt(kIdx++, dummy.matrix);
    }
  }
  keyMesh.instanceMatrix.needsUpdate = true;
  keyMesh.computeBoundingSphere();
  kbGroup.add(keyMesh);
  inputGroup.add(kbGroup);

  // Ergonomic wireless mouse
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(0.56, 0.014, 0.05);
  const mouseGeo = trackGeo(new THREE.SphereGeometry(0.068, 20, 14));
  mouseGeo.scale(0.84, 0.48, 1.38);
  const mouseBody = new THREE.Mesh(mouseGeo, matteChassisMat);
  mouseBody.position.y = 0.018;
  mouseGroup.add(mouseBody);
  inputGroup.add(mouseGroup);

  root.add(inputGroup);

  // =========================================================================
  // 4. LEFT FOREGROUND ACCESSORIES: CERAMIC COFFEE MUG & MATTE NOTEBOOK
  // =========================================================================
  const mugGroup = new THREE.Group();
  mugGroup.name = 'CoffeeMug';
  mugGroup.position.set(-1.18, DESK_SURFACE_Y, 0.42);

  const mugShadow = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.28, 0.28)), contactShadowMat);
  mugShadow.rotation.x = -Math.PI / 2;
  mugShadow.position.y = 0.004;
  mugGroup.add(mugShadow);

  const mugProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.078, 0.0),
    new THREE.Vector2(0.082, 0.016),
    new THREE.Vector2(0.084, 0.168),
    new THREE.Vector2(0.075, 0.175),
    new THREE.Vector2(0.07, 0.164),
    new THREE.Vector2(0.07, 0.018),
    new THREE.Vector2(0.0, 0.018),
  ];
  const mugMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b1a2e,
      roughness: 0.36,
      metalness: 0.18,
    }),
  );
  mugGroup.add(new THREE.Mesh(trackGeo(new THREE.LatheGeometry(mugProfile, 24)), mugMat));

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.078, 0.14, 0),
    new THREE.Vector3(0.132, 0.13, 0),
    new THREE.Vector3(0.132, 0.048, 0),
    new THREE.Vector3(0.078, 0.042, 0),
  ]);
  mugGroup.add(
    new THREE.Mesh(trackGeo(new THREE.TubeGeometry(handleCurve, 16, 0.011, 10, false)), mugMat),
  );
  root.add(mugGroup);

  // Matte black notebook/tablet right beside the mug (matches reference!)
  const notebookGroup = new THREE.Group();
  notebookGroup.position.set(-0.76, DESK_SURFACE_Y, 0.48);
  notebookGroup.rotation.y = 0.14;
  const nbCover = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.36, 0.022, 0.48)),
    matteChassisMat,
  );
  nbCover.position.y = 0.011;
  notebookGroup.add(nbCover);
  const nbSpine = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.018, 0.024, 0.48)),
    brushedAlumMat,
  );
  nbSpine.position.set(-0.176, 0.011, 0);
  notebookGroup.add(nbSpine);
  root.add(notebookGroup);

  // =========================================================================
  // 5. SLEEK RIM-LIT ERGONOMIC OFFICE CHAIR (close right-foreground silhouette)
  // =========================================================================
  const chairGroup = new THREE.Group();
  chairGroup.name = 'ErgonomicChair';
  chairGroup.position.set(1.16, 0, 1.05);
  chairGroup.rotation.y = -0.64;

  const chairFrameMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b1c33,
      roughness: 0.32,
      metalness: 0.65,
    }),
  );
  const chairMeshMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x050e1c,
      roughness: 0.72,
      metalness: 0.18,
    }),
  );

  // Pneumatic stem + 5-star base (grounded cleanly at y=0)
  const spokeGeo = trackGeo(new THREE.BoxGeometry(0.042, 0.032, 0.34));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = new THREE.Group();
    arm.rotation.y = a;
    const spoke = new THREE.Mesh(spokeGeo, chairFrameMat);
    spoke.position.set(0, 0.08, 0.17);
    spoke.rotation.x = 0.1;
    arm.add(spoke);
    chairGroup.add(arm);
  }
  const stem = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.034, 0.038, 0.48, 16)),
    brushedAlumMat,
  );
  stem.position.y = 0.3;
  chairGroup.add(stem);

  // Seat cushion
  const seat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.66, 0.08, 0.58)), chairMeshMat);
  seat.position.set(0, 0.58, 0.02);
  chairGroup.add(seat);

  // Sculpted dark outer backrest frame + cyan rim-catching brushed edge rails + lumbar curve
  const backSpine = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.11, 0.72, 0.045)),
    chairFrameMat,
  );
  backSpine.position.set(0, 0.92, 0.32);
  backSpine.rotation.x = 0.11;
  chairGroup.add(backSpine);

  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.055, 0.84, 0.044)),
      chairFrameMat,
    );
    rail.position.set(side * 0.31, 1.04, 0.28);
    rail.rotation.x = 0.1;
    chairGroup.add(rail);

    const armPost = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 0.26, 0.045)),
      chairFrameMat,
    );
    armPost.position.set(side * 0.36, 0.68, 0.06);
    chairGroup.add(armPost);

    const armPad = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.085, 0.032, 0.3)),
      chairMeshMat,
    );
    armPad.position.set(side * 0.36, 0.82, 0.04);
    chairGroup.add(armPad);
  }

  const topRail = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.055, 0.048)),
    brushedAlumMat,
  );
  topRail.position.set(0, 1.44, 0.24);
  topRail.rotation.x = 0.1;
  chairGroup.add(topRail);

  const lumbar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.58, 0.048, 0.042)),
    chairFrameMat,
  );
  lumbar.position.set(0, 0.88, 0.3);
  lumbar.rotation.x = 0.1;
  chairGroup.add(lumbar);

  const backMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.56, 0.76, 0.022)),
    chairMeshMat,
  );
  backMesh.position.set(0, 1.04, 0.275);
  backMesh.rotation.x = 0.1;
  chairGroup.add(backMesh);

  root.add(chairGroup);

  return {
    group: root,
    monitorScanUniforms,
    keyboardGlowUniforms,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
