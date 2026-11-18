import * as THREE from 'three';
import type { SceneMaterialLibrary } from './materials';
import { BEACON_METADATA } from './types';

export interface KineticOrreryRig {
  group: THREE.Group;
  plinthGroup: THREE.Group;
  outerGimbal: THREE.Group;
  innerGimbal: THREE.Group;
  harmonicArmAssembly: THREE.Group;
  coreAssembly: THREE.Group;
  coreCrystal: THREE.Mesh;
  containmentDome: THREE.Mesh;
  disposables: THREE.BufferGeometry[];
}

export interface OrbitingBeaconRig {
  group: THREE.Group;
  hitProxy: THREE.Mesh;
  lensMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  baseAngle: number;
  baseHeight: number;
  bobPhase: number;
  index: number;
  disposables: THREE.BufferGeometry[];
}

export interface MonolithInstanceData {
  x: number;
  z: number;
  baseHeight: number;
  phase: number;
  radialDist: number;
  baseTintFactor: number;
}

export interface MonolithFieldRig {
  mesh: THREE.InstancedMesh;
  instances: MonolithInstanceData[];
  geometry: THREE.BufferGeometry;
}

export interface MoteFieldRig {
  mesh: THREE.InstancedMesh;
  positions: Float32Array;
  speeds: Float32Array;
  scales: Float32Array;
  geometry: THREE.BufferGeometry;
}

function createNotchedRingGeometry(
  innerR: number,
  outerR: number,
  depth: number,
  notches: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const segments = notches * 4;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const step = i % 4;
    const r = step === 1 || step === 2 ? outerR + 0.08 : outerR;
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  const hole = new THREE.Path();
  const holeSegs = 64;
  for (let i = 0; i <= holeSegs; i++) {
    const t = (i / holeSegs) * Math.PI * 2;
    const x = Math.cos(t) * innerR;
    const y = Math.sin(t) * innerR;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 48,
  });
  geo.center();
  geo.computeVertexNormals();
  geo.computeTangents();
  return geo;
}

