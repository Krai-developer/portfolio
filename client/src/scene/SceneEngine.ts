import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { SpatialAudioSynth } from './audio';
import { createMaterialLibrary, type SceneMaterialLibrary } from './materials';
import {
  createAtmosphericMotes,
  createKineticOrrery,
  createMonolithField,
  createOrbitingBeacon,
  type KineticOrreryRig,
  type MonolithFieldRig,
  type MoteFieldRig,
  type OrbitingBeaconRig,
} from './models';
import { createProceduralTextures, type ProceduralTextureSet } from './textures';
import {
  ATMOSPHERE_THEMES,
  BEACON_METADATA,
  type CameraPresetId,
  type InteractiveBeaconInfo,
  type SceneConfig,
} from './types';

// Module-scope zero-GC scratch objects
const _vec3 = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _mat4 = new THREE.Matrix4();
const _euler = new THREE.Euler();
const _color = new THREE.Color();
const _baseColor = new THREE.Color();
const _hiColor = new THREE.Color();
const _bgTarget = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _pointerNdc = new THREE.Vector2(0, 0);
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hitPoint = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _tiltAxis = new THREE.Vector3();

interface Shockwave {
  x: number;
  z: number;
  age: number;
  strength: number;
}

interface CameraTargetState {
  active: boolean;
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const CAMERA_PRESETS: Record<CameraPresetId, { pos: [number, number, number]; lookAt: [number, number, number] }> = {
  overview: { pos: [11.5, 6.8, 13.5], lookAt: [0, 2.3, 0] },
  sculpture: { pos: [4.6, 3.6, 5.4], lookAt: [0, 3.05, 0] },
  horizon: { pos: [14.2, 2.1, 7.8], lookAt: [0, 2.8, 0] },
  zenith: { pos: [0.01, 18.5, 4.2], lookAt: [0, 1.5, 0] },
};

export interface SceneEngineCallbacks {
  onBeaconSelect: (beacon: InteractiveBeaconInfo | null) => void;
  onContextLostChange: (lost: boolean) => void;
}

export class SceneEngine {
  private container: HTMLElement;
  private callbacks: SceneEngineCallbacks;
  private isSoftwareGl: boolean;
  private reducedMotion: boolean;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private envTexture: THREE.Texture;

  private textures: ProceduralTextureSet;
  private materials: SceneMaterialLibrary;
  private audio: SpatialAudioSynth;

  private keyLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;
  private rectLights: THREE.RectAreaLight[] = [];

  private floorGeo: THREE.PlaneGeometry;
  private floorMesh: THREE.Mesh;
  private contactShadowGeo: THREE.PlaneGeometry;
  private contactShadowMesh: THREE.Mesh;

  private orrery: KineticOrreryRig;
  private beacons: OrbitingBeaconRig[] = [];
  private beaconProxies: THREE.Object3D[] = [];
  private monolithField: MonolithFieldRig;
  private motes: MoteFieldRig;

  private config: SceneConfig;
  private currentExplode = 0;
  private hoveredBeaconIndex: number | null = null;
  private selectedBeaconIndex: number | null = null;
  private lastHoverCheckMs = 0;

  private pointerWorld = new THREE.Vector2(0, 0);
  private pointerTargetWorld = new THREE.Vector2(0, 0);
  private pointerActive = false;
  private pointerDownPos = { x: 0, y: 0 };
  private shockwaves: Shockwave[] = [];

  private cameraTransition: CameraTargetState = {
    active: false,
    pos: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
  };

  private scrollTargetProgress = 0;
  private scrollCurrentProgress = 0;
  private scrollChoreographyActive = true;

  private frameId = 0;
  private lastTimestamp = 0;
  private elapsed = 0;
  private disposed = false;

  private boundResize: () => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundPointerLeave: () => void;
  private boundContextLost: (e: Event) => void;
  private boundContextRestored: () => void;

