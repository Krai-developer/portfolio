import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildStudioEnvironment } from './buildEnvironment';
import { buildHolographicLayer } from './buildHolograms';
import { buildWorkstation } from './buildWorkstation';
import {
  CameraPreset,
  computePanelParallaxTransform,
  computeScrollCameraPose,
  dampValue,
  MouseNdc,
} from './heroKinematics';

export interface SceneControllerCallbacks {
  onHoverPanel?: (label: string | null) => void;
  onWebglError?: () => void;
}

export interface WorkspaceSceneApi {
  setScrollProgress: (progress: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setReducedMotion: (reduced: boolean) => void;
  setPaused: (paused: boolean) => void;
  setMouseNdc: (x: number, y: number) => void;
  dispose: () => void;
}

// Pre-allocated scratch math helpers outside the render loop (zero GC churn)
const _rayMouse = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Mounts and drives the cinematic 3D developer workspace inside a stable DOM container.
 * Uses GPU EffectComposer + selective UnrealBloomPass on hardware GPUs while rendering
 * single-pass SDF luminous shaders cleanly via fenceSync `afterDraw()` on software WebGL.
 */
export function mountWorkspaceScene(
  container: HTMLDivElement,
  initialReducedMotion: boolean,
  callbacks: SceneControllerCallbacks = {},
): WorkspaceSceneApi {
  const isSoftwareGl = detectSoftwareWebGL();

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
  } catch {
    callbacks.onWebglError?.();
    return {
      setScrollProgress: () => {},
      setCameraPreset: () => {},
      setReducedMotion: () => {},
      setPaused: () => {},
      setMouseNdc: () => {},
      dispose: () => {},
    };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const initWidth = Math.max(container.clientWidth, 320);
  const initHeight = Math.max(container.clientHeight, 320);
  renderer.setSize(initWidth, initHeight, false);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Velvety midnight sapphire-blue atmosphere matching the reference image
  scene.background = new THREE.Color(0x030d20);
  const fog = new THREE.FogExp2(0x04142c, 0.034);
  scene.fog = fog;

  // Procedural studio reflection environment map (RoomEnvironment + PMREMGenerator)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.24;
  pmremGenerator.dispose();

  const camera = new THREE.PerspectiveCamera(46, initWidth / initHeight, 0.1, 45);
  const isCompactInit = initWidth / Math.max(initHeight, 1) < 1.15;
  camera.position.set(
    isCompactInit ? -0.32 : -1.18,
    isCompactInit ? 1.68 : 1.66,
    isCompactInit ? 7.8 : 6.45,
  );

  // Constrained OrbitControls so users can smoothly drag to inspect the 3D workspace
  // while keeping mouse-wheel dedicated to smooth portfolio scrolling
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(isCompactInit ? 0.0 : -0.15, 1.62, -0.24);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.62;
  controls.minDistance = 4.2;
  controls.maxDistance = isCompactInit ? 8.6 : 7.8;
  controls.minPolarAngle = Math.PI * 0.37;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.minAzimuthAngle = -Math.PI * 0.26;
  controls.maxAzimuthAngle = Math.PI * 0.14;
  controls.update();
  renderer.domElement.style.touchAction = 'pan-y';

  let userOrbited = false;
  controls.addEventListener('start', () => {
    userOrbited = true;
  });

  // =========================================================================
  // SAPPHIRE-CYAN + WARM-AMBER CINEMATIC LIGHTING RIG
  // =========================================================================
  const hemiLight = new THREE.HemisphereLight(0x1e60a8, 0x030c1c, 0.78);
  scene.add(hemiLight);

  // Cool-cobalt architectural rim key illuminating chair back, desk bevel & mug
  const studioKeyLight = new THREE.DirectionalLight(0x52b6ff, 0.95);
  studioKeyLight.position.set(-2.5, 4.8, 3.6);
  studioKeyLight.target.position.set(0.2, 1.1, 0);
  scene.add(studioKeyLight.target);
  if (!isSoftwareGl) {
    studioKeyLight.castShadow = true;
    studioKeyLight.shadow.mapSize.set(1024, 1024);
    studioKeyLight.shadow.camera.left = -3.8;
    studioKeyLight.shadow.camera.right = 3.8;
    studioKeyLight.shadow.camera.top = 3.8;
    studioKeyLight.shadow.camera.bottom = -2.2;
    studioKeyLight.shadow.camera.near = 1;
    studioKeyLight.shadow.camera.far = 14;
    studioKeyLight.shadow.bias = -0.0005;
    studioKeyLight.shadow.normalBias = 0.02;
  }
  scene.add(studioKeyLight);

  // Vivid electric-cyan light flooding outward from central monitor & glowing keyboard
  const cyanScreenLight = new THREE.PointLight(0x22d3ee, 7.6, 8.8, 1.55);
  cyanScreenLight.position.set(0.05, 1.48, 0.65);
  scene.add(cyanScreenLight);

  // Secondary holographic cyan glow washing upper structures & chair shoulders
  const cyanUpperLight = new THREE.PointLight(0x0ea5e9, 4.8, 9.5, 1.55);
  cyanUpperLight.position.set(0.15, 2.95, 0.75);
  scene.add(cyanUpperLight);

  // Warm amber accent lights near left vertical strip & right architectural shelves/orb
  const warmLeftAccent = new THREE.PointLight(0xff922b, 3.8, 6.2, 1.7);
  warmLeftAccent.position.set(-2.75, 2.35, -2.15);
  scene.add(warmLeftAccent);

  const warmRightAccent = new THREE.PointLight(0xff9a3c, 4.2, 6.5, 1.65);
  warmRightAccent.position.set(2.8, 1.85, -0.65);
  scene.add(warmRightAccent);

  // =========================================================================
  // ASSEMBLE 3D SUB-MODULES
  // =========================================================================
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const environment = buildStudioEnvironment(maxAniso, !isSoftwareGl);
  const workstation = buildWorkstation(maxAniso, !isSoftwareGl);
  const holograms = buildHolographicLayer(maxAniso);

  const heroRig = new THREE.Group();
  heroRig.add(workstation.group);
  heroRig.add(holograms.group);
  scene.add(environment.group);
  scene.add(heroRig);

  // GPU-only selective bloom post-processing (single-pass SDF bloom handles SwiftShader smoothly)
  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  if (!isSoftwareGl) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(initWidth, initHeight),
      0.42, // restrained cinematic halo
      0.55, // velvety spread
      0.62, // bloom luminous cyan rims & warm LEDs without washing text
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    renderer.compile(scene, camera);
  }