function createHexBevelPillarGeometry(radius: number, height: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 2,
  });
  // Rotate so extrusion axis (+Z) points along +Y, and pivot at bottom-center (y = 0)
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  if (geo.boundingBox) {
    const minY = geo.boundingBox.min.y;
    geo.translate(0, -minY, 0);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createKineticOrrery(materials: SceneMaterialLibrary): KineticOrreryRig {
  const disposables: THREE.BufferGeometry[] = [];
  const root = new THREE.Group();
  root.name = 'KineticOrrery';

  // 1. Grounded stepped architectural plinth (LatheGeometry, bottom-center pivot y=0)
  const plinthGroup = new THREE.Group();
  const plinthPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(3.15, 0.0),
    new THREE.Vector2(3.15, 0.14),
    new THREE.Vector2(2.85, 0.2),
    new THREE.Vector2(2.85, 0.36),
    new THREE.Vector2(2.35, 0.44),
    new THREE.Vector2(2.35, 0.6),
    new THREE.Vector2(1.75, 0.68),
    new THREE.Vector2(0.0, 0.68),
  ];
  const plinthGeo = new THREE.LatheGeometry(plinthPoints, 64);
  plinthGeo.computeVertexNormals();
  disposables.push(plinthGeo);
  const plinthMesh = new THREE.Mesh(plinthGeo, materials.secondaryMatte);
  plinthMesh.castShadow = true;
  plinthMesh.receiveShadow = true;
  plinthGroup.add(plinthMesh);

  // 2. Plinth metallic trim collar (LatheGeometry)
  const collarPoints = [
    new THREE.Vector2(1.72, 0.66),
    new THREE.Vector2(1.92, 0.66),
    new THREE.Vector2(1.92, 0.76),
    new THREE.Vector2(1.62, 0.82),
    new THREE.Vector2(1.52, 0.82),
    new THREE.Vector2(1.52, 0.66),
  ];
  const collarGeo = new THREE.LatheGeometry(collarPoints, 64);
  collarGeo.computeVertexNormals();
  disposables.push(collarGeo);
  const collarMesh = new THREE.Mesh(collarGeo, materials.primaryMetal);
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  plinthGroup.add(collarMesh);

  // 3. Pedestal cradle support fins (3 radial extruded brackets)
  const finShape = new THREE.Shape();
  finShape.moveTo(0.85, 0.78);
  finShape.lineTo(1.65, 0.78);
  finShape.lineTo(1.85, 1.48);
  finShape.lineTo(1.48, 1.62);
  finShape.lineTo(1.05, 1.12);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  finGeo.translate(0, 0, -0.07);
  finGeo.computeVertexNormals();
  disposables.push(finGeo);

  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(finGeo, materials.secondaryMatte);
    fin.rotation.y = (i / 3) * Math.PI * 2;
    fin.castShadow = true;
    fin.receiveShadow = true;
    plinthGroup.add(fin);
  }

  root.add(plinthGroup);

  // 4. Outer machined gimbal ring (ExtrudeGeometry with bevels & perimeter notches)
  const outerGimbal = new THREE.Group();
  outerGimbal.position.set(0, 3.05, 0);

  const outerRingGeo = createNotchedRingGeometry(2.15, 2.46, 0.18, 24);
  disposables.push(outerRingGeo);
  const outerRingMesh = new THREE.Mesh(outerRingGeo, materials.primaryMetal);
  outerRingMesh.castShadow = true;
  outerRingMesh.receiveShadow = true;
  outerGimbal.add(outerRingMesh);

  // 5. Vernier degree band mounted flush on outer gimbal perimeter
  const vernierGeo = new THREE.CylinderGeometry(2.49, 2.49, 0.14, 72, 1, true);
  vernierGeo.rotateX(Math.PI / 2);
  disposables.push(vernierGeo);
  const vernierMesh = new THREE.Mesh(vernierGeo, materials.vernierMaterial);
  outerGimbal.add(vernierMesh);

  // 6. Tapered radial bearing struts connecting outer to inner gimbal (LatheGeometry)
  const strutPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.07, 0.0),
    new THREE.Vector2(0.045, 0.22),
    new THREE.Vector2(0.06, 0.42),
    new THREE.Vector2(0.03, 0.54),
    new THREE.Vector2(0.0, 0.54),
  ];
  const strutGeo = new THREE.LatheGeometry(strutPoints, 16);
  strutGeo.computeVertexNormals();
  disposables.push(strutGeo);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const strut = new THREE.Mesh(strutGeo, materials.accentMetal);
    strut.position.set(Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0);
    strut.rotation.z = angle + Math.PI / 2;
    strut.castShadow = true;
    outerGimbal.add(strut);
  }

  root.add(outerGimbal);

  // 7. Inner orthogonal gimbal ring
  const innerGimbal = new THREE.Group();
  innerGimbal.position.set(0, 3.05, 0);
  const innerRingGeo = createNotchedRingGeometry(1.48, 1.72, 0.14, 16);
  disposables.push(innerRingGeo);
  const innerRingMesh = new THREE.Mesh(innerRingGeo, materials.secondaryMatte);
  innerRingMesh.castShadow = true;
  innerRingMesh.receiveShadow = true;
  innerGimbal.add(innerRingMesh);

  // Inner metallic accent bezel ring
  const bezelGeo = new THREE.TorusGeometry(1.6, 0.045, 16, 64);
  disposables.push(bezelGeo);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.primaryMetal);
  bezelMesh.position.z = 0.09;
  innerGimbal.add(bezelMesh);

  root.add(innerGimbal);

  // 8. Curved harmonic counterweight arms (TubeGeometry + LatheGeometry teardrops)
  const harmonicArmAssembly = new THREE.Group();
  harmonicArmAssembly.position.set(0, 3.05, 0);

  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.3, 0),
    new THREE.Vector3(0.95, -0.85, 0.35),
    new THREE.Vector3(1.22, 0.0, 0.0),
    new THREE.Vector3(0.95, 0.85, -0.35),
    new THREE.Vector3(0, 1.3, 0),
  ]);
  const armGeo = new THREE.TubeGeometry(armCurve, 40, 0.045, 12, false);
  disposables.push(armGeo);

  const weightPoints = [
    new THREE.Vector2(0.0, -0.22),
    new THREE.Vector2(0.11, -0.14),
    new THREE.Vector2(0.15, 0.0),
    new THREE.Vector2(0.09, 0.16),
    new THREE.Vector2(0.0, 0.24),
  ];
  const weightGeo = new THREE.LatheGeometry(weightPoints, 24);
  weightGeo.computeVertexNormals();
  disposables.push(weightGeo);

  for (let i = 0; i < 3; i++) {
    const subArm = new THREE.Group();
    subArm.rotation.y = (i / 3) * Math.PI * 2;
    const tube = new THREE.Mesh(armGeo, materials.accentMetal);
    tube.castShadow = true;
    subArm.add(tube);

    const weight = new THREE.Mesh(weightGeo, materials.primaryMetal);
    weight.position.set(1.22, 0, 0);
    weight.castShadow = true;
    subArm.add(weight);

    harmonicArmAssembly.add(subArm);
  }

  root.add(harmonicArmAssembly);

  // 9. Central Core Crystal & 10. Optical Containment Dome
  const coreAssembly = new THREE.Group();
  coreAssembly.position.set(0, 3.05, 0);

  const coreGeo = new THREE.IcosahedronGeometry(0.68, 0);
  disposables.push(coreGeo);
  const coreCrystal = new THREE.Mesh(coreGeo, materials.coreCrystal);
  coreCrystal.castShadow = true;
  coreCrystal.renderOrder = 2;
  coreAssembly.add(coreCrystal);

  // Precision equatorial collar around crystal
  const coreCollarGeo = new THREE.TorusGeometry(0.76, 0.025, 12, 48);
  coreCollarGeo.rotateX(Math.PI / 2);
  disposables.push(coreCollarGeo);
  const coreCollar = new THREE.Mesh(coreCollarGeo, materials.primaryMetal);
  coreAssembly.add(coreCollar);

  const domeGeo = new THREE.SphereGeometry(1.02, 36, 24);
  disposables.push(domeGeo);
  const containmentDome = new THREE.Mesh(domeGeo, materials.glassDome);
  containmentDome.renderOrder = 5;
  coreAssembly.add(containmentDome);

  root.add(coreAssembly);

  return {
    group: root,
    plinthGroup,
    outerGimbal,
    innerGimbal,
    harmonicArmAssembly,
    coreAssembly,
    coreCrystal,
    containmentDome,
    disposables,
  };
}

