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
    clearcoat: 0.45,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.65,
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

  // 5. Core crystal (luminous glossy optical crystal without expensive extra transmission render pass)
  const coreCrystal = new THREE.MeshPhysicalMaterial({
    color: initialFinish.coreColor,
    emissive: new THREE.Color(initialFinish.coreAttenuation),
    emissiveIntensity: 0.55,
    metalness: 0.14,
    roughness: 0.05,
    transparent: true,
    opacity: 0.78,
    ior: 1.75,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.0,
  });

  // 6. Outer optical glass dome (depthWrite: false for clean interior sorting, zero transmission pass overhead)
  const glassDome = new THREE.MeshPhysicalMaterial({
    color: 0xeef6ff,
    metalness: 0.05,
    roughness: 0.08,
    transparent: true,
    opacity: isSoftwareGl ? 0.2 : 0.26,
    ior: 1.52,
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

  // 8. Sculpted architectural floor (honed dark obsidian stone catching metallic reflections)
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: initialTheme.floorColor,
    map: textures.floorGrid,
    roughnessMap: textures.brushedRoughness,
    roughness: 0.44,
    metalness: 0.46,
    envMapIntensity: 1.25,
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

  // 9. Monolith field material (anodized dark metallic sheen catching warm & cool speculars)
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.30,
    metalness: 0.68,
    roughnessMap: textures.brushedRoughness,
    envMapIntensity: 1.35,
  });

  // 10. Floating dust motes
  const moteMaterial = new THREE.MeshStandardMaterial({
    color: initialTheme.moteColor,
    emissive: new THREE.Color(initialTheme.moteColor),
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.4,
  });

  // 11. Contact shadow plane material (grounds the central plinth realistically without shadow-map pass)
  const contactShadowMaterial = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.72,
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