  // =========================================================================
  // MUTABLE KINEMATIC STATE
  // =========================================================================
  let scrollProgress = 0;
  let cameraPreset: CameraPreset = 'workspace';
  let reducedMotion = initialReducedMotion;
  let paused = false;
  let contextLost = false;
  let disposed = false;
  let renderedFrames = 0;

  const rawMouse: MouseNdc = { x: 0, y: 0 };
  const smoothMouse: MouseNdc = { x: 0, y: 0 };

  // Initialize camera immediately to the exact first-frame pose (no jump on first paint)
  const initialPose = computeScrollCameraPose(
    0,
    cameraPreset,
    initWidth / initHeight,
    { x: 0, y: 0 },
    reducedMotion,
  );
  camera.position.set(initialPose.position.x, initialPose.position.y, initialPose.position.z);
  camera.fov = initialPose.fov;
  camera.updateProjectionMatrix();
  const currentTarget = new THREE.Vector3(
    initialPose.target.x,
    initialPose.target.y,
    initialPose.target.z,
  );
  camera.lookAt(currentTarget);

  // Raycaster for subtle holographic panel hover highlights (throttled)
  const raycaster = new THREE.Raycaster();
  let hoveredPanelId: string | null = null;
  let lastRaycastTs = 0;

  const updateHover = (ndcX: number, ndcY: number) => {
    const now = performance.now();
    if (now - lastRaycastTs < 65 || isSoftwareGl) return;
    lastRaycastTs = now;
    _rayMouse.set(ndcX, ndcY);
    raycaster.setFromCamera(_rayMouse, camera);
    const hits = raycaster.intersectObjects(holograms.interactables, false);
    const nextId = hits.length > 0 ? String(hits[0].object.userData.holoId || '') : null;
    if (nextId !== hoveredPanelId) {
      hoveredPanelId = nextId;
      const nextLabel =
        hits.length > 0 ? String(hits[0].object.userData.holoLabel || '') : null;
      callbacks.onHoverPanel?.(nextLabel);
    }
  };