export function createOrbitingBeacon(
  index: number,
  materials: SceneMaterialLibrary,
): OrbitingBeaconRig {
  const disposables: THREE.BufferGeometry[] = [];
  const group = new THREE.Group();
  group.name = BEACON_METADATA[index]?.id ?? `beacon-${index}`;

  // 1. Beveled housing ring
  const housingGeo = createNotchedRingGeometry(0.32, 0.48, 0.08, 8);
  housingGeo.rotateX(Math.PI / 2);
  disposables.push(housingGeo);
  const ringMesh = new THREE.Mesh(housingGeo, materials.primaryMetal);
  ringMesh.castShadow = true;
  group.add(ringMesh);

  // 2. Tapered central spindle (LatheGeometry)
  const spindlePoints = [
    new THREE.Vector2(0.0, -0.46),
    new THREE.Vector2(0.06, -0.32),
    new THREE.Vector2(0.16, -0.1),
    new THREE.Vector2(0.18, 0.08),
    new THREE.Vector2(0.05, 0.34),
    new THREE.Vector2(0.0, 0.48),
  ];
  const spindleGeo = new THREE.LatheGeometry(spindlePoints, 20);
  spindleGeo.computeVertexNormals();
  disposables.push(spindleGeo);
  const spindleMesh = new THREE.Mesh(spindleGeo, materials.secondaryMatte);
  spindleMesh.castShadow = true;
  group.add(spindleMesh);

  // 3. Optical core lens
  const lensGeo = new THREE.OctahedronGeometry(0.19, 1);
  disposables.push(lensGeo);
  const lensMesh = new THREE.Mesh(lensGeo, materials.beaconLens);
  group.add(lensMesh);

  // 4. Twin stabilizer fins
  const finGeo = new THREE.BoxGeometry(0.04, 0.38, 0.16);
  disposables.push(finGeo);
  for (let s = -1; s <= 1; s += 2) {
    const fin = new THREE.Mesh(finGeo, materials.accentMetal);
    fin.position.set(s * 0.48, 0, 0);
    group.add(fin);
  }

  // 5. Simplified invisible raycast hit proxy on layer 1
  const proxyGeo = new THREE.SphereGeometry(0.75, 10, 10);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  disposables.push(proxyGeo);
  const hitProxy = new THREE.Mesh(proxyGeo, proxyMat);
  hitProxy.layers.set(1);
  hitProxy.userData.beaconIndex = index;
  group.add(hitProxy);

  const radii = [6.2, 7.6, 6.8, 8.2];
  const heights = [3.6, 2.7, 4.4, 3.2];
  const speeds = [0.22, -0.17, 0.19, -0.15];

  return {
    group,
    hitProxy,
    lensMesh,
    ringMesh,
    orbitRadius: radii[index % radii.length],
    orbitSpeed: speeds[index % speeds.length],
    baseAngle: (index / 4) * Math.PI * 2 + 0.4,
    baseHeight: heights[index % heights.length],
    bobPhase: index * 1.57,
    index,
    disposables,
  };
}

