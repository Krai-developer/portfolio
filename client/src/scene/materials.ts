import * as THREE from 'three';
import type { ProceduralTextureSet } from './textures';
import { ATMOSPHERE_THEMES, FINISH_SPECS, type AtmosphereId, type FinishId } from './types';

export interface SceneMaterialLibrary {
  primaryMetal: THREE.MeshPhysicalMaterial;
  secondaryMatte: THREE.MeshStandardMaterial;
  accentMetal: THREE.MeshPhysicalMaterial;
  vernierMaterial: THREE.MeshStandardMaterial;
  coreCrystal: THREE.MeshPhysicalMaterial;
  glassDome: THREE.MeshPhysicalMaterial;
  beaconLens: THREE.MeshStandardMaterial;
  beaconLensActive: THREE.MeshStandardMaterial;
  floorMaterial: THREE.MeshStandardMaterial;
  pillarMaterial: THREE.MeshStandardMaterial;
  moteMaterial: THREE.MeshStandardMaterial;
  contactShadowMaterial: THREE.MeshBasicMaterial;
  applyFinish: (finishId: FinishId) => void;
  applyAtmosphere: (atmosphereId: AtmosphereId) => void;
  updateShaderTime: (elapsed: number, waveEnergy: number, pointerX: number, pointerZ: number) => void;
  dispose: () => void;
}