  constructor(
    container: HTMLElement,
    initialConfig: SceneConfig,
    callbacks: SceneEngineCallbacks,
  ) {
    this.container = container;
    this.config = { ...initialConfig };
    this.callbacks = callbacks;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(1, container.clientWidth || window.innerWidth);
    const height = Math.max(1, container.clientHeight || window.innerHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    const theme = ATMOSPHERE_THEMES[this.config.atmosphere];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(theme.bgColor);
    this.scene.fog = new THREE.FogExp2(theme.bgColor, theme.fogDensity);

    // Mandatory RoomEnvironment + PMREMGenerator on every device
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    pmremGenerator.dispose();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 140);
    const preset = CAMERA_PRESETS[this.config.cameraPreset];
    this.camera.position.set(...preset.pos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...preset.lookAt);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.055;
    this.controls.maxPolarAngle = Math.PI * 0.485;
    this.controls.minPolarAngle = 0.12;
    this.controls.minDistance = 4.2;
    this.controls.maxDistance = 26;
    this.controls.enableZoom = false; // Keep mouse-wheel dedicated to smooth page scroll
    this.controls.enablePan = false;
    this.controls.autoRotate = this.config.autoOrbit && !this.isSoftwareGl && !this.reducedMotion;
    this.controls.autoRotateSpeed = 0.55;
    this.controls.addEventListener('start', () => {
      // Cancel scripted camera preset glide immediately when user interacts
      this.cameraTransition.active = false;
      this.scrollChoreographyActive = false;
    });
    this.controls.update();
    this.renderer.domElement.style.touchAction = 'pan-y';

    // 3-Point Studio PBR Lighting + Softboxes
    this.keyLight = new THREE.DirectionalLight(theme.keyLightColor, theme.keyLightIntensity);
    this.keyLight.position.set(12, 18, 11);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    const d = 16;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 52;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    this.hemiLight = new THREE.HemisphereLight(
      theme.hemiSkyColor,
      theme.hemiGroundColor,
      theme.hemiIntensity,
    );
    this.scene.add(this.hemiLight);

    this.rimLight = new THREE.DirectionalLight(theme.rimLightColor, theme.rimLightIntensity);
    this.rimLight.position.set(-14, 9, -14);
    this.scene.add(this.rimLight);

    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxA = new THREE.RectAreaLight(0xfff1dd, 4.5, 8, 4);
      softboxA.position.set(7, 8, 7);
      softboxA.lookAt(0, 2.5, 0);
      this.scene.add(softboxA);
      this.rectLights.push(softboxA);

      const softboxB = new THREE.RectAreaLight(0x9bc7ff, 3.2, 8, 4);
      softboxB.position.set(-8, 6, -6);
      softboxB.lookAt(0, 2.5, 0);
      this.scene.add(softboxB);
      this.rectLights.push(softboxB);
    }

    // Procedural Textures & PBR Materials
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAnisotropy);
    this.materials = createMaterialLibrary(this.textures, this.isSoftwareGl);
    this.audio = new SpatialAudioSynth();

    // Sculpted Architectural Terrain Floor extending into horizon fog
    this.floorGeo = new THREE.PlaneGeometry(140, 140, 96, 96);
    this.floorGeo.rotateX(-Math.PI / 2);
    this.floorMesh = new THREE.Mesh(this.floorGeo, this.materials.floorMaterial);
    this.floorMesh.receiveShadow = true;
    this.floorMesh.position.y = 0;
    this.scene.add(this.floorMesh);

    // Soft radial contact shadow plane directly beneath central plinth (offset >= 0.02)
    this.contactShadowGeo = new THREE.PlaneGeometry(9.2, 9.2);
    this.contactShadowGeo.rotateX(-Math.PI / 2);
    this.contactShadowMesh = new THREE.Mesh(this.contactShadowGeo, this.materials.contactShadowMaterial);
    this.contactShadowMesh.position.y = 0.025;
    this.contactShadowMesh.renderOrder = 1;
    this.scene.add(this.contactShadowMesh);