  // =========================================================================
  // ANIMATION LOOP (60fps GPU rAF vs software-WebGL fenceSync `afterDraw`)
  // =========================================================================
  let frameId = 0;
  let lastTs = performance.now();
  let simElapsed = 0;

  function renderFrame() {
    if (disposed || contextLost) return;
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    renderedFrames += 1;
    if (renderedFrames === 1 || renderedFrames % 10 === 0) {
      container.dataset.frames = String(renderedFrames);
    }
  }

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      frameId = window.setTimeout(cb, 85);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      frameId = window.setTimeout(cb, 85);
      return;
    }
    gl.flush();
    let polls = 0;
    const poll = () => {
      if (disposed) {
        gl.deleteSync(sync);
        return;
      }
      polls += 1;
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED && polls < 24) {
        frameId = window.setTimeout(poll, 6);
      } else {
        gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 6);
  }

  function stepScene(dt: number) {
    if (!paused && !reducedMotion) {
      simElapsed += dt;
    }

    // Smooth mouse NDC with exponential damping
    smoothMouse.x = dampValue(smoothMouse.x, rawMouse.x, 5.5, dt);
    smoothMouse.y = dampValue(smoothMouse.y, rawMouse.y, 5.5, dt);

    // 1. Camera pose & lighting atmosphere choreography
    const desired = computeScrollCameraPose(
      scrollProgress,
      cameraPreset,
      camera.aspect,
      smoothMouse,
      reducedMotion,
    );

    if (userOrbited) {
      controls.update();
    } else {
      const camLambda = isSoftwareGl ? 10 : 5.2;
      camera.position.x = dampValue(camera.position.x, desired.position.x, camLambda, dt);
      camera.position.y = dampValue(camera.position.y, desired.position.y, camLambda, dt);
      camera.position.z = dampValue(camera.position.z, desired.position.z, camLambda, dt);

      currentTarget.x = dampValue(currentTarget.x, desired.target.x, camLambda, dt);
      currentTarget.y = dampValue(currentTarget.y, desired.target.y, camLambda, dt);
      currentTarget.z = dampValue(currentTarget.z, desired.target.z, camLambda, dt);
      controls.target.copy(currentTarget);
      controls.update();

      const nextFov = dampValue(camera.fov, desired.fov, 5.0, dt);
      if (Math.abs(nextFov - camera.fov) > 0.01) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }

    // Smooth lighting & fog depth changes across scroll + subtle idle breathing
    const idlePulse = reducedMotion ? 0 : Math.sin(simElapsed * 1.4) * 0.22;
    cyanScreenLight.intensity = 7.6 * desired.cyanLightMultiplier + idlePulse;
    cyanUpperLight.intensity = 4.8 * desired.cyanLightMultiplier - idlePulse * 0.5;
    warmRightAccent.intensity = 4.2 * desired.amberLightMultiplier;
    fog.density = dampValue(fog.density, desired.fogDensity, 4.0, dt);

    // 2. Central monitor SDF scanline shader & luminous holographic keyboard shader
    workstation.monitorScanUniforms.uTime.value = simElapsed;
    workstation.keyboardGlowUniforms.uTime.value = simElapsed;

    // 3. Holographic floating SDF glass panels parallax + scanning shader
    for (const panel of holograms.panels) {
      const xform = computePanelParallaxTransform(
        panel.basePos,
        panel.baseRot,
        smoothMouse,
        scrollProgress,
        panel.depthFactor,
        simElapsed,
        panel.phase,
        reducedMotion,
      );
      panel.group.position.x = dampValue(panel.group.position.x, xform.position.x, 6.0, dt);
      panel.group.position.y = dampValue(panel.group.position.y, xform.position.y, 6.0, dt);
      panel.group.position.z = dampValue(panel.group.position.z, xform.position.z, 6.0, dt);

      panel.group.rotation.x = dampValue(panel.group.rotation.x, xform.rotation.x, 6.0, dt);
      panel.group.rotation.y = dampValue(panel.group.rotation.y, xform.rotation.y, 6.0, dt);

      panel.shaderUniforms.uTime.value = simElapsed + panel.phase;
      const hoverTarget = hoveredPanelId === panel.id ? 1 : 0;
      panel.shaderUniforms.uHover.value = dampValue(
        panel.shaderUniforms.uHover.value,
        hoverTarget,
        8.0,
        dt,
      );
    }

    // 4. Independent AI geometric structure rotations, float & occasional light pulses
    for (const st of holograms.structures) {
      const floatOff = reducedMotion ? 0 : Math.sin(simElapsed * 1.05 + st.phase) * 0.068;
      const scrollLift = scrollProgress * 0.3;
      st.group.position.set(
        st.basePos.x + (reducedMotion ? 0 : smoothMouse.x * 0.14),
        st.basePos.y + floatOff + scrollLift,
        st.basePos.z + scrollProgress * 0.22,
      );

      if (!reducedMotion && !paused) {
        st.outerMesh.rotation.x += st.spinSpeed.x * dt;
        st.outerMesh.rotation.y += st.spinSpeed.y * dt;
        st.outerMesh.rotation.z += st.spinSpeed.z * dt;

        st.innerMesh.rotation.x -= st.spinSpeed.y * 1.15 * dt;
        st.innerMesh.rotation.y += st.spinSpeed.x * 1.35 * dt;
      }

      const pulseWave = reducedMotion
        ? 0.45
        : Math.pow(0.5 + 0.5 * Math.sin(simElapsed * 1.65 + st.phase), 3);
      const coreScale = (st.isWarm ? 0.96 : 1.02) + pulseWave * 0.22;
      st.coreMesh.scale.setScalar(coreScale);
      const glowScale = (st.isWarm ? 1.08 : 1.14) + pulseWave * 0.34;
      st.coreGlow.scale.set(glowScale, glowScale, 1);
    }

    // 5. Ethereal dotted neural trails, vertical data-rain projection, and bokeh dust
    holograms.neuralUniforms.uTime.value = simElapsed;
    holograms.dustUniforms.uTime.value = simElapsed;
    holograms.beamUniforms.uTime.value = simElapsed;
  }

  // =========================================================================
  // RESIZE & CONTEXT RECOVERY LISTENERS
  // =========================================================================
  const handleResize = () => {
    if (disposed) return;
    const w = Math.max(container.clientWidth, 320);
    const h = Math.max(container.clientHeight, 320);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    if (composer) {
      composer.setSize(w, h);
    }
    if (bloomPass) {
      bloomPass.resolution.set(w, h);
    }
    renderFrame();
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
  };
  const onContextRestored = () => {
    contextLost = false;
    renderFrame();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  function tick() {
    if (disposed) return;
    const now = performance.now();
    const dt = Math.min((now - lastTs) / 1000, 0.1);
    lastTs = now;

    if (!contextLost) {
      stepScene(dt);
      renderFrame();
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  // Render first frame synchronously on mount so first paint is never blank
  stepScene(0.016);
  renderFrame();
  if (isSoftwareGl) {
    afterDraw(tick);
  } else {
    frameId = requestAnimationFrame(tick);
  }

  return {
    setScrollProgress: (progress: number) => {
      scrollProgress = Math.max(0, Math.min(1, progress));
    },
    setCameraPreset: (preset: CameraPreset) => {
      cameraPreset = preset;
    },
    setReducedMotion: (reduced: boolean) => {
      reducedMotion = reduced;
    },
    setPaused: (nextPaused: boolean) => {
      paused = nextPaused;
    },
    setMouseNdc: (x: number, y: number) => {
      rawMouse.x = x;
      rawMouse.y = y;
      updateHover(x, y);
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      composer?.dispose();
      environment.dispose();
      workstation.dispose();
      holograms.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