export function createMaterialLibrary(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): SceneMaterialLibrary {
  const initialFinish = FINISH_SPECS.gold;
  const initialTheme = ATMOSPHERE_THEMES.obsidian;

  // 1. Primary brushed anisotropic metal (outer gimbal, collars, trim)
  const primaryMetal = new THREE.MeshPhysicalMaterial({
    color: initialFinish.primaryColor,
    metalness: initialFinish.primaryMetalness,
    roughness: initialFinish.primaryRoughness,
    roughnessMap: textures.brushedRoughness,
    anisotropy: initialFinish.primaryAnisotropy,
    anisotropyRotation: Math.PI * 0.25,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.25,
  });

  // 2. Secondary matte structural material (plinth, cradle, inner housings)
  // Roughness delta >= 0.35 relative to primaryMetal for sharp adjacent read
  const secondaryMatte = new THREE.MeshStandardMaterial({
    color: initialFinish.secondaryColor,
    metalness: initialFinish.secondaryMetalness,
    roughness: initialFinish.secondaryRoughness,
    roughnessMap: textures.brushedRoughness,
    envMapIntensity: 0.85,
  });

  // 3. Accent metal (counterweights, struts, inner gimbal details)
  const accentMetal = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.96,
    roughness: 0.14,
    anisotropy: 0.7,
    clearcoat: 0.4,
    envMapIntensity: 1.35,
  });

  // 4. Precision Vernier dial band (polygonOffset prevents coplanar Z-fighting)
  const vernierMaterial = new THREE.MeshStandardMaterial({
    map: textures.vernierDial,
    metalness: 0.55,
    roughness: 0.35,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // 5. Core crystal (high-IOR transmissive optical crystal with software-GL fallback)
  const coreCrystal = new THREE.MeshPhysicalMaterial({
    color: initialFinish.coreColor,
    metalness: 0.05,
    roughness: 0.06,
    transmission: isSoftwareGl ? 0 : 0.92,
    transparent: true,
    opacity: isSoftwareGl ? 0.52 : 1.0,
    ior: 1.75,
    thickness: 1.6,
    attenuationDistance: 1.8,
    attenuationColor: new THREE.Color(initialFinish.coreAttenuation),
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
  });

  // 6. Outer optical glass dome (depthWrite: false for clean interior sorting)
  const glassDome = new THREE.MeshPhysicalMaterial({
    color: 0xeef6ff,
    metalness: 0.0,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.9,
    transparent: true,
    opacity: isSoftwareGl ? 0.2 : 0.32,
    ior: 1.52,
    thickness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    depthWrite: false,
    envMapIntensity: 1.4,
  });

  // 7. Beacon optical lenses
  const beaconLens = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: new THREE.Color(0xd97706),
    emissiveIntensity: 1.1,
    roughness: 0.15,
    metalness: 0.2,
  });

  const beaconLensActive = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: new THREE.Color(0xfbbf24),
    emissiveIntensity: 2.4,
    roughness: 0.1,
    metalness: 0.1,
  });

  // 8. Sculpted architectural floor with PBR + onBeforeCompile subtle contour ripple
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: initialTheme.floorColor,
    map: textures.floorGrid,
    roughness: 0.72,
    metalness: 0.18,
    envMapIntensity: 0.75,
  });

  floorMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWaveEnergy = { value: 0.65 };
    shader.uniforms.uPointer = { value: new THREE.Vector2(0, 0) };
    floorMaterial.userData.shader = shader;

    shader.vertexShader =
      `
      uniform float uTime;
      uniform float uWaveEnergy;
      uniform vec2 uPointer;
      ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float radialDist = length(position.xz);
      float ptrDist = length(position.xz - uPointer);
      float ambientWave = sin(radialDist * 0.45 - uTime * 1.1) * 0.045 * uWaveEnergy;
      float cursorDip = exp(-ptrDist * ptrDist * 0.045) * -0.18 * uWaveEnergy;
      float outerBowl = smoothstep(5.5, 28.0, radialDist) * 0.35;
      transformed.y += (ambientWave + cursorDip) * smoothstep(3.2, 6.0, radialDist) + outerBowl;
      `,
    );
  };

  // 9. Monolith field material (uses instanceColor tinting)
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.38,
    roughnessMap: textures.brushedRoughness,
    envMapIntensity: 1.0,
  });

  // 10. Floating dust motes
  const moteMaterial = new THREE.MeshStandardMaterial({
    color: initialTheme.moteColor,
    emissive: new THREE.Color(initialTheme.moteColor),
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.4,
  });

  // 11. Contact shadow plane material
  const contactShadowMaterial = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  const allMaterials = [
    primaryMetal,
    secondaryMatte,
    accentMetal,
    vernierMaterial,
    coreCrystal,
    glassDome,
    beaconLens,
    beaconLensActive,
    floorMaterial,
    pillarMaterial,
    moteMaterial,
    contactShadowMaterial,
  ];

  return {
    primaryMetal,
    secondaryMatte,
    accentMetal,
    vernierMaterial,
    coreCrystal,
    glassDome,
    beaconLens,
    beaconLensActive,
    floorMaterial,
    pillarMaterial,
    moteMaterial,
    contactShadowMaterial,
    applyFinish: (finishId: FinishId) => {
      const spec = FINISH_SPECS[finishId];
      primaryMetal.color.setHex(spec.primaryColor);
      primaryMetal.metalness = spec.primaryMetalness;
      primaryMetal.roughness = spec.primaryRoughness;
      primaryMetal.anisotropy = spec.primaryAnisotropy;

      secondaryMatte.color.setHex(spec.secondaryColor);
      secondaryMatte.metalness = spec.secondaryMetalness;
      secondaryMatte.roughness = spec.secondaryRoughness;

      coreCrystal.color.setHex(spec.coreColor);
      coreCrystal.attenuationColor.setHex(spec.coreAttenuation);
    },
    applyAtmosphere: (atmosphereId: AtmosphereId) => {
      const theme = ATMOSPHERE_THEMES[atmosphereId];
      floorMaterial.color.setHex(theme.floorColor);
      const baseHexStr = `#${theme.floorColor.toString(16).padStart(6, '0')}`;
      textures.updateFloorGridColor(theme.floorAccentColor, baseHexStr);

      moteMaterial.color.setHex(theme.moteColor);
      moteMaterial.emissive.setHex(theme.moteColor);

      beaconLens.color.setHex(theme.pillarHighlightColor);
      beaconLens.emissive.setHex(theme.pillarHighlightColor);
      contactShadowMaterial.opacity = theme.isDarkUi ? 0.58 : 0.34;
    },
    updateShaderTime: (elapsed: number, waveEnergy: number, pointerX: number, pointerZ: number) => {
      const shader = floorMaterial.userData.shader;
      if (shader) {
        shader.uniforms.uTime.value = elapsed;
        shader.uniforms.uWaveEnergy.value = waveEnergy;
        shader.uniforms.uPointer.value.set(pointerX, pointerZ);
      }
    },
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