    // Hero Composite 10-Part Kinetic Orrery
    this.orrery = createKineticOrrery(this.materials);
    this.scene.add(this.orrery.group);

    // 4 Composite Interactive Orbiting Beacons
    for (let i = 0; i < 4; i++) {
      const beacon = createOrbitingBeacon(i, this.materials);
      this.beacons.push(beacon);
      this.beaconProxies.push(beacon.hitProxy);
      this.scene.add(beacon.group);
    }

    // InstancedMesh Interactive Monolith Field (225 beveled pillars)
    this.monolithField = createMonolithField(this.materials);
    this.scene.add(this.monolithField.mesh);

    // InstancedMesh Atmospheric Motes
    this.motes = createAtmosphericMotes(this.materials);
    this.scene.add(this.motes.mesh);

    // Apply initial config
    this.materials.applyFinish(this.config.finish);
    this.materials.applyAtmosphere(this.config.atmosphere);

    // Pre-warm shaders on GPU
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Event bindings
    this.boundResize = this.handleResize.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundPointerLeave = this.handlePointerLeave.bind(this);
    this.boundContextLost = (e: Event) => {
      e.preventDefault();
      this.callbacks.onContextLostChange(true);
    };
    this.boundContextRestored = () => {
      this.callbacks.onContextLostChange(false);
    };