export function createMonolithField(materials: SceneMaterialLibrary): MonolithFieldRig {
  const geometry = createHexBevelPillarGeometry(0.46, 1.0);
  const instances: MonolithInstanceData[] = [];

  // Hexagonal radial amphitheater grid outside central plinth (radius 4.4 to 22)
  const spacingX = 1.55;
  const spacingZ = 1.35;
  const cols = 22;
  const rows = 22;

  for (let r = -rows / 2; r <= rows / 2; r++) {
    for (let c = -cols / 2; c <= cols / 2; c++) {
      const offsetX = (r % 2) * (spacingX * 0.5);
      const x = c * spacingX + offsetX;
      const z = r * spacingZ;
      const dist = Math.hypot(x, z);
      if (dist < 4.5 || dist > 18.5) continue;

      // Architectural amphitheater stepping + organic variation
      const ringHeight = 0.35 + ((dist - 4.5) / 14.0) * 2.2;
      const harmonicVar = Math.sin(x * 0.55) * Math.cos(z * 0.55) * 0.45;
      const baseHeight = Math.max(0.22, ringHeight + harmonicVar);
      const tintFactor = 0.85 + ((Math.abs(Math.sin(c * 12.9898 + r * 78.233)) * 43758.5453) % 1) * 0.3;

      instances.push({
        x,
        z,
        baseHeight,
        phase: (c * 0.37 + r * 0.51) % (Math.PI * 2),
        radialDist: dist,
        baseTintFactor: tintFactor,
      });
    }
  }

  const mesh = new THREE.InstancedMesh(geometry, materials.pillarMaterial, instances.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < instances.length; i++) {
    const inst = instances[i];
    dummy.position.set(inst.x, 0, inst.z);
    dummy.scale.set(1, inst.baseHeight, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.setHex(0x151b26).multiplyScalar(inst.baseTintFactor);
    mesh.setColorAt(i, color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.frustumCulled = false;

  return { mesh, instances, geometry };
}

export function createAtmosphericMotes(materials: SceneMaterialLibrary): MoteFieldRig {
  const count = 220;
  const geometry = new THREE.OctahedronGeometry(0.045, 0);
  const mesh = new THREE.InstancedMesh(geometry, materials.moteMaterial, count);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;

  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const scales = new Float32Array(count);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const radius = 2.5 + ((i * 7.13) % 17.5);
    const y = 0.6 + ((i * 3.71) % 8.5);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    speeds[i] = 0.3 + ((i * 1.37) % 0.9);
    scales[i] = 0.6 + ((i * 0.89) % 1.1);

    dummy.position.set(x, y, z);
    dummy.scale.setScalar(scales[i]);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();

  return { mesh, positions, speeds, scales, geometry };
}
