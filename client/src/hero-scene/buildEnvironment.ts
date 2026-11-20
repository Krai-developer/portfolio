import * as THREE from 'three';
import { createCityWindowBackdropTexture, createGlowSpriteTexture } from './textures';

export interface EnvironmentHandle {
  group: THREE.Group;
  amberStripMaterials: THREE.MeshStandardMaterial[];
  dispose: () => void;
}

/**
 * Recreates the exact nighttime architectural loft & telephoto city skyline
 * atmosphere from the reference image:
 *  - Rich deep-cobalt bokeh metropolis panorama outside floor-to-ceiling glass
 *  - Heavy dark architectural window mullions with a glowing vertical warm-orange
 *    LED strip on the left frame
 *  - Far-left dark potted plant silhouette beside the warm strip
 *  - Right-side dark architectural shelving with warm amber under-shelf LED strips
 *    illuminating potted indoor plants
 */
export function buildStudioEnvironment(
  maxAnisotropy: number,
  enableShadows: boolean,
): EnvironmentHandle {
  const root = new THREE.Group();
  root.name = 'StudioEnvironment';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const amberStripMaterials: THREE.MeshStandardMaterial[] = [];

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

  // Deep midnight-sapphire studio floor
  const floorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x020b1c,
      roughness: 0.34,
      metalness: 0.25,
    }),
  );
  const floor = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(26, 18)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0.5);
  floor.receiveShadow = enableShadows;
  root.add(floor);

  const mullionMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x051226,
      roughness: 0.48,
      metalness: 0.65,
    }),
  );

  const wallMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x030e21,
      roughness: 0.76,
      metalness: 0.14,
    }),
  );

  const warmAmberStripMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffa94d,
      emissive: 0xff7b1c,
      emissiveIntensity: 3.4,
      roughness: 0.2,
      metalness: 0.08,
    }),
  );
  amberStripMaterials.push(warmAmberStripMat);

  const warmHaloTex = trackTex(
    createGlowSpriteTexture(
      'rgba(255, 198, 118, 0.92)',
      'rgba(255, 128, 36, 0.44)',
      'rgba(235, 100, 16, 0.12)',
    ),
  );
  const warmHaloMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: warmHaloTex,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  // =========================================================================
  // 1. FLOOR-TO-CEILING GLASS CURTAIN WALL & WARM LEFT VERTICAL LIGHT STRIP
  // =========================================================================
  const WINDOW_Z = -2.85;

  const sill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(18, 0.52, 0.35)), wallMat);
  sill.position.set(0, 0.26, WINDOW_Z);
  root.add(sill);

  const headerBeam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(18, 0.65, 0.45)), wallMat);
  headerBeam.position.set(0, 5.15, WINDOW_Z);
  root.add(headerBeam);

  // Sleek dark window mullions matching reference spacing
  const mullionXPositions = [-6.2, -3.1, 1.35, 3.65];
  const mullionGeo = trackGeo(new THREE.BoxGeometry(0.16, 5.2, 0.26));
  for (const mx of mullionXPositions) {
    const mullion = new THREE.Mesh(mullionGeo, mullionMat);
    mullion.position.set(mx, 2.6, WINDOW_Z);
    root.add(mullion);
  }

  // Right-side architectural column pillar framing the shelving nook
  const rightPillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.65, 5.4, 0.85)), wallMat);
  rightPillar.position.set(3.25, 2.7, -2.45);
  root.add(rightPillar);

  // Signature glowing vertical warm orange/amber light strip on the left window frame
  const leftWarmStrip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.036, 4.75, 0.036)),
    warmAmberStripMat,
  );
  leftWarmStrip.position.set(-3.0, 2.55, WINDOW_Z + 0.14);
  root.add(leftWarmStrip);

  const leftWarmHalo = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.88, 4.95)), warmHaloMat);
  leftWarmHalo.position.set(-2.98, 2.55, WINDOW_Z + 0.2);
  root.add(leftWarmHalo);

  // =========================================================================
  // 2. TELEPHOTO BOKEH NIGHTTIME CITY SKYLINE OUTSIDE THE WINDOWS
  // =========================================================================
  const cityBackdropTex = trackTex(createCityWindowBackdropTexture(maxAnisotropy));
  const cityBackdropMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: cityBackdropTex,
      fog: false,
    }),
  );
  const cityBackdrop = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(26, 13.5)), cityBackdropMat);
  cityBackdrop.position.set(0.2, 3.15, -10.8);
  root.add(cityBackdrop);

  // Subtle volumetric sapphire atmospheric glow wash behind the central workstation
  const blueWashTex = trackTex(
    createGlowSpriteTexture(
      'rgba(34, 211, 238, 0.32)',
      'rgba(14, 116, 200, 0.18)',
      'rgba(6, 40, 88, 0.04)',
    ),
  );
  const blueWash = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(7.2, 4.4)),
    trackMat(
      new THREE.MeshBasicMaterial({
        map: blueWashTex,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  blueWash.position.set(0.15, 2.05, -2.3);
  root.add(blueWash);

  // =========================================================================
  // 3. COMPOSITE POTTED PLANTS & RIGHT-SIDE WARM-LIT ARCHITECTURAL SHELVING
  // =========================================================================
  const potMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0d1b2e,
      roughness: 0.56,
      metalness: 0.12,
    }),
  );
  const leafMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0e2a28,
      roughness: 0.58,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
  );

  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.12, 0),
    new THREE.Vector2(0.155, 0.24),
    new THREE.Vector2(0.14, 0.25),
    new THREE.Vector2(0.11, 0.04),
  ];
  const potGeo = trackGeo(new THREE.LatheGeometry(potProfile, 18));
  const leafGeo = trackGeo(new THREE.ConeGeometry(0.055, 0.42, 5));
  leafGeo.scale(1, 1, 0.2);

  const buildPottedPlant = (scale = 1) => {
    const plant = new THREE.Group();
    const pot = new THREE.Mesh(potGeo, potMat);
    plant.add(pot);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.15;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const tilt = 0.44 + (i % 3) * 0.18;
      leaf.position.set(Math.cos(a) * 0.065, 0.34 + (i % 2) * 0.05, Math.sin(a) * 0.065);
      leaf.rotation.z = -Math.cos(a) * tilt;
      leaf.rotation.x = Math.sin(a) * tilt;
      leaf.rotation.y = a;
      plant.add(leaf);
    }
    plant.scale.setScalar(scale);
    return plant;
  };

  // Left-side console table & lush dark plant silhouette (matches left edge of reference!)
  const leftTable = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 0.85, 0.7)), wallMat);
  leftTable.position.set(-3.35, 0.425, -1.6);
  root.add(leftTable);

  const leftPlant = buildPottedPlant(1.35);
  leftPlant.position.set(-3.2, 0.85, -1.48);
  root.add(leftPlant);

  // Right-side architectural shelving unit with warm amber under-shelf LED bars
  const shelfGroup = new THREE.Group();
  shelfGroup.name = 'ArchitecturalShelving';
  shelfGroup.position.set(3.45, 0, -1.1);
  shelfGroup.rotation.y = -0.58;

  const shelfWoodMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0b1729,
      roughness: 0.52,
      metalness: 0.22,
    }),
  );

  const backPanel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 4.9, 0.16)), wallMat);
  backPanel.position.set(0, 2.45, -0.24);
  shelfGroup.add(backPanel);

  for (const sx of [-0.7, 0.7]) {
    const upright = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.065, 4.8, 0.48)), shelfWoodMat);
    upright.position.set(sx, 2.4, 0);
    shelfGroup.add(upright);
  }

  const shelfHeights = [0.95, 1.92, 2.88, 3.82];
  for (const sy of shelfHeights) {
    const plank = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.058, 0.46)), shelfWoodMat);
    plank.position.set(0, sy, 0);
    shelfGroup.add(plank);

    if (sy > 1.2) {
      const strip = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.22, 0.024, 0.028)),
        warmAmberStripMat,
      );
      strip.position.set(0, sy - 0.036, 0.16);
      shelfGroup.add(strip);

      const shelfBloom = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(1.38, 0.46)),
        warmHaloMat,
      );
      shelfBloom.position.set(0, sy - 0.15, 0.18);
      shelfGroup.add(shelfBloom);
    }
  }

  const shelfPlantLower = buildPottedPlant(0.95);
  shelfPlantLower.position.set(-0.04, 0.98, 0.02);
  shelfGroup.add(shelfPlantLower);

  const shelfPlantUpper = buildPottedPlant(0.95);
  shelfPlantUpper.position.set(0.04, 1.95, 0.02);
  shelfGroup.add(shelfPlantUpper);

  root.add(shelfGroup);

  return {
    group: root,
    amberStripMaterials,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