    window.addEventListener('resize', this.boundResize);
    window.addEventListener('pointermove', this.boundPointerMove);
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.boundPointerDown);
    dom.addEventListener('pointerup', this.boundPointerUp);
    dom.addEventListener('pointerleave', this.boundPointerLeave);
    dom.addEventListener('webglcontextlost', this.boundContextLost);
    dom.addEventListener('webglcontextrestored', this.boundContextRestored);

    this.lastTimestamp = performance.now();
    this.tick();
  }

  public updateConfig(next: SceneConfig): void {
    const prev = this.config;
    this.config = { ...next };

    if (prev.finish !== next.finish) {
      this.materials.applyFinish(next.finish);
    }
    if (prev.atmosphere !== next.atmosphere) {
      this.materials.applyAtmosphere(next.atmosphere);
      const theme = ATMOSPHERE_THEMES[next.atmosphere];
      this.keyLight.color.setHex(theme.keyLightColor);
      this.keyLight.intensity = theme.keyLightIntensity;
      this.hemiLight.color.setHex(theme.hemiSkyColor);
      this.hemiLight.groundColor.setHex(theme.hemiGroundColor);
      this.hemiLight.intensity = theme.hemiIntensity;
      this.rimLight.color.setHex(theme.rimLightColor);
      this.rimLight.intensity = theme.rimLightIntensity;
    }
    if (prev.cameraPreset !== next.cameraPreset) {
      this.flyToPreset(next.cameraPreset);
    }
    if (prev.autoOrbit !== next.autoOrbit) {
      this.controls.autoRotate = next.autoOrbit && !this.isSoftwareGl && !this.reducedMotion;
    }
    if (prev.soundEnabled !== next.soundEnabled) {
      this.audio.setEnabled(next.soundEnabled);
    }
    if (prev.waveEnergy !== next.waveEnergy) {
      this.audio.modulateFilter(next.waveEnergy);
    }
  }

  public setScrollProgress(progress: number): void {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    if (Math.abs(clamped - this.scrollTargetProgress) > 0.002) {
      this.scrollTargetProgress = clamped;
      this.scrollChoreographyActive = true;
      this.cameraTransition.active = false;
    }
  }

  public flyToPreset(presetId: CameraPresetId): void {
    const preset = CAMERA_PRESETS[presetId];
    this.cameraTransition.pos.set(...preset.pos);
    this.cameraTransition.lookAt.set(...preset.lookAt);
    this.cameraTransition.active = true;
    this.scrollChoreographyActive = false;
    this.selectedBeaconIndex = null;
    this.callbacks.onBeaconSelect(null);
  }

  public triggerRadialPulse(x = 0, z = 0, strength = 1.35): void {
    this.shockwaves.push({ x, z, age: 0, strength });
    if (this.shockwaves.length > 6) {
      this.shockwaves.shift();
    }
    this.audio.playImpulseChime(293.66 + Math.random() * 110, strength);
  }

  private handleResize(): void {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth || window.innerWidth);
    const height = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  }

  private updatePointerNdc(e: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handlePointerMove(e: PointerEvent): void {
    this.updatePointerNdc(e);
    this.pointerActive = true;

    _raycaster.layers.set(0);
    _raycaster.setFromCamera(_pointerNdc, this.camera);
    if (_raycaster.ray.intersectPlane(_groundPlane, _hitPoint)) {
      this.pointerTargetWorld.set(
        THREE.MathUtils.clamp(_hitPoint.x, -22, 22),
        THREE.MathUtils.clamp(_hitPoint.z, -22, 22),
      );
    }

    // Throttled layer-1 raycast for interactive beacons
    const now = performance.now();
    if (now - this.lastHoverCheckMs < 48) return;
    this.lastHoverCheckMs = now;

    _raycaster.layers.set(1);
    _raycaster.setFromCamera(_pointerNdc, this.camera);
    const hits = _raycaster.intersectObjects(this.beaconProxies, false);

    const nextHover = hits.length > 0 ? (hits[0].object.userData.beaconIndex as number) : null;
    if (nextHover !== this.hoveredBeaconIndex) {
      this.hoveredBeaconIndex = nextHover;
      this.renderer.domElement.style.cursor = nextHover !== null ? 'pointer' : 'grab';
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    this.pointerDownPos.x = e.clientX;
    this.pointerDownPos.y = e.clientY;
    if (this.hoveredBeaconIndex === null) {
      this.renderer.domElement.style.cursor = 'grabbing';
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    this.renderer.domElement.style.cursor = this.hoveredBeaconIndex !== null ? 'pointer' : 'grab';
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dist > 6) return; // Was an orbit/pan drag, not a click

    this.updatePointerNdc(e);

    // First test interactive beacon proxies on layer 1
    _raycaster.layers.set(1);
    _raycaster.setFromCamera(_pointerNdc, this.camera);
    const beaconHits = _raycaster.intersectObjects(this.beaconProxies, false);

    if (beaconHits.length > 0) {
      const idx = beaconHits[0].object.userData.beaconIndex as number;
      this.selectedBeaconIndex = idx;
      const info = BEACON_METADATA[idx];
      this.callbacks.onBeaconSelect(info);

      const beaconPos = this.beacons[idx].group.position;
      this.shockwaves.push({ x: beaconPos.x, z: beaconPos.z, age: 0, strength: 1.5 });
      this.audio.playImpulseChime(info.frequencyHz, 1.2);

      // Glide camera smoothly toward a clean framing angle on the selected beacon
      _vec3.copy(beaconPos).normalize();
      this.cameraTransition.pos.set(
        beaconPos.x + _vec3.x * 4.2 + 1.4,
        beaconPos.y + 1.5,
        beaconPos.z + _vec3.z * 4.2 + 1.4,
      );
      this.cameraTransition.lookAt.set(beaconPos.x * 0.55, beaconPos.y * 0.85, beaconPos.z * 0.55);
      this.cameraTransition.active = true;
      return;
    }

    // Otherwise launch a 3D radial shockwave at clicked ground coordinate
    _raycaster.layers.set(0);
    _raycaster.setFromCamera(_pointerNdc, this.camera);
    if (_raycaster.ray.intersectPlane(_groundPlane, _hitPoint)) {
      this.triggerRadialPulse(
        THREE.MathUtils.clamp(_hitPoint.x, -18, 18),
        THREE.MathUtils.clamp(_hitPoint.z, -18, 18),
        1.4,
      );
    }
  }

  private handlePointerLeave(): void {
    this.pointerActive = false;
    this.hoveredBeaconIndex = null;
    this.renderer.domElement.style.cursor = 'grab';
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const rawDt = Math.min(0.05, Math.max(0.001, (now - this.lastTimestamp) / 1000));
    this.lastTimestamp = now;
    const motionScale = this.reducedMotion ? 0.15 : 1.0;
    const dt = rawDt * motionScale;
    this.elapsed += dt;

    // 1. Exponential damping for scene theme bg & fog
    const theme = ATMOSPHERE_THEMES[this.config.atmosphere];
    _bgTarget.setHex(theme.bgColor);
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.lerp(_bgTarget, 1 - Math.exp(-5 * rawDt));
    }
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(this.scene.background as THREE.Color);
      this.scene.fog.density = THREE.MathUtils.damp(
        this.scene.fog.density,
        theme.fogDensity,
        5,
        rawDt,
      );
    }

    // 2. Smoothly damp pointer world coordinate
    this.pointerWorld.x = THREE.MathUtils.damp(
      this.pointerWorld.x,
      this.pointerActive ? this.pointerTargetWorld.x : 0,
      7.5,
      rawDt,
    );
    this.pointerWorld.y = THREE.MathUtils.damp(
      this.pointerWorld.y,
      this.pointerActive ? this.pointerTargetWorld.y : 0,
      7.5,
      rawDt,
    );

    // 3. Smoothly damp exploded view separation
    this.currentExplode = THREE.MathUtils.damp(this.currentExplode, this.config.explode, 6.5, rawDt);

    // 4. Animate Hero Kinetic Orrery & Explode Layers
    const energy = 0.35 + this.config.waveEnergy * 0.75;
    const ptrTiltX = this.pointerActive ? _pointerNdc.y * 0.12 : 0;
    const ptrTiltZ = this.pointerActive ? -_pointerNdc.x * 0.12 : 0;

    this.orrery.outerGimbal.rotation.y += dt * 0.24 * energy;
    this.orrery.outerGimbal.rotation.x = THREE.MathUtils.damp(
      this.orrery.outerGimbal.rotation.x,
      Math.sin(this.elapsed * 0.45) * 0.28 + ptrTiltX,
      4.5,
      rawDt,
    );
    this.orrery.outerGimbal.position.y = 3.05 + this.currentExplode * 0.75;

    this.orrery.innerGimbal.rotation.x += dt * 0.36 * energy;
    this.orrery.innerGimbal.rotation.z = THREE.MathUtils.damp(
      this.orrery.innerGimbal.rotation.z,
      Math.cos(this.elapsed * 0.55) * 0.42 + ptrTiltZ,
      4.5,
      rawDt,
    );
    this.orrery.innerGimbal.position.y = 3.05 + this.currentExplode * 1.45;

    this.orrery.harmonicArmAssembly.rotation.y -= dt * 0.42 * energy;
    this.orrery.harmonicArmAssembly.position.y = 3.05 + this.currentExplode * 2.15;

    this.orrery.coreAssembly.position.y =
      3.05 + Math.sin(this.elapsed * 1.4) * 0.08 + this.currentExplode * 2.85;
    this.orrery.coreCrystal.rotation.y += dt * 0.65;
    this.orrery.coreCrystal.rotation.x += dt * 0.28;
    const domeScale = 1 + this.currentExplode * 0.22;
    this.orrery.containmentDome.scale.setScalar(domeScale);

    // 5. Update 4 Composite Orbiting Beacons
    for (let i = 0; i < this.beacons.length; i++) {
      const b = this.beacons[i];
      const angle = b.baseAngle + this.elapsed * b.orbitSpeed * energy;
      const radius = b.orbitRadius + this.currentExplode * 1.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = b.baseHeight + Math.sin(this.elapsed * 1.3 + b.bobPhase) * 0.32 + this.currentExplode * 0.6;

      b.group.position.set(x, y, z);
      b.group.rotation.y = -angle + Math.PI / 2;
      b.ringMesh.rotation.z += dt * 0.8;

      const isActive = this.hoveredBeaconIndex === i || this.selectedBeaconIndex === i;
      b.lensMesh.material = isActive ? this.materials.beaconLensActive : this.materials.beaconLens;
      const targetScale = isActive ? 1.22 : 1.0;
      b.group.scale.setScalar(THREE.MathUtils.damp(b.group.scale.x, targetScale, 10, rawDt));
    }

    // 6. Advance active radial shockwaves & update InstancedMesh Monolith Field (zero GC)
    for (let s = this.shockwaves.length - 1; s >= 0; s--) {
      this.shockwaves[s].age += rawDt;
      if (this.shockwaves[s].age > 3.6) {
        this.shockwaves.splice(s, 1);
      }
    }

    _baseColor.setHex(theme.pillarBaseColor);
    _hiColor.setHex(theme.pillarHighlightColor);

    const instances = this.monolithField.instances;
    const mesh = this.monolithField.mesh;
    const waveEnergy = this.config.waveEnergy;

    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];

      // Ambient standing wave
      const ambient =
        Math.sin(inst.radialDist * 0.55 - this.elapsed * 1.35 + inst.phase * 0.4) *
        0.38 *
        waveEnergy;

      // Cursor magnetic lift
      const dx = inst.x - this.pointerWorld.x;
      const dz = inst.z - this.pointerWorld.y;
      const ptrDistSq = dx * dx + dz * dz;
      const ptrInfluence = this.pointerActive ? Math.exp(-ptrDistSq * 0.085) : 0;
      const cursorLift = ptrInfluence * 1.45 * (0.5 + waveEnergy * 0.6);

      // Shockwave rings
      let shockLift = 0;
      for (let s = 0; s < this.shockwaves.length; s++) {
        const sw = this.shockwaves[s];
        const sDist = Math.hypot(inst.x - sw.x, inst.z - sw.z);
        const waveFront = sw.age * 7.8;
        const delta = sDist - waveFront;
        const band = Math.exp(-(delta * delta) * 0.38);
        const decay = Math.exp(-sw.age * 0.85);
        shockLift += band * decay * sw.strength * 1.55;
      }

      const h = Math.max(0.18, inst.baseHeight + ambient + cursorLift + shockLift);

      // Subtle tilt away/toward cursor
      if (ptrInfluence > 0.02) {
        _tiltAxis.set(-dz, 0, dx).normalize();
        _quat.setFromAxisAngle(_tiltAxis, ptrInfluence * 0.14);
      } else {
        _quat.identity();
      }

      _vec3.set(inst.x, 0, inst.z);
      _vec3B.set(1, h, 1);
      _mat4.compose(_vec3, _quat, _vec3B);
      mesh.setMatrixAt(i, _mat4);

      const accentBlend = THREE.MathUtils.clamp(ptrInfluence * 0.72 + shockLift * 0.42, 0, 1);
      _color.copy(_baseColor).multiplyScalar(inst.baseTintFactor).lerp(_hiColor, accentBlend);
      mesh.setColorAt(i, _color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // 7. Update Atmospheric Motes (zero GC)
    const motePos = this.motes.positions;
    const moteSpeeds = this.motes.speeds;
    const moteScales = this.motes.scales;
    const moteCount = moteSpeeds.length;
    for (let i = 0; i < moteCount; i++) {
      const i3 = i * 3;
      const sp = moteSpeeds[i];
      const y = ((motePos[i3 + 1] + this.elapsed * 0.18 * sp) % 8.5) + 0.5;
      const x = motePos[i3] + Math.sin(this.elapsed * 0.4 * sp + i) * 0.45;
      const z = motePos[i3 + 2] + Math.cos(this.elapsed * 0.35 * sp + i) * 0.45;

      _vec3.set(x, y, z);
      _euler.set(this.elapsed * sp, this.elapsed * 0.7 * sp, 0);
      _quat.setFromEuler(_euler);
      _vec3B.setScalar(moteScales[i]);
      _mat4.compose(_vec3, _quat, _vec3B);
      this.motes.mesh.setMatrixAt(i, _mat4);
    }
    this.motes.mesh.instanceMatrix.needsUpdate = true;

    // 8. Update floor onBeforeCompile shader uniforms
    this.materials.updateShaderTime(
      this.elapsed,
      waveEnergy,
      this.pointerWorld.x,
      this.pointerWorld.y,
    );

    // 9. Smooth Damped Camera Transition, Scroll Choreography & Optional Parallax
    this.scrollCurrentProgress = THREE.MathUtils.damp(
      this.scrollCurrentProgress,
      this.scrollTargetProgress,
      4.5,
      rawDt,
    );

    if (this.cameraTransition.active) {
      const k = 4.8;
      const factor = 1 - Math.exp(-k * rawDt);
      this.camera.position.lerp(this.cameraTransition.pos, factor);
      this.controls.target.lerp(this.cameraTransition.lookAt, factor);
      if (
        this.camera.position.distanceTo(this.cameraTransition.pos) < 0.04 &&
        this.controls.target.distanceTo(this.cameraTransition.lookAt) < 0.04
      ) {
        this.cameraTransition.active = false;
      }
    } else if (this.scrollChoreographyActive && !this.config.autoOrbit) {
      // Smoothly sweep camera along a scenic arc as the user scrolls from Hero/About to Contact
      const p = this.scrollCurrentProgress;
      const arcAngle = 0.85 + p * 1.95;
      const radius = 17.5 - Math.sin(p * Math.PI) * 6.5;
      const height = 6.8 - Math.sin(p * Math.PI * 0.85) * 3.4 + p * 3.2;

      _vec3.set(
        Math.cos(arcAngle) * radius,
        height,
        Math.sin(arcAngle) * radius,
      );
      _vec3B.set(
        Math.sin(p * Math.PI) * -1.4,
        2.3 + p * 0.6,
        0,
      );

      const factor = 1 - Math.exp(-5.0 * rawDt);
      this.camera.position.lerp(_vec3, factor);
      this.controls.target.lerp(_vec3B, factor);
    } else if (this.config.parallaxEnabled && this.pointerActive && !this.reducedMotion) {
      // Subtle damped parallax offset around current orbit lookAt
      const parallaxStrength = 0.018;
      this.controls.target.x = THREE.MathUtils.damp(
        this.controls.target.x,
        _pointerNdc.x * 1.1,
        3.5,
        rawDt,
      );
      this.controls.target.y = THREE.MathUtils.damp(
        this.controls.target.y,
        2.3 + _pointerNdc.y * 0.55,
        3.5,
        rawDt,
      );
      this.camera.position.x += _pointerNdc.x * parallaxStrength * rawDt * 20;
    }

    // Subtle scroll-linked breathing on central sculpture
    this.orrery.group.rotation.y = this.scrollCurrentProgress * 0.65;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('pointermove', this.boundPointerMove);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.boundPointerDown);
    dom.removeEventListener('pointerup', this.boundPointerUp);
    dom.removeEventListener('pointerleave', this.boundPointerLeave);
    dom.removeEventListener('webglcontextlost', this.boundContextLost);
    dom.removeEventListener('webglcontextrestored', this.boundContextRestored);

    this.controls.dispose();
    this.audio.dispose();
    this.textures.dispose();
    this.materials.dispose();
    this.envTexture.dispose();

    this.floorGeo.dispose();
    this.contactShadowGeo.dispose();
    this.orrery.disposables.forEach((g) => g.dispose());
    this.beacons.forEach((b) => {
      b.disposables.forEach((g) => g.dispose());
      (b.hitProxy.material as THREE.Material).dispose();
    });
    this.monolithField.geometry.dispose();
    this.motes.geometry.dispose();

    this.renderer.dispose();
    if (dom.parentNode === this.container) {
      this.container.removeChild(dom);
    }
  }
}
